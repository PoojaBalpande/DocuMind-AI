"""Settings service — business logic for user settings management."""

from sqlalchemy.orm import Session

from app.models.user_settings import UserSettings
from app.schemas.settings import UserSettingsUpdate


# Centralized defaults — single source of truth for default values.
SETTINGS_DEFAULTS = {
    "model_name": "qwen2.5",
    "temperature": 0.3,
    "max_tokens": 2000,
    "retrieval_top_k": 5,
    "default_scope": "workspace",
}


class SettingsService:
    """Handles user settings retrieval, update, and reset."""

    @staticmethod
    def get_or_create_settings(db: Session, user_id: str) -> UserSettings:
        """Retrieve settings for a user, creating defaults if none exist."""
        settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if not settings:
            settings = UserSettings(user_id=user_id, **SETTINGS_DEFAULTS)
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    @staticmethod
    def update_settings(
        db: Session, user_id: str, update_data: UserSettingsUpdate
    ) -> UserSettings:
        """Partially update user settings with validated data."""
        settings = SettingsService.get_or_create_settings(db, user_id)
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(settings, key, value)
        db.commit()
        db.refresh(settings)
        return settings

    @staticmethod
    def reset_settings(db: Session, user_id: str) -> UserSettings:
        """Reset user settings to system defaults."""
        settings = SettingsService.get_or_create_settings(db, user_id)
        for key, value in SETTINGS_DEFAULTS.items():
            setattr(settings, key, value)
        db.commit()
        db.refresh(settings)
        return settings
