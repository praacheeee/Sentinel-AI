"""
Unit tests for Sentinel AI Single-Class Pothole Dataset Pipeline
Tests:
- Dynamic class identification from YAML
- Remapping Pothole annotations to class ID 0
- Filtering out crack annotations (0, 1, 2)
- Generating valid empty .txt label files for negative/background samples
- Split preservation (train, val, test)
- Target YAML generation with nc: 1 and names: ['pothole']
- Validation checks (class 0 integrity, coordinate bounds, 1-to-1 match, cross-split duplicate detection)
"""

import os
import shutil
import tempfile
from pathlib import Path
import pytest
import yaml

from ai.scripts.prepare_dataset import (
    inspect_source_config,
    create_target_yaml,
    process_split,
    validate_dataset,
    run_pipeline,
)


@pytest.fixture
def mock_rdd_dataset(tmp_path: Path):
    """
    Creates a temporary realistic RDD2022 dataset structure:
    - data.yaml with 4 classes (0: Long, 1: Trans, 2: Alligator, 3: Pothole)
    - train, val, test splits with images and labels
    """
    source_root = tmp_path / "source_rdd"
    yaml_dir = tmp_path / "yaml"
    yaml_dir.mkdir(parents=True)
    source_yaml = yaml_dir / "data.yaml"

    yaml_data = {
        "path": str(source_root),
        "train": "images/train",
        "val": "images/val",
        "test": "images/test",
        "names": {
            0: "Longitudinal Crack",
            1: "Transverse Crack",
            2: "Alligator Crack",
            3: "Pothole",
        },
    }
    with open(source_yaml, "w", encoding="utf-8") as f:
        yaml.dump(yaml_data, f)

    # Create dummy images and labels for train, val, test
    for split in ("train", "val", "test"):
        img_dir = source_root / "images" / split
        lbl_dir = source_root / "labels" / split
        img_dir.mkdir(parents=True)
        lbl_dir.mkdir(parents=True)

        # 1. Image with pothole (class 3) and alligator crack (class 2)
        (img_dir / f"{split}_pothole_and_crack.jpg").write_bytes(b"dummy_image_1_" + split.encode())
        (lbl_dir / f"{split}_pothole_and_crack.txt").write_text(
            "3 0.500000 0.500000 0.200000 0.300000\n"  # Pothole
            "2 0.100000 0.200000 0.400000 0.100000\n",  # Alligator crack
            encoding="utf-8",
        )

        # 2. Image with only cracks (class 0, 1) -> should become negative sample (empty label)
        (img_dir / f"{split}_only_cracks.jpg").write_bytes(b"dummy_image_2_" + split.encode())
        (lbl_dir / f"{split}_only_cracks.txt").write_text(
            "0 0.250000 0.250000 0.100000 0.100000\n"  # Longitudinal
            "1 0.750000 0.750000 0.150000 0.150000\n",  # Transverse
            encoding="utf-8",
        )

        # 3. Clean road image with already empty label file -> negative sample
        (img_dir / f"{split}_clean_road.jpg").write_bytes(b"dummy_image_3_" + split.encode())
        (lbl_dir / f"{split}_clean_road.txt").write_text("", encoding="utf-8")

        # 4. Multi-pothole image (two class 3 detections)
        (img_dir / f"{split}_two_potholes.jpg").write_bytes(b"dummy_image_4_" + split.encode())
        (lbl_dir / f"{split}_two_potholes.txt").write_text(
            "3 0.300000 0.400000 0.100000 0.100000\n"
            "3 0.700000 0.800000 0.200000 0.200000\n",
            encoding="utf-8",
        )

    target_root = tmp_path / "target_pothole"
    target_yaml = tmp_path / "target_yaml" / "pothole_single_class.yaml"

    return {
        "source_root": source_root,
        "source_yaml": source_yaml,
        "target_root": target_root,
        "target_yaml": target_yaml,
    }


def test_inspect_source_config(mock_rdd_dataset):
    """Test dynamic class ID detection from data.yaml."""
    cid, name, names_dict = inspect_source_config(mock_rdd_dataset["source_yaml"])
    assert cid == 3
    assert name == "Pothole"
    assert len(names_dict) == 4
    assert names_dict[0] == "Longitudinal Crack"


def test_inspect_source_config_missing_pothole(tmp_path: Path):
    """Test error when pothole is not in classes."""
    bad_yaml = tmp_path / "bad.yaml"
    with open(bad_yaml, "w") as f:
        yaml.dump({"names": {0: "Car", 1: "Bus"}}, f)

    with pytest.raises(ValueError, match="Could not identify 'Pothole' class"):
        inspect_source_config(bad_yaml)


