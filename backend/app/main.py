from fastapi import FastAPI
from app.routes.predict import router as predict_router

app = FastAPI(
    title="Sentinel AI Backend",
    version="1.0.0"
)

app.include_router(predict_router)


@app.get("/")
def root():
    return {
        "message": "Sentinel AI Backend Running",
        "status": "healthy"
    }