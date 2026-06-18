"""Settings API endpoints — get, update, and reset user settings."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.settings import UserSettingsResponse, UserSettingsUpdate
from app.services.settings_service import SettingsService

router = APIRouter()


@router.get("", response_model=UserSettingsResponse)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve settings for the currently authenticated user."""
    return SettingsService.get_or_create_settings(db, current_user.id)


@router.patch("", response_model=UserSettingsResponse)
def update_settings(
    data: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Partially update settings for the currently authenticated user."""
    return SettingsService.update_settings(db, current_user.id, data)


@router.post("/reset", response_model=UserSettingsResponse)
def reset_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reset settings to system defaults for the currently authenticated user."""
    return SettingsService.reset_settings(db, current_user.id)
