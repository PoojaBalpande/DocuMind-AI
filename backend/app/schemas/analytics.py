"""Analytics schemas — Pydantic request/response models for workspace analytics."""

from pydantic import BaseModel


class WorkspaceOverviewResponse(BaseModel):
    total_documents: int
    total_chats: int
    total_messages: int
    storage_used_mb: float

    model_config = {"from_attributes": True}
