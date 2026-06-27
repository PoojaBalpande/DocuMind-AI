"""Application configuration — loads from .env via Pydantic Settings."""

import logging
from pydantic_settings import BaseSettings
from pydantic import model_validator
from pathlib import Path

logger = logging.getLogger(__name__)

MIN_SECRET_KEY_LENGTH = 32
VALID_SAMESITE_VALUES = {"strict", "lax", "none"}


class Settings(BaseSettings):
    APP_NAME: str = "DocuMind AI"
    ENVIRONMENT: str = "development"  # "development", "production", "testing"

    DATABASE_URL: str
    SECRET_KEY: str
    OPENAI_API_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""
    ALGORITHM: str = "HS256"
    LLM_PROVIDER: str = "ollama"
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen3:8b"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-specdec"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Embeddings Configuration
    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    GEMINI_EMBEDDING_MODEL: str = "text-embedding-004"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Cookie configuration
    COOKIE_SECURE: bool = True   # Set to False for local development (HTTP)
    COOKIE_SAMESITE: str = "lax"  # "strict", "lax", or "none"
    COOKIE_DOMAIN: str = ""       # e.g. ".yourdomain.com" for cross-subdomain

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Upload
    UPLOAD_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "uploads")
    MAX_UPLOAD_SIZE_MB: int = 50

    # ChromaDB (vector store)
    CHROMA_DB_PATH: str = "./chroma"

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

        # Cookie SameSite validation
        if self.COOKIE_SAMESITE.lower() not in VALID_SAMESITE_VALUES:
            errors.append(
                f"COOKIE_SAMESITE='{self.COOKIE_SAMESITE}' is invalid. "
                f"Must be one of: {', '.join(VALID_SAMESITE_VALUES)}"
            )

        # Validate LLM Provider configuration
        valid_providers = {"ollama", "groq", "gemini", "claude"}
        normalized_provider = self.LLM_PROVIDER.lower().strip()
        if normalized_provider not in valid_providers:
            errors.append(
                f"LLM_PROVIDER='{self.LLM_PROVIDER}' is invalid. "
                f"Must be one of: {', '.join(valid_providers)}"
            )
        else:
            self.LLM_PROVIDER = normalized_provider
            if normalized_provider == "groq" and (not self.GROQ_API_KEY or not self.GROQ_API_KEY.strip()):
                errors.append("GROQ_API_KEY is required when LLM_PROVIDER is 'groq'.")
            elif normalized_provider == "gemini" and (not self.GEMINI_API_KEY or not self.GEMINI_API_KEY.strip()):
                errors.append("GEMINI_API_KEY is required when LLM_PROVIDER is 'gemini'.")
            elif normalized_provider == "claude" and (not self.ANTHROPIC_API_KEY or not self.ANTHROPIC_API_KEY.strip()):
                errors.append("ANTHROPIC_API_KEY is required when LLM_PROVIDER is 'claude'.")

        # Validate Embedding Provider configuration
        valid_embeddings = {"local", "gemini"}
        normalized_embed = self.EMBEDDING_PROVIDER.lower().strip()
        if normalized_embed not in valid_embeddings:
            errors.append(
                f"EMBEDDING_PROVIDER='{self.EMBEDDING_PROVIDER}' is invalid. "
                f"Must be one of: {', '.join(valid_embeddings)}"
            )
        else:
            self.EMBEDDING_PROVIDER = normalized_embed
            if normalized_embed == "gemini" and (not self.GEMINI_API_KEY or not self.GEMINI_API_KEY.strip()):
                errors.append("GEMINI_API_KEY is required when EMBEDDING_PROVIDER is 'gemini'.")

        # Production-specific checks
        if self.ENVIRONMENT == "production":
            if "*" in self.CORS_ORIGINS:
                errors.append(
                    "CORS_ORIGINS contains wildcard '*' in production mode. "
                    "This is insecure when allow_credentials=True. "
                    "Set explicit origins instead."
                )
            if not self.GOOGLE_CLIENT_ID or not self.GOOGLE_CLIENT_ID.strip():
                logger.warning(
                    "GOOGLE_CLIENT_ID is not configured. "
                    "Google Sign-In will be unavailable."
                )
            if not self.COOKIE_SECURE:
                logger.warning(
                    "COOKIE_SECURE=False in production mode. "
                    "Cookies will NOT require HTTPS. This is insecure."
                )

        # Non-fatal warnings
        if not self.OPENAI_API_KEY and normalized_provider not in {"groq", "gemini", "claude"}:
            logger.warning(
                "OPENAI_API_KEY is not set. OpenAI features will be unavailable. "
                "Ollama will be used as the primary LLM provider."
            )

        if errors:
            error_msg = "Startup configuration errors:\n" + "\n".join(f"  - {e}" for e in errors)
            raise ValueError(error_msg)

        return self


settings = Settings()

