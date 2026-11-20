import os
from pathlib import Path

# Set YOLO_CONFIG_DIR before importing ultralytics to prevent AppData permission errors on Windows
CONFIG_DIR = Path(__file__).resolve().parents[2] / "ai" / ".ultralytics"
CONFIG_DIR.mkdir(parents=True, exist_ok=True)
os.environ["YOLO_CONFIG_DIR"] = str(CONFIG_DIR)

from PIL import Image
from ultralytics import YOLO

MODEL_PATH = Path(__file__).resolve().parents[2] / "ai" / "models" / "best.pt"

print("MODEL PATH:", MODEL_PATH)
if MODEL_PATH.exists():
    print("MODEL SIZE:", MODEL_PATH.stat().st_size)
    model = YOLO(str(MODEL_PATH))
else:
    print("WARNING: Model file not found at", MODEL_PATH)
    model = None

# Sentinel AI - Pothole Detection Service
# Model A: best.pt (YOLOv8n checkpoint)


def validate_pothole_class(yolo_model) -> int:
    """
    Validates that the loaded checkpoint contains a recognized 'Pothole' class
    and dynamically resolves its class ID.
    Prevents silent misclassification if an alternate checkpoint or class mapping is loaded.
    """
    if yolo_model is None or not hasattr(yolo_model, "names") or not yolo_model.names:
        raise RuntimeError("YOLO model has no class dictionary available for validation.")

    pothole_id = None
    for cid, name in yolo_model.names.items():
        clean = str(name).strip().lower().replace("_", " ")
        if clean == "pothole":
            pothole_id = int(cid)
            break

    if pothole_id is None:
        raise RuntimeError(
            f"Checkpoint validation failed: No 'Pothole' class found in model.names: {yolo_model.names}. "
            "Sentinel AI requires a checkpoint with an explicit Pothole class."
        )

    print(f"Validated Pothole class ID: {pothole_id} ('{yolo_model.names[pothole_id]}')")
    return pothole_id


# Dynamically resolve and validate class ID at service initialization
POTHOLE_CLASS_ID = validate_pothole_class(model) if model is not None else 3


