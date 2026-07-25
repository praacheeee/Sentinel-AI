from fastapi import APIRouter, UploadFile, File
from PIL import Image
import io

router = APIRouter()


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()

    image = Image.open(io.BytesIO(image_bytes))

    return {
        "filename": file.filename,
        "width": image.width,
        "height": image.height,
        "mode": image.mode,
        "message": "Image received successfully"
    }