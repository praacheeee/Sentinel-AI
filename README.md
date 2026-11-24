# Sentinel AI — Pothole Vision System

Sentinel AI is an intelligent roadway damage inspection platform designed to detect and triage potholes from captured road imagery using deep learning object detection.

---

## Current Implemented Features

1. **Image Upload:**
   - Allows users to upload roadway images (JPEG, PNG) for automated pothole inspection.
2. **AI-Based Pothole Detection:**
   - Uses YOLOv8 Nano to detect potholes in uploaded images, filtering detections for pothole class ID 3 from the active checkpoint.
3. **Bounding Box Visualization:**
   - Highlights detected potholes with bounding boxes, spatial coordinates, and individual model confidence scores overlaid directly on the image.
4. **Duplicate Detection Grouping:**
   - Employs geometric overlap analysis (Intersection over Union / Intersection over Minimum) and Disjoint-Set (Union-Find) clustering to group overlapping candidate detections into distinct physical defect clusters.
5. **Pothole Severity Classification:**
   - Assigns provisional severity levels (**Low**, **Medium**, **High**, and **Critical**) using rule-based heuristic logic derived from cluster counts and maximum cluster confidence.
6. **Inspection Dashboard:**
   - Displays detection results, inspection summaries, defect counts, primary defect identification, and operational dashboard metrics.
7. **Local Inspection History:**
   - Maintains a local record of recent inspection sessions, including damage type, provisional severity ratings, confidence scores, and detection timestamps.

---

## Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Python, FastAPI, Uvicorn
- **Object Detection:** YOLOv8 Nano (`ultralytics`), PyTorch
- **Dataset:** RDD2022 (Road Damage Dataset 2022)

---

## Model Architecture: Baseline vs. Future Roadmap

| Parameter | Current Baseline Model (Active) | Future Single-Class Model (Planned) |
|---|---|---|
| **Architecture** | YOLOv8 Nano (`backend/ai/models/best.pt`) | YOLOv8 Nano (`pothole_yolov8n_best.pt`) |
| **Dataset Source** | RDD2022 Multi-Class | RDD2022 Single-Class Pothole Extraction |
| **Classes** | 4 Classes (`0: Longitudinal`, `1: Transverse`, `2: Alligator`, `3: Pothole`) | 1 Class (`0: Pothole`) |
| **Class Filtering** | Dynamic filter for Class ID 3 (`Pothole`) | Direct detection (No filtering overhead) |
| **Operational Threshold**| 10.0% confidence cutoff | Evaluated after Kaggle GPU training |
| **Execution Environment**| Local CPU / Render Linux Web Service | Trained on Kaggle Tesla T4 GPU |

> [!NOTE]
> The single-class pothole dataset (38,385 images across train, validation, and test splits) and Kaggle Tesla T4 training notebook (`Sentinel_AI_YOLO_Training.ipynb`) have been prepared and staged for the next development phase.

---

## Deployment Architecture

- **Frontend Deployment (Vercel):**
  - Built with Vite and TypeScript (`npm run build`).
  - Supports dynamic backend routing via the `VITE_API_URL` environment variable (defaults to `http://127.0.0.1:8000` for local development).
- **Backend Deployment (Render):**
  - Configured via root [render.yaml](render.yaml) for automated Render Blueprint deployment.
  - Runs FastAPI on Uvicorn with cross-platform dependencies (`opencv-python-headless`) and health check monitoring (`/healthz`).

---

## Operational Limitations & Scope

- **Perspective Sensitivity:** The baseline model was trained on vehicle-mounted dashcam imagery (forward-facing perspective down roadway lanes). Extreme top-down overhead shots, macro close-ups, or oblique aerial angles may yield lower detection confidence.
- **2D Planar Abstraction:** Bounding boxes provide 2D localization. The system does not calculate 3D volumetric displacement or cavity depth.
- **Provisional Severity:** Severity ratings represent an automated provisional maintenance triage heuristic based on 2D visual indicators; they are **not** certified civil engineering structural assessments.
- **Feature Scope Boundary:** Live video streaming, real-time vehicle camera telemetry, GPS coordinate mapping, and drone hardware integrations are potential future enhancements and are not part of the current application release.
