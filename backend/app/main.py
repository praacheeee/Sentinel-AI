from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.predict import router as predict_router

app = FastAPI(
    title="Sentinel AI Backend",
    version="1.0.0"
)

# Allow local dev, Vercel deployments, and custom production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)


@app.get("/")
def root():
    return {
        "message": "Sentinel AI Backend Running",
        "status": "healthy"
    }


@app.get("/healthz")
def healthz():
    return {
        "status": "ok"
    }
