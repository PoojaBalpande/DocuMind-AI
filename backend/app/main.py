"""
DocuMind AI — FastAPI Backend
=============================
AI-powered document intelligence platform.
Version 2: Real Authentication, Database, and PDF Upload.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api import auth, documents, chat, analytics, members
from app.api import settings as settings_api

is_production = settings.ENVIRONMENT == "production"

app = FastAPI(
    title="DocuMind AI API",
    description="AI-powered document intelligence platform API",
    version="2.0.0",
    docs_url=None if is_production else "/api/docs",
    redoc_url=None if is_production else "/api/redoc",
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
    """Health check endpoint."""
    return {"status": "healthy", "version": "2.0.0", "app": settings.APP_NAME}
