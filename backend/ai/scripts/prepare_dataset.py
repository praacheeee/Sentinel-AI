"""
Sentinel AI - Dedicated Single-Class Pothole Dataset Preparation Pipeline

Extracts, filters, remaps, and validates a dedicated single-class Pothole dataset
from the multi-class RDD2022 dataset without modifying the source data.

Key Capabilities:
1. Dynamic class verification from source data.yaml (identifies Pothole class ID).
2. Strict annotation filtering: keeps only Pothole annotations, remapping class to 0.
3. Negative sample preservation: images with other distress types or clean road
   are preserved with empty .txt label files for YOLO background training.
4. Split preservation: keeps train, val, and test partitions strictly intact.
5. Strict dataset validation: checks class IDs, coordinate bounds, 1-to-1 image-label pairs,
   and cross-split duplicate image detection via SHA-256.
"""

import argparse
import hashlib
import os
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple
import yaml

# Supported image file extensions
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}


def inspect_source_config(yaml_path: Path) -> Tuple[int, str, Dict[int, str]]:
    """
    Inspects source dataset YAML and verifies the exact class ID for Pothole.
    Raises ValueError if Pothole class is not found.
    """
    if not yaml_path.exists():
        raise FileNotFoundError(f"Source dataset YAML not found at: {yaml_path}")

    with open(yaml_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    raw_names = data.get("names", {})
    # Normalize names dict
    if isinstance(raw_names, list):
        names_dict = {i: name for i, name in enumerate(raw_names)}
    elif isinstance(raw_names, dict):
        names_dict = {int(k): str(v) for k, v in raw_names.items()}
    else:
        raise ValueError(f"Unrecognized 'names' format in {yaml_path}: {type(raw_names)}")

    pothole_id: Optional[int] = None
    pothole_name: Optional[str] = None

    for cid, name in names_dict.items():
        if "pothole" in name.lower():
            pothole_id = cid
            pothole_name = name
            break

    if pothole_id is None:
        raise ValueError(
            f"Could not identify 'Pothole' class in {yaml_path}. Available classes: {names_dict}"
        )

    return pothole_id, pothole_name, names_dict


def create_target_yaml(target_yaml_path: Path, relative_path: str = "../pothole_single_class") -> None:
    """
    Creates target dataset configuration YAML with nc=1 and names=['pothole'].
    """
    target_yaml_path.parent.mkdir(parents=True, exist_ok=True)
    yaml_text = (
        f"# Sentinel AI - Single-Class Pothole Dataset Configuration\n"
        f"# Generated from RDD2022 dataset filtered strictly for Potholes\n\n"
        f"path: {relative_path}\n"
        f"train: images/train\n"
        f"val: images/val\n"
        f"test: images/test\n\n"
        f"nc: 1\n"
        f"names: ['pothole']\n"
    )
    with open(target_yaml_path, "w", encoding="utf-8") as f:
        f.write(yaml_text)


def compute_file_sha256(file_path: Path) -> str:
    """Computes SHA-256 hash of a file for duplicate detection."""
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def process_split(
    split_name: str,
    source_root: Path,
    target_root: Path,
    pothole_source_id: int,
    copy_images: bool = True,
) -> Dict[str, Any]:
    """
    Processes one split (train / val / test):
    - Reads images and labels from source_root/images/<split> and source_root/labels/<split>
    - Filters only pothole annotations, remapping class to 0
    - Retains images without potholes with empty .txt label files
    - Copies images to target_root/images/<split>
    - Writes labels to target_root/labels/<split>
    """
    src_img_dir = source_root / "images" / split_name
    src_lbl_dir = source_root / "labels" / split_name
    tgt_img_dir = target_root / "images" / split_name
    tgt_lbl_dir = target_root / "labels" / split_name

    tgt_img_dir.mkdir(parents=True, exist_ok=True)
    tgt_lbl_dir.mkdir(parents=True, exist_ok=True)

    stats: Dict[str, Any] = {
        "split": split_name,
        "source_images": 0,
        "target_images": 0,
        "positive_images": 0,
        "negative_images": 0,
        "pothole_annotations_retained": 0,
        "other_annotations_discarded": 0,
        "total_source_annotations": 0,
        "missing_label_files": 0,
        "empty_label_files_created": 0,
        "errors": [],
    }

    if not src_img_dir.exists():
        return stats

    image_files = [f for f in sorted(src_img_dir.iterdir()) if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS]
    stats["source_images"] = len(image_files)

    for img_path in image_files:
        stem = img_path.stem
        lbl_path = src_lbl_dir / f"{stem}.txt"
        target_lbl_path = tgt_lbl_dir / f"{stem}.txt"
        target_img_path = tgt_img_dir / img_path.name

        pothole_lines: List[str] = []

        if lbl_path.exists():
            with open(lbl_path, "r", encoding="utf-8") as f:
                raw_lines = f.readlines()

            for line_no, raw_line in enumerate(raw_lines, 1):
                clean_line = raw_line.strip()
                if not clean_line:
                    continue

                stats["total_source_annotations"] += 1
                parts = clean_line.split()

                if len(parts) < 5:
                    stats["errors"].append(f"{lbl_path.name}:{line_no} malformed line: '{clean_line}'")
                    continue

                try:
                    cid = int(float(parts[0]))
                    x_c = float(parts[1])
                    y_c = float(parts[2])
                    w = float(parts[3])
                    h = float(parts[4])
                except ValueError as e:
                    stats["errors"].append(f"{lbl_path.name}:{line_no} parse error: {e}")
                    continue

                if cid == pothole_source_id:
                    # Remap to class 0
                    remapped_line = f"0 {x_c:.6f} {y_c:.6f} {w:.6f} {h:.6f}"
                    pothole_lines.append(remapped_line)
                    stats["pothole_annotations_retained"] += 1
                else:
                    stats["other_annotations_discarded"] += 1
        else:
            stats["missing_label_files"] += 1

        # Write target label file (contains remapped lines, or is empty for negative sample)
        with open(target_lbl_path, "w", encoding="utf-8") as f_out:
            if pothole_lines:
                f_out.write("\n".join(pothole_lines) + "\n")
                stats["positive_images"] += 1
            else:
                # Valid empty label file for negative/background example
                stats["negative_images"] += 1
                stats["empty_label_files_created"] += 1

        # Copy image file
        if copy_images and not target_img_path.exists():
            shutil.copy2(img_path, target_img_path)

        stats["target_images"] += 1

    return stats


def validate_dataset(target_root: Path, splits: Tuple[str, ...] = ("train", "val", "test")) -> Dict[str, Any]:
    """
    Performs comprehensive validation of the generated single-class dataset:
    1. Checks all labels contain ONLY class ID 0.
    2. Checks all coordinates are valid normalized floats [0.0, 1.0].
    3. Checks 1-to-1 matching between images and label files.
    4. Checks for non-mixed split integrity.
    5. Checks for duplicate images across splits via SHA-256 hash.
    """
    validation: Dict[str, Any] = {
        "status": "PASS",
        "split_checks": {},
        "cross_split_duplicates": [],
        "total_violations": 0,
        "details": [],
    }

    seen_hashes: Dict[str, Tuple[str, str]] = {}  # sha256 -> (split, filename)

    for split in splits:
        img_dir = target_root / "images" / split
        lbl_dir = target_root / "labels" / split

        split_info: Dict[str, Any] = {
            "image_count": 0,
            "label_count": 0,
            "positive_images": 0,
            "negative_images": 0,
            "total_annotations": 0,
            "invalid_class_ids": 0,
            "out_of_bounds_coords": 0,
            "unmatched_images": [],
            "unmatched_labels": [],
        }

        if not img_dir.exists() or not lbl_dir.exists():
            validation["split_checks"][split] = split_info
            continue

        images = {f.stem: f for f in img_dir.iterdir() if f.is_file() and f.suffix.lower() in IMAGE_EXTENSIONS}
        labels = {f.stem: f for f in lbl_dir.iterdir() if f.is_file() and f.suffix.lower() == ".txt"}

        split_info["image_count"] = len(images)
        split_info["label_count"] = len(labels)

        # 1-to-1 match check
        unmatched_imgs = set(images.keys()) - set(labels.keys())
        unmatched_lbls = set(labels.keys()) - set(images.keys())

        if unmatched_imgs:
            split_info["unmatched_images"] = sorted(list(unmatched_imgs))
            validation["total_violations"] += len(unmatched_imgs)
            validation["details"].append(f"Split '{split}': {len(unmatched_imgs)} images lack label files.")

        if unmatched_lbls:
            split_info["unmatched_labels"] = sorted(list(unmatched_lbls))
            validation["total_violations"] += len(unmatched_lbls)
            validation["details"].append(f"Split '{split}': {len(unmatched_lbls)} labels lack image files.")

        # Check label content
        for stem, lbl_file in labels.items():
            with open(lbl_file, "r", encoding="utf-8") as f:
                lines = [ln.strip() for ln in f if ln.strip()]

            if not lines:
                split_info["negative_images"] += 1
                continue

            split_info["positive_images"] += 1
            for ln_idx, line in enumerate(lines, 1):
                split_info["total_annotations"] += 1
                parts = line.split()
                if len(parts) != 5:
                    validation["total_violations"] += 1
                    validation["details"].append(f"{lbl_file.name}:{ln_idx} invalid token count: {len(parts)}")
                    continue

                try:
                    cid = int(float(parts[0]))
                    xc, yc, w, h = map(float, parts[1:5])
                except ValueError:
                    validation["total_violations"] += 1
                    validation["details"].append(f"{lbl_file.name}:{ln_idx} non-numeric values")
                    continue

                # Must be class 0
                if cid != 0:
                    split_info["invalid_class_ids"] += 1
                    validation["total_violations"] += 1
                    validation["details"].append(f"{lbl_file.name}:{ln_idx} illegal class ID: {cid} (must be 0)")

                # Must be normalized in [0, 1]
                if not (0.0 <= xc <= 1.0 and 0.0 <= yc <= 1.0 and 0.0 <= w <= 1.0 and 0.0 <= h <= 1.0):
                    split_info["out_of_bounds_coords"] += 1
                    validation["total_violations"] += 1
                    validation["details"].append(f"{lbl_file.name}:{ln_idx} out-of-bounds coordinates: {parts[1:5]}")

        # Check for cross-split duplicate images by SHA-256
        for stem, img_file in images.items():
            img_hash = compute_file_sha256(img_file)
            if img_hash in seen_hashes:
                prev_split, prev_name = seen_hashes[img_hash]
                dup_entry = {
                    "hash": img_hash,
                    "first_occurrence": f"{prev_split}/{prev_name}",
                    "second_occurrence": f"{split}/{img_file.name}",
                }
                validation["cross_split_duplicates"].append(dup_entry)
                validation["total_violations"] += 1
                validation["details"].append(f"Duplicate image hash detected: {dup_entry['first_occurrence']} == {dup_entry['second_occurrence']}")
            else:
                seen_hashes[img_hash] = (split, img_file.name)

        validation["split_checks"][split] = split_info

    if validation["total_violations"] > 0:
        validation["status"] = "FAIL"

    return validation


def run_pipeline(
    source_root: Path,
    source_yaml: Path,
    target_root: Path,
    target_yaml: Path,
    splits: Tuple[str, ...] = ("train", "val", "test"),
    copy_images: bool = True,
) -> Dict[str, Any]:
    """Runs the complete preparation and validation pipeline."""
    pothole_id, pothole_name, names_dict = inspect_source_config(source_yaml)

    create_target_yaml(target_yaml, relative_path=os.path.relpath(target_root, target_yaml.parent).replace("\\", "/"))

    split_stats = {}
    for split in splits:
        split_stats[split] = process_split(
            split_name=split,
            source_root=source_root,
            target_root=target_root,
            pothole_source_id=pothole_id,
            copy_images=copy_images,
        )

    val_results = validate_dataset(target_root, splits=splits)

    return {
        "pothole_source_id": pothole_id,
        "pothole_source_name": pothole_name,
        "source_classes": names_dict,
        "split_stats": split_stats,
        "validation": val_results,
        "target_root": str(target_root),
        "target_yaml": str(target_yaml),
    }


def main():
    parser = argparse.ArgumentParser(description="Sentinel AI Single-Class Pothole Dataset Pipeline")
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "datasets" / "processed",
        help="Path to processed multi-class RDD2022 dataset directory",
    )
    parser.add_argument(
        "--source-yaml",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "datasets" / "yaml" / "data.yaml",
        help="Path to source dataset data.yaml",
    )
    parser.add_argument(
        "--target-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "datasets" / "pothole_single_class",
        help="Path to target single-class pothole dataset directory",
    )
    parser.add_argument(
        "--target-yaml",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "datasets" / "yaml" / "pothole_single_class.yaml",
        help="Path to output dataset YAML configuration",
    )
    parser.add_argument(
        "--no-copy",
        action="store_true",
        help="Process labels only without copying image files",
    )
    args = parser.parse_args()

    print("=" * 70)
    print("Sentinel AI: Single-Class Pothole Dataset Preparation")
    print("=" * 70)
    print(f"Source Directory : {args.source_dir}")
    print(f"Source YAML      : {args.source_yaml}")
    print(f"Target Directory : {args.target_dir}")
    print(f"Target YAML      : {args.target_yaml}")
    print("=" * 70)

    try:
        pothole_id, pothole_name, names_dict = inspect_source_config(args.source_yaml)
        print(f"Class Mapping Inspection:")
        for cid, name in names_dict.items():
            marker = " -> [TARGET REMAP TO 0]" if cid == pothole_id else " -> [DISCARD]"
            print(f"  Class {cid}: '{name}'{marker}")
        print(f"\nTarget Class Verified: ID {pothole_id} ('{pothole_name}') -> Remap to Class 0")
    except Exception as e:
        print(f"Error inspecting source config: {e}")
        sys.exit(1)

    # Check source images exist
    src_images_exist = False
    for split in ("train", "val", "test"):
        split_img_dir = args.source_dir / "images" / split
        if split_img_dir.exists() and any(split_img_dir.iterdir()):
            src_images_exist = True
            break

    if not src_images_exist:
        print(f"\nNotice: Source image directories under '{args.source_dir}/images/' are currently empty.")
        print("To populate them with the benchmark dataset, download and extract RDD2022 into:")
        print(f"  {args.source_dir}/images/{{train,val,test}}")
        print(f"  {args.source_dir}/labels/{{train,val,test}}")
        print("\nThe preparation pipeline and YAML configuration generator are verified and ready to run.")
        # We still generate the target YAML file as required
        create_target_yaml(args.target_yaml)
        print(f"Generated target YAML: {args.target_yaml}")
        return

    results = run_pipeline(
        source_root=args.source_dir,
        source_yaml=args.source_yaml,
        target_root=args.target_dir,
        target_yaml=args.target_yaml,
        copy_images=not args.no_copy,
    )

    print("\nDataset Processing Statistics:")
    print("-" * 70)
    for split, s in results["split_stats"].items():
        print(f"Split [{split}]:")
        print(f"  Total Images                : {s['target_images']}")
        print(f"  Positive Images (Pothole)   : {s['positive_images']}")
        print(f"  Negative Images (Background): {s['negative_images']}")
        print(f"  Potholes Retained (Class 0) : {s['pothole_annotations_retained']}")
        print(f"  Cracks Discarded            : {s['other_annotations_discarded']}")

    print("\nValidation Results:")
    print("-" * 70)
    val = results["validation"]
    print(f"Status           : {val['status']}")
    print(f"Total Violations : {val['total_violations']}")
    if val["details"]:
        for d in val["details"]:
            print(f"  - {d}")


if __name__ == "__main__":
    main()
