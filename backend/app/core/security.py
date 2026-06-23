"""Security utilities — password hashing (bcrypt direct) and JWT (python-jose)."""

from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

# ── Password Hashing (bcrypt direct — avoids passlib incompatibility) ──

def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ── JWT Token ─────────────────────────────────────────────────────

security_scheme = HTTPBearer()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token with an expiration time."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ── Current User Dependency ──────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db),
):
    """FastAPI dependency that extracts and validates the current user from JWT."""
    from app.models.user import User  # local import to avoid circular dependency

    payload = decode_token(credentials.credentials)
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )
    return user


# ── Google OAuth Token Verification ──────────────────────────────

def verify_google_token(id_token_str: str) -> dict:
    """Verify a Google ID token. In development, accepts 'mock_google_token:<email>:<sub_id>:<name>'."""
    if settings.ENVIRONMENT != "production":
        if id_token_str.startswith("mock_google_token:"):
            parts = id_token_str.split(":")
            email = parts[1] if len(parts) >= 2 else "test@example.com"
            sub = parts[2] if len(parts) >= 3 else "12345"
            name = parts[3] if len(parts) >= 4 else "Google User"
            return {
                "iss": "https://accounts.google.com",
                "aud": settings.GOOGLE_CLIENT_ID or "mock-client-id",
                "sub": sub,
                "email": email,
                "name": name,
                "email_verified": True
            }
        elif id_token_str.startswith("mock_google_token_"):
            parts = id_token_str.split("_")
            email = parts[3] if len(parts) >= 4 else "test@example.com"
            sub = parts[4] if len(parts) >= 5 else "12345"
            name = parts[5].replace("-", " ") if len(parts) >= 6 else "Google User"
            return {
                "iss": "https://accounts.google.com",
                "aud": settings.GOOGLE_CLIENT_ID or "mock-client-id",
                "sub": sub,
                "email": email,
                "name": name,
                "email_verified": True
            }


    # Real Google ID token verification
    from google.oauth2 import id_token
    from google.auth.transport import requests

    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_ID.strip():
        raise ValueError("GOOGLE_CLIENT_ID is not configured.")

    try:
        id_info = id_token.verify_oauth2_token(
            id_token_str, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except Exception as e:
        raise ValueError(f"Google token verification failed: {str(e)}")

    if id_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        raise ValueError("Invalid issuer")

    return id_info

