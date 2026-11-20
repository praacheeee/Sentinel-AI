from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from PIL import Image
import io

from app.services.yolo_service import detect_damage

router = APIRouter()


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    conf: float = Query(0.10, ge=0.01, le=1.0, description="Pothole detection confidence threshold"),
    iou: float = Query(0.45, ge=0.01, le=1.0, description="NMS IoU threshold")
):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        result = detect_damage(image, conf=conf, iou=iou)

        return {
            "status": "success",
            "filename": file.filename,
            "width": image.width,
            "height": image.height,
            "detections": result["detections"],
            "count": result["count"],
            "summary": result["summary"]
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
