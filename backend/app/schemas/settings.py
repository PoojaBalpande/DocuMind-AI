"""Settings schemas — Pydantic v2 request/response models for user settings."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class UserSettingsResponse(BaseModel):
    id: str
    user_id: str
    model_name: str
    temperature: float
    max_tokens: int
    retrieval_top_k: int
    default_scope: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    model_name: Optional[str] = Field(None, max_length=255)
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=100, le=8000)
    retrieval_top_k: Optional[int] = Field(None, ge=1, le=20)
    default_scope: Optional[str] = Field(None)

    @field_validator("default_scope")
    @classmethod
    def validate_default_scope(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in ("workspace", "current_document", "selected_documents"):
            raise ValueError(
                "default_scope must be 'workspace', 'current_document', or 'selected_documents'"
            )
        return v
