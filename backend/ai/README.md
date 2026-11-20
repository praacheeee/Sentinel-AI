# Sentinel AI - Road Damage Detection Model Engine

## 1. Model Architecture Recommendation

### Recommended: **YOLO11m** (or **YOLOv8m**)
- **Architecture**: Ultralytics YOLO11 Medium (~20.1M parameters) or YOLOv8 Medium (~25.9M parameters).
- **Why upgrade from YOLOv8n (Nano)**:
  - The previous model was **YOLOv8n** (3.01M parameters) trained for only 15 epochs.
  - Thin longitudinal/transverse cracks and shaded asphalt potholes require rich spatial and contextual features that 3.0M parameter nano models struggle to distinguish from normal asphalt texture.
  - Medium (~20-25M parameters) provides the optimal trade-off: high mAP50 / mAP50-95 on fine road distress patterns while maintaining fast real-time inference (sub-50ms latency on CPU, 60+ FPS on GPU).
  - 100% drop-in compatible with the existing backend (`from ultralytics import YOLO`).

### Alternative: **RT-DETR-l** (Real-Time Detection Transformer)
- Best if global contextual reasoning is needed to eliminate false positives from road markings, tree shadows, and tire skid marks.

---

## 2. Dataset Benchmark: RDD2022

The model detects 4 core classes defined by the Global Road Damage Detection Challenge:
- `Longitudinal Crack` (RDD D00 - along the direction of traffic)
- `Transverse Crack` (RDD D10 - perpendicular to traffic direction)
- `Alligator Crack` (RDD D20 - fatigue cracking network)
- `Pothole` (RDD D40 - localized bowl-shaped depression)

---

## 3. Training Instructions

1. Prepare your dataset in `backend/ai/datasets/processed/` following `backend/ai/datasets/yaml/data.yaml`.
2. Run the training script:
```bash
python backend/ai/training/train.py --model yolo11m.pt --epochs 100 --batch 16 --imgsz 640 --device 0
```
*(Tip: For fine crack detection, training with `--imgsz 1280` provides a notable boost in detection accuracy if GPU VRAM allows.)*

3. Once training completes, copy the generated weights:
```bash
cp backend/ai/runs/sentinel_rdd_model/weights/best.pt backend/ai/models/best.pt
```
Restart the FastAPI backend to use the newly trained model immediately.
