"""
Sentinel AI - Road Damage Detection Model Comparison Script
Compares Model A (YOLOv8n baseline) vs Model B (YOLOv8m RDD2022) under identical inference conditions.
"""

import os
import sys
import time
import csv
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Ensure Ultralytics uses local writable config directory on Windows
os.environ["YOLO_CONFIG_DIR"] = os.path.abspath("backend/ai/.ultralytics")
import torch
from ultralytics import YOLO

# ---------------------------------------------------------
# 1. Configuration & Paths
# ---------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/ai
WORKSPACE_DIR = BASE_DIR.parent.parent            # project root

MODEL_A_PATH = BASE_DIR / "models" / "best.pt"
MODEL_B_PATH = BASE_DIR / "models" / "yolov8m_rdd2022.pt"

OUTPUT_DIR = BASE_DIR / "runs" / "comparison"
DIR_MODEL_A = OUTPUT_DIR / "model_a"
DIR_MODEL_B = OUTPUT_DIR / "model_b"
DIR_SIDE_BY_SIDE = OUTPUT_DIR / "side_by_side"
CSV_PATH = OUTPUT_DIR / "comparison_report.csv"
SUMMARY_CSV_PATH = OUTPUT_DIR / "comparison_summary.csv"

# Inference parameters (Strictly identical)
IMGSZ = 640
CONF_THRESH = 0.10
IOU_THRESH = 0.45
DEVICE = "cpu"

# Color palette for classes (R, G, B)
CLASS_COLORS = {
    "Longitudinal Crack": (59, 130, 246),   # Blue
    "Transverse Crack":   (249, 115, 22),   # Orange
    "Alligator Crack":    (168, 85, 247),   # Purple
    "Pothole":            (239, 68, 68),    # Red
    "Unknown":            (156, 163, 175)   # Gray
}

def normalize_class_name(raw_name: str) -> str:
    name_clean = str(raw_name).strip().lower().replace("_", " ")
    if "alligator" in name_clean:
        return "Alligator Crack"
    elif "longitudinal" in name_clean:
        return "Longitudinal Crack"
    elif "transverse" in name_clean:
        return "Transverse Crack"
    elif "pothole" in name_clean:
        return "Pothole"
    return str(raw_name)

