from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import auth, marcas, tendencias, scores, deteccion

app = FastAPI(
    title="Red Freska API",
    description="API de inteligencia cultural para marcas de food en Lima, Perú",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(marcas.router)
app.include_router(tendencias.router)
app.include_router(scores.router)
app.include_router(deteccion.router)


@app.get("/")
def health():
    return {"status": "ok", "app": "Red Freska API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
