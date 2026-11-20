"""
Sentinel AI - Road Damage Dataset Downloader
Assists with downloading the RDD2022 (Road Damage Dataset 2022) or Roboflow Road Damage dataset.
"""

import sys
import subprocess
from pathlib import Path


def download_roboflow():
    print("""
========================================================================
Roboflow Road Damage / Pothole Dataset Download Guide:
========================================================================
1. Sign up for a free account at https://universe.roboflow.com/
2. Search for: "Road Damage Detection" or "RDD2022" or "Pothole Detection"
3. Recommended pre-packaged dataset:
   https://universe.roboflow.com/crowdsensing/rdd2022
4. Click 'Download Dataset' -> Format: 'YOLOv8' / 'YOLO11'
5. Choose 'Download zip to computer' or 'Terminal / Python snippet'.
6. Extract the images and labels folders into:
   backend/ai/datasets/processed/
     ├── images/
     │   ├── train/
     │   ├── val/
     │   └── test/
     └── labels/
         ├── train/
         ├── val/
         └── test/
========================================================================
    """)


def download_kaggle():
    print("""
========================================================================
Kaggle RDD2022 Dataset Download Guide:
========================================================================
To download directly via Kaggle API:
kaggle datasets download -d anasmohammed361/rdd2022 -p backend/ai/datasets/raw/
========================================================================
    """)


if __name__ == "__main__":
    download_roboflow()
    download_kaggle()
