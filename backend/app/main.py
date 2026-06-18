"""
DocuMind AI — FastAPI Backend
=============================
AI-powered document intelligence platform.
Version 2: Real Authentication, Database, and PDF Upload.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, documents, chat
from app.api import settings as settings_api

app = FastAPI(
    title="DocuMind AI API",
    description="AI-powered document intelligence platform API",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["Settings"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0.0", "app": settings.APP_NAME}
