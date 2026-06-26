"""
DocuMind AI — FastAPI Backend
=============================
AI-powered document intelligence platform.
Version 2: Real Authentication, Database, and PDF Upload.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import SessionLocal
from app.api import auth, documents, chat, analytics, members
from app.api import settings as settings_api

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logging
    logger.info("==================================================")
    logger.info(f"Starting {settings.APP_NAME}...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # 1. Verify database connection
    db_connected = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection: Successful")
        db_connected = True
    except Exception as e:
        logger.error(f"Database connection: Failed. Error: {str(e)}")

    # 2. Verify pgvector extension is present
    if db_connected:
        try:
            db = SessionLocal()
            result = db.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'")).first()
            db.close()
            if result:
                logger.info("Vector Database (pgvector extension): Initialized")
            else:
                logger.warning("Vector Database (pgvector extension): Missing in database schema")
        except Exception as e:
            logger.error(f"Vector Database check: Failed. Error: {str(e)}")

    # 3. Verify embedding model is loaded
    try:
        logger.info(
            "Embedding service initialized (model will load on first use)."
        )
    except Exception as e:
        logger.error(f"Embedding Model: Failed to load. Error: {str(e)}")

    logger.info("Application startup complete.")
    logger.info("==================================================")

    yield

    # Shutdown logging
    logger.info("==================================================")
    logger.info("Application shutting down...")
    logger.info("Application shutdown complete.")
    logger.info("==================================================")

is_production = settings.ENVIRONMENT == "production"

app = FastAPI(
    title="DocuMind AI API",
    description="AI-powered document intelligence platform API",
    version="2.0.0",
    docs_url=None if is_production else "/api/docs",
    redoc_url=None if is_production else "/api/redoc",
    lifespan=lifespan,
)

# CORS — allow frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SecurityHeadersMiddleware:
    """ASGI Middleware to append security headers to all HTTP responses."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                security_headers = [
                    (b"x-frame-options", b"DENY"),
                    (b"x-content-type-options", b"nosniff"),
                    (b"referrer-policy", b"strict-origin-when-cross-origin"),
                    (b"permissions-policy", b"camera=(), microphone=(), geolocation=()"),
                ]
                # Remove duplicate keys to avoid conflicting headers
                keys_to_remove = {h[0] for h in security_headers}
                headers = [h for h in headers if h[0].lower() not in keys_to_remove]
                headers.extend(security_headers)
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_wrapper)


app.add_middleware(SecurityHeadersMiddleware)


# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(settings_api.router, prefix="/api/settings", tags=["Settings"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(members.router, prefix="/api/members", tags=["Members"])


@app.get("/api/health")
async def health_check():
    """Health check endpoint with system diagnostic status."""
    health_info = {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "2.0.0",
        "database": "disconnected",
        "embedding_model": "not_loaded",
        "vector_database": "unavailable",
    }
    
    # 1. Diagnostic: Database & pgvector
    db = None
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        health_info["database"] = "connected"
        
        # Check pgvector extension presence
        result = db.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'")).first()
        if result:
            health_info["vector_database"] = "pgvector_ready"
        else:
            health_info["vector_database"] = "pgvector_missing"
    except Exception as e:
        logger.error(f"Health check database diagnostic failed: {e}")
        health_info["status"] = "unhealthy"
        health_info["database"] = f"error: {str(e)}"
        health_info["vector_database"] = "unavailable"
    finally:
        if db:
            db.close()
            
    # 2. Diagnostic: Embedding Model
    try:
        from app.services.document_processor.embedding_service import model
        if model is not None:
            health_info["embedding_model"] = "loaded (BAAI/bge-small-en-v1.5)"
    except Exception as e:
        logger.error(f"Health check embedding model diagnostic failed: {e}")
        health_info["status"] = "unhealthy"
        health_info["embedding_model"] = f"error: {str(e)}"

    return health_info