def calculate_iou(box1, box2):
    """Calculate IoU between two [x1, y1, x2, y2] boxes."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter_area = max(0, x2 - x1) * max(0, y2 - y1)
    if inter_area == 0:
        return 0.0

    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union_area = area1 + area2 - inter_area
    if union_area <= 0:
        return 0.0
    return inter_area / union_area

def draw_boxes_on_image(image: Image.Image, detections: list, model_title: str, inference_ms: float) -> Image.Image:
    """Draw bounding boxes and metadata header onto a copy of the image."""
    img_draw = image.copy().convert("RGB")
    draw = ImageDraw.Draw(img_draw)

    # Try loading a basic font, fall back to default
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    w, h = img_draw.size

    # Draw header banner
    banner_height = 36
    draw.rectangle([(0, 0), (w, banner_height)], fill=(20, 24, 33))
    header_text = f"{model_title} | {len(detections)} detection(s) | {inference_ms:.1f}ms (CPU)"
    draw.text((10, 10), header_text, fill=(240, 245, 250), font=font)

    if not detections:
        # Badge indicating no detections
        badge_y1 = h - 35
        draw.rectangle([(0, badge_y1), (w, h)], fill=(30, 41, 59))
        draw.text((10, badge_y1 + 10), "No defects detected above 10% confidence", fill=(148, 163, 184), font=font)
        return img_draw

    for det in detections:
        box = det["box"]  # [x1, y1, x2, y2]
        cls_norm = det["normalized_class"]
        conf = det["raw_confidence"]
        color = CLASS_COLORS.get(cls_norm, CLASS_COLORS["Unknown"])

        # Bounding box border
        for offset in range(3):
            draw.rectangle(
                [(box[0] - offset, box[1] - offset), (box[2] + offset, box[3] + offset)],
                outline=color
            )

        # Label tag
        label_str = f"{cls_norm}: {conf:.1f}%"
        text_bbox = draw.textbbox((box[0], max(0, box[1] - 18)), label_str, font=font)
        draw.rectangle(
            [(text_bbox[0] - 2, text_bbox[1] - 2), (text_bbox[2] + 4, text_bbox[3] + 2)],
            fill=color
        )
        draw.text((text_bbox[0], text_bbox[1]), label_str, fill=(255, 255, 255), font=font)

    return img_draw

def create_side_by_side(img_a: Image.Image, img_b: Image.Image, title: str) -> Image.Image:
    """Combine two annotated images side by side into a single comparison canvas."""
    # Scale to match height if needed
    target_h = max(img_a.height, img_b.height)
    def resize_h(im, th):
        if im.height == th:
            return im
        tw = int(im.width * (th / im.height))
        return im.resize((tw, th), Image.Resampling.LANCZOS)

    ia = resize_h(img_a, target_h)
    ib = resize_h(img_b, target_h)

    total_w = ia.width + ib.width + 10
    total_h = target_h + 40

    canvas = Image.new("RGB", (total_w, total_h), (15, 23, 42))
    draw = ImageDraw.Draw(canvas)

    # Title
    draw.text((12, 12), f"Sentinel AI Model Evaluation: {title}", fill=(241, 245, 249))

    # Paste images
    canvas.paste(ia, (0, 40))
    canvas.paste(ib, (ia.width + 10, 40))

    return canvas

def main():
    print("=" * 80)
    print("SENTINEL AI: CONTROLLED MODEL PERFORMANCE EVALUATION (STEP 2)")
    print("=" * 80)

    # Create required output directories
    for d in [DIR_MODEL_A, DIR_MODEL_B, DIR_SIDE_BY_SIDE]:
        d.mkdir(parents=True, exist_ok=True)

    print(f"Device: {DEVICE} (CUDA available: {torch.cuda.is_available()})")
    print(f"Inference settings: imgsz={IMGSZ}, conf={CONF_THRESH}, iou={IOU_THRESH}\n")

    # Verify model checkpoints
    if not MODEL_A_PATH.exists():
        print(f"ERROR: Model A checkpoint not found at {MODEL_A_PATH}")
        sys.exit(1)
    if not MODEL_B_PATH.exists():
        print(f"ERROR: Model B checkpoint not found at {MODEL_B_PATH}")
        sys.exit(1)

    size_a_mb = MODEL_A_PATH.stat().st_size / (1024 * 1024)
    size_b_mb = MODEL_B_PATH.stat().st_size / (1024 * 1024)
    print(f"Loading Model A (Baseline): {MODEL_A_PATH.name} ({size_a_mb:.2f} MB)")
    model_a = YOLO(str(MODEL_A_PATH))
    print(f"  Classes ({len(model_a.names)}): {model_a.names}")

    print(f"\nLoading Model B (Candidate): {MODEL_B_PATH.name} ({size_b_mb:.2f} MB)")
    model_b = YOLO(str(MODEL_B_PATH))
    print(f"  Classes ({len(model_b.names)}): {model_b.names}\n")

    # Define test suite images
    test_images = [
        {
            "id": "user_alligator",
            "name": "User Alligator Crack",
            "filename": "user_alligator_crack.jpg",
            "path": BASE_DIR / "test_images" / "user_alligator_crack.jpg",
            "defect_category": "Alligator Crack",
            "description": "User uploaded alligator crack screenshot crop"
        },
        {
            "id": "test1",
            "name": "Test Image 1",
            "filename": "test1.jpg.png",
            "path": WORKSPACE_DIR / "test1.jpg.png",
            "defect_category": "Pothole",
            "description": "Road surface with potholes"
        },
        {
            "id": "test2",
            "name": "Test Image 2",
            "filename": "test2.jpg.png",
            "path": WORKSPACE_DIR / "test2.jpg.png",
            "defect_category": "Pothole",
            "description": "Severe deep pothole"
        },
        {
            "id": "test3",
            "name": "Test Image 3",
            "filename": "test3.jpg.png",
            "path": WORKSPACE_DIR / "test3.jpg.png",
            "defect_category": "Longitudinal Crack",
            "description": "Pavement with longitudinal crack"
        },
        {
            "id": "test4",
            "name": "Test Image 4",
            "filename": "test4.jpg.png",
            "path": WORKSPACE_DIR / "test4.jpg.png",
            "defect_category": "Alligator Crack",
            "description": "Pavement with alligator crack network"
        },
        {
            "id": "test5",
            "name": "Test Image 5",
            "filename": "test5.jpg.png",
            "path": WORKSPACE_DIR / "test5.jpg.png",
            "defect_category": "Pothole / Road Distress",
            "description": "Pavement distress with pothole degradation"
        },
        {
            "id": "clean_road",
            "name": "Clean Road (Negative Control)",
            "filename": "clean_road_synthetic.jpg",
            "path": BASE_DIR / "test_images" / "clean_road_synthetic.jpg",
            "defect_category": "None (Clean Road)",
            "description": "Synthesized uniform clean asphalt surface for false positive check"
        }
    ]

    # Warm up models on dummy tensor
    dummy = np.zeros((IMGSZ, IMGSZ, 3), dtype=np.uint8)
    model_a.predict(dummy, imgsz=IMGSZ, conf=CONF_THRESH, device=DEVICE, verbose=False)
    model_b.predict(dummy, imgsz=IMGSZ, conf=CONF_THRESH, device=DEVICE, verbose=False)

    detailed_rows = []
    summary_rows = []

    print("-" * 80)
    print(f"{'Image Name':<28} | {'Model A (Dets/Time)':<22} | {'Model B (Dets/Time)':<22}")
    print("-" * 80)

    for item in test_images:
        img_path = item["path"]
        if not img_path.exists():
            print(f"WARNING: Image not found: {img_path}")
            continue

        raw_img = Image.open(img_path).convert("RGB")
        w, h = raw_img.size

        # Model A Inference
        t0 = time.perf_counter()
        res_a = model_a.predict(raw_img, imgsz=IMGSZ, conf=CONF_THRESH, iou=IOU_THRESH, device=DEVICE, verbose=False)[0]
        time_a = (time.perf_counter() - t0) * 1000

        # Model B Inference
        t0 = time.perf_counter()
        res_b = model_b.predict(raw_img, imgsz=IMGSZ, conf=CONF_THRESH, iou=IOU_THRESH, device=DEVICE, verbose=False)[0]
        time_b = (time.perf_counter() - t0) * 1000

        # Parse detections for Model A
        dets_a = []
        for idx, b in enumerate(res_a.boxes):
            cls_id = int(b.cls[0])
            raw_cls = model_a.names[cls_id]
            norm_cls = normalize_class_name(raw_cls)
            conf = float(b.conf[0]) * 100
            box = [round(float(coord), 1) for coord in b.xyxy[0].tolist()]
            dets_a.append({
                "det_id": f"A_{idx+1}",
                "class_id": cls_id,
                "raw_class": raw_cls,
                "normalized_class": norm_cls,
                "raw_confidence": conf,
                "box": box
            })

        # Parse detections for Model B
        dets_b = []
        for idx, b in enumerate(res_b.boxes):
            cls_id = int(b.cls[0])
            raw_cls = model_b.names[cls_id]
            norm_cls = normalize_class_name(raw_cls)
            conf = float(b.conf[0]) * 100
            box = [round(float(coord), 1) for coord in b.xyxy[0].tolist()]
            dets_b.append({
                "det_id": f"B_{idx+1}",
                "class_id": cls_id,
                "raw_class": raw_cls,
                "normalized_class": norm_cls,
                "raw_confidence": conf,
                "box": box
            })

        # Categorize overlaps and uniqueness
        # Check pairwise IoU between Model A and Model B
        matched_a = set()
        matched_b = set()
        overlap_details = []

        for i, da in enumerate(dets_a):
            for j, db in enumerate(dets_b):
                iou = calculate_iou(da["box"], db["box"])
                if iou >= 0.30:
                    matched_a.add(i)
                    matched_b.add(j)
                    overlap_details.append({
                        "det_a": da,
                        "det_b": db,
                        "iou": iou
                    })

        # Annotate images
        annotated_a = draw_boxes_on_image(raw_img, dets_a, "Model A (YOLOv8n Baseline)", time_a)
        annotated_b = draw_boxes_on_image(raw_img, dets_b, "Model B (YOLOv8m Candidate)", time_b)

        # Save annotated images
        out_name = f"{item['id']}_annotated.jpg"
        annotated_a.save(DIR_MODEL_A / out_name, quality=95)
        annotated_b.save(DIR_MODEL_B / out_name, quality=95)

        # Save side-by-side
        side_img = create_side_by_side(annotated_a, annotated_b, item["name"])
        side_img.save(DIR_SIDE_BY_SIDE / f"{item['id']}_comparison.jpg", quality=95)

        # Record summary
        status_a = f"{len(dets_a)} ({time_a:.0f}ms)"
        status_b = f"{len(dets_b)} ({time_b:.0f}ms)"
        print(f"{item['name']:<28} | {status_a:<22} | {status_b:<22}")

        summary_rows.append({
            "image_id": item["id"],
            "image_name": item["name"],
            "filename": item["filename"],
            "width": w,
            "height": h,
            "defect_category": item["defect_category"],
            "model_a_detections": len(dets_a),
            "model_a_time_ms": round(time_a, 1),
            "model_a_classes": "; ".join([f"{d['normalized_class']} ({d['raw_confidence']:.1f}%)" for d in dets_a]) or "None",
            "model_b_detections": len(dets_b),
            "model_b_time_ms": round(time_b, 1),
            "model_b_classes": "; ".join([f"{d['normalized_class']} ({d['raw_confidence']:.1f}%)" for d in dets_b]) or "None",
            "overlapping_detections": len(overlap_details),
            "unique_to_a": len(dets_a) - len(matched_a),
            "unique_to_b": len(dets_b) - len(matched_b),
        })

        # Record detailed rows for Model A
        if not dets_a:
            detailed_rows.append({
                "image_name": item["name"],
                "filename": item["filename"],
                "width": w,
                "height": h,
                "model_name": "Model A (best.pt)",
                "architecture": "YOLOv8n",
                "inference_time_ms": round(time_a, 1),
                "detection_id": "None",
                "raw_class_name": "None",
                "normalized_class_name": "None",
                "raw_confidence_pct": 0.0,
                "box_x1": 0, "box_y1": 0, "box_x2": 0, "box_y2": 0,
                "comparison_category": "No Detection",
                "notes": "Potential Missed Detection" if item["id"] != "clean_road" else "True Negative (Clean Road)"
            })
        else:
            for idx, da in enumerate(dets_a):
                cat = "Agreement (Both Models)" if idx in matched_a else "Unique to Model A"
                notes = "Consistent with pothole dataset" if da["normalized_class"] == "Pothole" else ""
                detailed_rows.append({
                    "image_name": item["name"],
                    "filename": item["filename"],
                    "width": w,
                    "height": h,
                    "model_name": "Model A (best.pt)",
                    "architecture": "YOLOv8n",
                    "inference_time_ms": round(time_a, 1),
                    "detection_id": da["det_id"],
                    "raw_class_name": da["raw_class"],
                    "normalized_class_name": da["normalized_class"],
                    "raw_confidence_pct": round(da["raw_confidence"], 2),
                    "box_x1": da["box"][0], "box_y1": da["box"][1],
                    "box_x2": da["box"][2], "box_y2": da["box"][3],
                    "comparison_category": cat,
                    "notes": notes
                })

        # Record detailed rows for Model B
        if not dets_b:
            detailed_rows.append({
                "image_name": item["name"],
                "filename": item["filename"],
                "width": w,
                "height": h,
                "model_name": "Model B (yolov8m_rdd2022.pt)",
                "architecture": "YOLOv8m",
                "inference_time_ms": round(time_b, 1),
                "detection_id": "None",
                "raw_class_name": "None",
                "normalized_class_name": "None",
                "raw_confidence_pct": 0.0,
                "box_x1": 0, "box_y1": 0, "box_x2": 0, "box_y2": 0,
                "comparison_category": "No Detection",
                "notes": "Potential Missed Detection" if item["id"] != "clean_road" else "True Negative (Clean Road)"
            })
        else:
            for idx, db in enumerate(dets_b):
                cat = "Agreement (Both Models)" if idx in matched_b else "Unique to Model B"
                notes = "High confidence alligator crack" if db["normalized_class"] == "Alligator Crack" else ""
                detailed_rows.append({
                    "image_name": item["name"],
                    "filename": item["filename"],
                    "width": w,
                    "height": h,
                    "model_name": "Model B (yolov8m_rdd2022.pt)",
                    "architecture": "YOLOv8m",
                    "inference_time_ms": round(time_b, 1),
                    "detection_id": db["det_id"],
                    "raw_class_name": db["raw_class"],
                    "normalized_class_name": db["normalized_class"],
                    "raw_confidence_pct": round(db["raw_confidence"], 2),
                    "box_x1": db["box"][0], "box_y1": db["box"][1],
                    "box_x2": db["box"][2], "box_y2": db["box"][3],
                    "comparison_category": cat,
                    "notes": notes
                })

    # Write Detailed CSV
    with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "image_name", "filename", "width", "height", "model_name", "architecture",
            "inference_time_ms", "detection_id", "raw_class_name", "normalized_class_name",
            "raw_confidence_pct", "box_x1", "box_y1", "box_x2", "box_y2",
            "comparison_category", "notes"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(detailed_rows)

    # Write Summary CSV
    with open(SUMMARY_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        fieldnames = [
            "image_id", "image_name", "filename", "width", "height", "defect_category",
            "model_a_detections", "model_a_time_ms", "model_a_classes",
            "model_b_detections", "model_b_time_ms", "model_b_classes",
            "overlapping_detections", "unique_to_a", "unique_to_b"
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(summary_rows)

    print("-" * 80)
    print(f"\n[DONE] Controlled evaluation complete!")
    print(f"Visual outputs (Model A): {DIR_MODEL_A}")
    print(f"Visual outputs (Model B): {DIR_MODEL_B}")
    print(f"Side-by-side images:      {DIR_SIDE_BY_SIDE}")
    print(f"Detailed CSV Report:      {CSV_PATH}")
    print(f"Summary CSV Report:       {SUMMARY_CSV_PATH}")

if __name__ == "__main__":
    main()
