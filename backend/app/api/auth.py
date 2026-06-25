"""Authentication API endpoints — register, login, me, logout."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user, verify_google_token
from app.models.user import User
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, UserResponse, GoogleLoginRequest

router = APIRouter()
logger = logging.getLogger(__name__)


def _set_access_cookie(response: Response, access_token: str) -> None:
    """Set the access_token cookie with production-safe defaults from config."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN or None,
        path="/",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def _delete_access_cookie(response: Response) -> None:
    """Delete the access_token cookie, matching the attributes used to set it."""
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        domain=settings.COOKIE_DOMAIN or None,
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    """Create a new user account."""
    client_host = request.client.host if request.client else "unknown"
    logger.info(f"Registration attempt started: email={data.email}, ip={client_host}")
    # Check for duplicate email
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        logger.warning(f"Registration failed: email={data.email} already exists, ip={client_host}")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"Registration successful: user_id={user.id}, email={user.email}, ip={client_host}")
    return user


@router.post("/login", response_model=TokenResponse)
def login(response: Response, data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate and return a JWT access token."""
    client_host = request.client.host if request.client else "unknown"
    logger.info(f"Login attempt: email={data.email}, ip={client_host}")
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        logger.warning(f"Login failed: email={data.email}, reason=invalid credentials, ip={client_host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        logger.warning(f"Login failed: email={data.email}, reason=account disabled, ip={client_host}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    access_token = create_access_token(data={"sub": user.id})
    _set_access_cookie(response, access_token)
    logger.info(f"Login successful: user_id={user.id}, email={user.email}, method=credentials, ip={client_host}")
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return current_user


@router.post("/logout")
def logout(response: Response, request: Request):
    """Logout — clear the access_token cookie."""
    user_info = "anonymous"
    try:
        token = request.cookies.get("access_token")
        if token:
            from app.core.security import decode_token
            payload = decode_token(token)
            user_id = payload.get("sub")
            if user_id:
                user_info = f"user_id={user_id}"
    except Exception:
        pass
    client_host = request.client.host if request.client else "unknown"
    logger.info(f"User logout: {user_info}, ip={client_host}")
    _delete_access_cookie(response)
    return {"message": "Logged out successfully"}


@router.post("/google", response_model=TokenResponse)
def google_login(response: Response, data: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate via Google ID token."""
    client_host = request.client.host if request.client else "unknown"
    logger.info(f"Google login attempt: ip={client_host}")
    try:
        payload = verify_google_token(data.id_token)
    except Exception as e:
        logger.warning(f"Google login failed verification: reason={str(e)}, ip={client_host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )

    email = payload.get("email")
    google_sub = payload.get("sub")
    name = payload.get("name", "Google User")

    if not email:
        logger.warning(f"Google login failed: missing email in token payload, ip={client_host}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token does not contain an email address"
        )

    # Search user by email
    user = db.query(User).filter(User.email == email).first()

    if user:
        # User exists: link account if not already linked
        if not user.google_sub:
            user.google_sub = google_sub
        if not user.oauth_provider:
            user.oauth_provider = "google"
        db.commit()
    else:
        # User does not exist: create automatically
        user = User(
            name=name,
            email=email,
            oauth_provider="google",
            google_sub=google_sub,
            hashed_password=None,  # Google users do not have password hashes
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        logger.warning(f"Google login failed: user account is disabled for email={email}, ip={client_host}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    # Issue DocuMind access token
    access_token = create_access_token(data={"sub": user.id})
    _set_access_cookie(response, access_token)
    logger.info(f"Google login successful: user_id={user.id}, email={user.email}, google_sub={google_sub}, ip={client_host}")
    return TokenResponse(access_token=access_token)

