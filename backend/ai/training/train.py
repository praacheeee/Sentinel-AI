"""
Sentinel AI - Road Damage Detection Model Training Pipeline
Trains state-of-the-art YOLO detectors (YOLO11m / YOLOv8m) on the Road Damage Dataset (RDD2022 / Roboflow).
"""

import argparse
import os
from pathlib import Path
from ultralytics import YOLO


def parse_args():
    parser = argparse.ArgumentParser(description="Train Sentinel AI YOLO Damage Detector")
    parser.add_argument(
        "--model",
        type=str,
        default="yolo11m.pt",
        help="Base pretrained model: yolo11m.pt (recommended), yolo11s.pt, yolov8m.pt, or rtdetr-l.pt",
    )
    parser.add_argument(
        "--data",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "datasets" / "yaml" / "data.yaml"),
        help="Path to data.yaml dataset config",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=100,
        help="Number of training epochs (recommended: 80 - 120)",
    )
    parser.add_argument(
        "--patience",
        type=int,
        default=20,
        help="Early stopping patience epochs",
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=16,
        help="Batch size (decrease to 8 if encountering GPU out of memory)",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Image resolution (640 or 1280; 1280 yields higher mAP for fine cracks)",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="0",
        help="CUDA device id (e.g. '0', '0,1', or 'cpu')",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Dataloader worker threads",
    )
    parser.add_argument(
        "--project",
        type=str,
        default=str(Path(__file__).resolve().parents[1] / "runs"),
        help="Save directory for runs and metrics",
    )
    parser.add_argument(
        "--name",
        type=str,
        default="sentinel_rdd_model",
        help="Experiment name",
    )
    return parser.parse_args()


def train():
    args = parse_args()

    # Set local config directory to prevent Windows permission issues
    config_dir = Path(__file__).resolve().parents[1] / ".ultralytics"
    config_dir.mkdir(parents=True, exist_ok=True)
    os.environ["YOLO_CONFIG_DIR"] = str(config_dir)

    print("=" * 60)
    print(f"Starting Sentinel AI Training Pipeline")
    print(f"Base Model Architecture : {args.model}")
    print(f"Dataset YAML            : {args.data}")
    print(f"Target Epochs           : {args.epochs}")
    print(f"Image Resolution        : {args.imgsz}")
    print(f"Batch Size              : {args.batch}")
    print(f"Device                  : {args.device}")
    print("=" * 60)

    # Initialize model with pretrained weights
    model = YOLO(args.model)

    # Train with road-damage optimized augmentations
    results = model.train(
        data=args.data,
        epochs=args.epochs,
        patience=args.patience,
        batch=args.batch,
        imgsz=args.imgsz,
        device=args.device,
        workers=args.workers,
        project=args.project,
        name=args.name,
        optimizer="AdamW",
        lr0=0.001,
        lrf=0.01,
        cos_lr=True,
        cls=1.5,              # Boost classification penalty to maximize confidence
        # Road damage specific augmentations:
        mosaic=1.0,           # Critical for contextual defect relationships
        mixup=0.1,            # Blends road textures
        hsv_h=0.015,          # Hue jitter for sun glares / overcast
        hsv_s=0.7,            # Saturation jitter for wet / dry asphalt
        hsv_v=0.4,            # Value/brightness jitter for shadows and shade
        fliplr=0.5,           # Horizontal flip
        flipud=0.0,           # Roads shouldn't be flipped upside down
        save=True,
        save_period=5,
        plots=True,
        verbose=True,
    )

    print("\nTraining complete!")
    best_weight = Path(args.project) / args.name / "weights" / "best.pt"
    if best_weight.exists():
        print(f"Best model weights saved to: {best_weight}")
        target_dest = Path(__file__).resolve().parents[1] / "models" / "best.pt"
        print(f"To deploy to Sentinel AI backend, copy to: {target_dest}")
    return results


if __name__ == "__main__":
    train()
