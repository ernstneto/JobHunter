"""
JobHunter AI — AI Service
Main FastAPI application entry point
"""

from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import router as api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"AI Service starting in {settings.app_env} mode")
    print(f"Groq API: {'configured' if settings.groq_api_key else 'NOT SET'}")
    print(f"OpenRouter API: {'configured' if settings.openrouter_api_key else 'NOT SET'}")
    yield
    print("AI Service shutting down")


app = FastAPI(
    title="JobHunter AI - AI Service",
    description="Intelligent job matching, CV generation, and ATS analysis",
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": settings.app_version,
    }