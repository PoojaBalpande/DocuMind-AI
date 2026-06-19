"""Analytics insights schemas — Pydantic models for workspace usage insights."""

from datetime import datetime
from pydantic import BaseModel


class ActivityItem(BaseModel):
    type: str  # "document_upload", "chat_created", "recent_question"
    description: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class UploadTrends(BaseModel):
    today: int
    week: int
    month: int

    model_config = {"from_attributes": True}


class ChatTrends(BaseModel):
    today: int
    week: int
    month: int

    model_config = {"from_attributes": True}


class TopChat(BaseModel):
    session_id: str
    title: str
    message_count: int

    model_config = {"from_attributes": True}


class AnalyticsInsightsResponse(BaseModel):
    recent_activity: list[ActivityItem]
    upload_trends: UploadTrends
    chat_trends: ChatTrends
    top_chats: list[TopChat]

    model_config = {"from_attributes": True}
