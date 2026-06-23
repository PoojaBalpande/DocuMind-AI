"""Application configuration — loads from .env via Pydantic Settings."""

import logging
from pydantic_settings import BaseSettings
from pydantic import model_validator
from pathlib import Path

logger = logging.getLogger(__name__)

MIN_SECRET_KEY_LENGTH = 32


class Settings(BaseSettings):
    APP_NAME: str = "DocuMind AI"
    ENVIRONMENT: str = "development"  # "development", "production", "testing"

    DATABASE_URL: str
    SECRET_KEY: str
    OPENAI_API_KEY: str = ""
    ALGORITHM: str = "HS256"
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen3:8b"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Upload
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "uploads")
    MAX_UPLOAD_SIZE_MB: int = 50

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent.parent / ".env"),
        "extra": "ignore",
    }

    @model_validator(mode="after")
    def validate_startup_config(self) -> "Settings":
        """Fail-fast startup validation for critical security settings."""
        errors: list[str] = []

        # SECRET_KEY: must be present and strong
        if not self.SECRET_KEY or not self.SECRET_KEY.strip():
            errors.append("SECRET_KEY is missing or empty.")
        elif len(self.SECRET_KEY) < MIN_SECRET_KEY_LENGTH:
            errors.append(
                f"SECRET_KEY is too short ({len(self.SECRET_KEY)} chars). "
                f"Minimum length is {MIN_SECRET_KEY_LENGTH} characters. "
                f"Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )

        # DATABASE_URL: must be present
        if not self.DATABASE_URL or not self.DATABASE_URL.strip():
            errors.append("DATABASE_URL is missing or empty.")

        # Production-specific checks
        if self.ENVIRONMENT == "production":
            if "*" in self.CORS_ORIGINS:
                errors.append(
                    "CORS_ORIGINS contains wildcard '*' in production mode. "
                    "This is insecure when allow_credentials=True. "
                    "Set explicit origins instead."
                )

        # Non-fatal warnings
        if not self.OPENAI_API_KEY:
            logger.warning(
                "OPENAI_API_KEY is not set. OpenAI features will be unavailable. "
                "Ollama will be used as the primary LLM provider."
            )

        if errors:
            error_msg = "Startup configuration errors:\n" + "\n".join(f"  - {e}" for e in errors)
            raise ValueError(error_msg)

        return self


settings = Settings()

