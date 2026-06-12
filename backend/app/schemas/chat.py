"""Chat schemas — Pydantic v2 request/response models."""

from datetime import datetime
from pydantic import BaseModel, Field


class ChatSessionCreate(BaseModel):
    title: str = Field(default="New Chat", max_length=255)


class ChatSessionUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: list[dict] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatAskRequest(BaseModel):
    session_id: str
    message: str


class ChatAskSource(BaseModel):
    document: str
    page: int | None = None


class ChatAskResponse(BaseModel):
    answer: str
    sources: list[ChatAskSource]