def test_create_target_yaml(mock_rdd_dataset):
    """Test target YAML generation with nc: 1 and names: ['pothole']."""
    target_yaml = mock_rdd_dataset["target_yaml"]
    create_target_yaml(target_yaml, relative_path="../pothole_single_class")

    assert target_yaml.exists()
    with open(target_yaml, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    assert data["nc"] == 1
    assert data["names"] == ["pothole"]
    assert data["train"] == "images/train"
    assert data["val"] == "images/val"
    assert data["test"] == "images/test"
    assert data["path"] == "../pothole_single_class"


def test_process_split_and_remapping(mock_rdd_dataset):
    """Test filtering, remapping to 0, and negative sample empty files."""
    source_root = mock_rdd_dataset["source_root"]
    target_root = mock_rdd_dataset["target_root"]

    stats = process_split(
        split_name="train",
        source_root=source_root,
        target_root=target_root,
        pothole_source_id=3,
        copy_images=True,
    )

    assert stats["source_images"] == 4
    assert stats["target_images"] == 4
    assert stats["positive_images"] == 2  # pothole_and_crack, two_potholes
    assert stats["negative_images"] == 2  # only_cracks, clean_road
    assert stats["pothole_annotations_retained"] == 3  # 1 from first + 2 from fourth
    assert stats["other_annotations_discarded"] == 3  # 1 alligator + 1 long + 1 trans

    # Verify label files on disk
    lbl_dir = target_root / "labels" / "train"

    # 1. pothole_and_crack should have only 1 line, remapped to class 0
    lines1 = (lbl_dir / "train_pothole_and_crack.txt").read_text(encoding="utf-8").strip().splitlines()
    assert len(lines1) == 1
    assert lines1[0].startswith("0 ")
    assert "0.500000 0.500000 0.200000 0.300000" in lines1[0]

    # 2. only_cracks should be an empty file (0 bytes / 0 lines)
    lines2 = (lbl_dir / "train_only_cracks.txt").read_text(encoding="utf-8").strip()
    assert lines2 == ""

    # 3. clean_road should be an empty file
    lines3 = (lbl_dir / "train_clean_road.txt").read_text(encoding="utf-8").strip()
    assert lines3 == ""

    # 4. two_potholes should have 2 lines, both starting with class 0
    lines4 = (lbl_dir / "train_two_potholes.txt").read_text(encoding="utf-8").strip().splitlines()
    assert len(lines4) == 2
    assert lines4[0].startswith("0 ")
    assert lines4[1].startswith("0 ")


def test_validate_dataset_pass(mock_rdd_dataset):
    """Test full pipeline run and validation pass."""
    results = run_pipeline(
        source_root=mock_rdd_dataset["source_root"],
        source_yaml=mock_rdd_dataset["source_yaml"],
        target_root=mock_rdd_dataset["target_root"],
        target_yaml=mock_rdd_dataset["target_yaml"],
        splits=("train", "val", "test"),
        copy_images=True,
    )

    val = results["validation"]
    assert val["status"] == "PASS"
    assert val["total_violations"] == 0
    assert len(val["cross_split_duplicates"]) == 0

    # Every split must have 4 images and 4 label files
    for split in ("train", "val", "test"):
        sc = val["split_checks"][split]
        assert sc["image_count"] == 4
        assert sc["label_count"] == 4
        assert sc["positive_images"] == 2
        assert sc["negative_images"] == 2
        assert sc["total_annotations"] == 3
        assert sc["invalid_class_ids"] == 0
        assert sc["out_of_bounds_coords"] == 0


def test_validation_detects_illegal_class(mock_rdd_dataset):
    """Validation must fail if any class ID is not 0."""
    target_root = mock_rdd_dataset["target_root"]
    run_pipeline(
        source_root=mock_rdd_dataset["source_root"],
        source_yaml=mock_rdd_dataset["source_yaml"],
        target_root=target_root,
        target_yaml=mock_rdd_dataset["target_yaml"],
    )

    # Corrupt one label to have class ID 2
    bad_lbl = target_root / "labels" / "train" / "train_pothole_and_crack.txt"
    bad_lbl.write_text("2 0.500000 0.500000 0.200000 0.300000\n", encoding="utf-8")

    val = validate_dataset(target_root)
    assert val["status"] == "FAIL"
    assert val["split_checks"]["train"]["invalid_class_ids"] == 1
    assert any("illegal class ID" in d for d in val["details"])


def test_validation_detects_out_of_bounds_coords(mock_rdd_dataset):
    """Validation must fail if any bounding box coordinates are outside [0, 1]."""
    target_root = mock_rdd_dataset["target_root"]
    run_pipeline(
        source_root=mock_rdd_dataset["source_root"],
        source_yaml=mock_rdd_dataset["source_yaml"],
        target_root=target_root,
        target_yaml=mock_rdd_dataset["target_yaml"],
    )

    bad_lbl = target_root / "labels" / "train" / "train_pothole_and_crack.txt"
    bad_lbl.write_text("0 1.500000 0.500000 0.200000 0.300000\n", encoding="utf-8")

    val = validate_dataset(target_root)
    assert val["status"] == "FAIL"
    assert val["split_checks"]["train"]["out_of_bounds_coords"] == 1


def test_validation_detects_cross_split_duplicates(mock_rdd_dataset):
    """Validation must detect if identical images exist across train and val splits."""
    target_root = mock_rdd_dataset["target_root"]
    run_pipeline(
        source_root=mock_rdd_dataset["source_root"],
        source_yaml=mock_rdd_dataset["source_yaml"],
        target_root=target_root,
        target_yaml=mock_rdd_dataset["target_yaml"],
    )

    # Copy train image into val directory with a different name to simulate duplicate
    train_img = target_root / "images" / "train" / "train_clean_road.jpg"
    val_img = target_root / "images" / "val" / "val_clean_road.jpg"
    # Make them have identical content
    val_img.write_bytes(train_img.read_bytes())

    val = validate_dataset(target_root)
    assert val["status"] == "FAIL"
    assert len(val["cross_split_duplicates"]) == 1
    assert any("Duplicate image hash detected" in d for d in val["details"])