def boxes_overlap(b1, b2, iou_thresh: float = 0.20, io_min_thresh: float = 0.35) -> bool:
    """
    Checks whether two bounding boxes overlap significantly.
    Guards against zero-area or inverted coordinates.
    """
    w1 = b1[2] - b1[0]
    h1 = b1[3] - b1[1]
    w2 = b2[2] - b2[0]
    h2 = b2[3] - b2[1]
    if w1 <= 0 or h1 <= 0 or w2 <= 0 or h2 <= 0:
        return False

    x1 = max(b1[0], b2[0])
    y1 = max(b1[1], b2[1])
    x2 = min(b1[2], b2[2])
    y2 = min(b1[3], b2[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    if inter == 0.0:
        return False

    a1 = w1 * h1
    a2 = w2 * h2
    union = a1 + a2 - inter
    iou = inter / union if union > 0 else 0.0
    io_min = inter / min(a1, a2)

    return iou >= iou_thresh or io_min >= io_min_thresh


def cluster_detections(detections, iou_thresh: float = 0.20, io_min_thresh: float = 0.35):
    """
    Groups connected overlapping bounding boxes into distinct spatial clusters
    using Disjoint Set Union (connected-component graph clustering).

    Guarantees:
    - Transitive connected-component merging: If Box A overlaps Box C and Box B overlaps Box C,
      all three connected overlapping boxes are merged into one cluster.
    - Zero-area safety: Invalid or zero-area bounding boxes are rejected.
    - Immutability: Detections and raw confidence values remain unmodified.

    Limitations:
    - 2D bounding-box abstraction: Rectangles approximate irregular pothole contours.
    - Lack of 3D depth perception: Cannot differentiate shallow superficial surface scuffs
      from deep vehicle-damaging potholes.
    - Spatial thresholding: Closely adjacent independent potholes may merge if boxes intersect.
    """
    if not detections:
        return []

    # Filter out invalid or zero-area detections safely
    valid_dets = []
    for d in detections:
        box = d.get("boundingBox", {})
        x1, y1 = float(box.get("x1", 0.0)), float(box.get("y1", 0.0))
        x2, y2 = float(box.get("x2", 0.0)), float(box.get("y2", 0.0))
        if (x2 - x1) > 0.0 and (y2 - y1) > 0.0:
            valid_dets.append(d)

    n = len(valid_dets)
    if n == 0:
        return []

    # Disjoint Set Union (Union-Find) with path compression
    parent = list(range(n))

    def find(i):
        path = []
        while parent[i] != i:
            path.append(i)
            i = parent[i]
        for node in path:
            parent[node] = i
        return i

    def union(i, j):
        root_i = find(i)
        root_j = find(j)
        if root_i != root_j:
            parent[root_i] = root_j

    boxes = [
        [
            float(d["boundingBox"]["x1"]),
            float(d["boundingBox"]["y1"]),
            float(d["boundingBox"]["x2"]),
            float(d["boundingBox"]["y2"])
        ]
        for d in valid_dets
    ]

    # Pairwise connected-component edge evaluation
    for i in range(n):
        for j in range(i + 1, n):
            if boxes_overlap(boxes[i], boxes[j], iou_thresh, io_min_thresh):
                union(i, j)

    # Group valid detections by their connected component root
    component_map = {}
    for i in range(n):
        root = find(i)
        if root not in component_map:
            component_map[root] = {
                "boxes": [],
                "detections": [],
                "max_conf": 0.0
            }
        component_map[root]["boxes"].append(boxes[i])
        component_map[root]["detections"].append(valid_dets[i])
        component_map[root]["max_conf"] = max(component_map[root]["max_conf"], valid_dets[i]["confidence"])

    return list(component_map.values())


def compute_severity(detections, max_confidence: float = 0.0) -> str:
    """
    Computes a provisional, rule-based visual inspection assessment
    derived exclusively from valid clustered detections.

    Severity Rules:
    - Critical: One cluster with maximum confidence >= 85%,
                OR at least two distinct clusters each having maximum confidence >= 75%.
    - High:     One cluster with maximum confidence >= 45%,
                OR at least two distinct clusters.
    - Medium:   At least one cluster with maximum confidence >= 15%.
    - Low:      No detections, no valid clusters, or detections below the Medium threshold (< 15%).

    IMPORTANT ARCHITECTURAL NOTE:
    - This is a heuristic visual triage rating based on 2D bounding boxes and raw confidence.
    - It does NOT represent measured physical road condition (such as crater depth,
      volumetric displacement, structural sub-base failure, or international roughness index).
    - Raw YOLO detection confidence is preserved separately and not conflated with severity.
    """
    if not detections:
        return "Low"

    clusters = cluster_detections(detections)
    if not clusters:
        return "Low"

    distinct_cluster_count = len(clusters)
    effective_max_conf = max(c["max_conf"] for c in clusters)

    # 1. Critical provisional priority:
    # One cluster with max confidence >= 85%, OR at least two distinct clusters each having max confidence >= 75%
    high_conf_clusters = sum(1 for c in clusters if c["max_conf"] >= 75.0)
    if effective_max_conf >= 85.0 or high_conf_clusters >= 2:
        return "Critical"

    # 2. High provisional priority:
    # One cluster with max confidence >= 45%, OR at least two distinct clusters
    if effective_max_conf >= 45.0 or distinct_cluster_count >= 2:
        return "High"

    # 3. Medium provisional priority:
    # At least one cluster with max confidence >= 15%
    if effective_max_conf >= 15.0:
        return "Medium"

    # 4. Low provisional priority:
    # Detections below Medium threshold (< 15%)
    return "Low"


def detect_damage(image: Image.Image, conf: float = 0.10, iou: float = 0.45):
    """
    Runs YOLO inference strictly filtered to Potholes (classes=[POTHOLE_CLASS_ID]).
    Preserves raw YOLO confidence values without artificial transformations.
    """
    if model is None:
        raise RuntimeError(f"YOLO model not loaded. Model path {MODEL_PATH} not found.")

    img_width, img_height = image.size

    # Filter inference strictly to validated Pothole class
    results = model.predict(
        source=image,
        conf=conf,
        iou=iou,
        classes=[POTHOLE_CLASS_ID],
        verbose=False
    )

    detections = []
    damage_counts = {}

    for result in results:
        boxes = result.boxes
        if boxes is None or len(boxes) == 0:
            continue

        for i in range(len(boxes)):
            class_id = int(boxes.cls[i])
            if class_id != POTHOLE_CLASS_ID:
                continue

            raw_confidence = float(boxes.conf[i])
            raw_name = model.names[class_id]
            clean_name = "Pothole"

            x1, y1, x2, y2 = [float(v) for v in boxes.xyxy[i].tolist()]

            # Normalized percentage coordinates for responsive UI overlays
            x_pct = round((x1 / img_width) * 100, 2)
            y_pct = round((y1 / img_height) * 100, 2)
            w_pct = round(((x2 - x1) / img_width) * 100, 2)
            h_pct = round(((y2 - y1) / img_height) * 100, 2)

            # Preserve raw YOLO model confidence percentage (no artificial curves)
            conf_pct = round(raw_confidence * 100, 2)

            detections.append({
                "id": f"det-{i + 1}",
                "damageType": clean_name,
                "rawClass": raw_name,
                "confidence": conf_pct,
                "boundingBox": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2)
                },
                "normalizedBox": {
                    "x": x_pct,
                    "y": y_pct,
                    "width": w_pct,
                    "height": h_pct
                }
            })

            damage_counts[clean_name] = damage_counts.get(clean_name, 0) + 1

    # Sort detections by confidence descending
    detections.sort(key=lambda d: d["confidence"], reverse=True)

    max_confidence = detections[0]["confidence"] if detections else 0.0
    primary_defect = "Pothole" if detections else "No potholes detected"
    severity = compute_severity(detections, max_confidence)
    distinct_clusters = len(cluster_detections(detections))

    return {
        "detections": detections,
        "count": len(detections),
        "summary": {
            "primaryDefect": primary_defect,
            "maxConfidence": max_confidence,
            "severity": severity,
            "distinctPotholeClusters": distinct_clusters,
            "severityAssessmentType": "Provisional Rule-Based Triage",
            "damageCounts": damage_counts,
            "assessmentNote": (
                "Provisional visual inspection triage based on 2D bounding boxes and raw confidence."
                if detections
                else "No surface potholes detected above operational threshold (10%). "
                     "This visual scan does not certify structural road integrity or rule out unmodeled defects."
            )
        }
    }
