"""Chat schemas — Pydantic v2 request/response models.

V8: ChatAskRequest adds optional document_id for retrieval mode control.
ChatAskSource enriched with document_id, chunk_id, snippet, similarity_score.
"""

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
    document_id: str | None = None  # V8: None = multi-doc, str = single-doc


class ChatAskSource(BaseModel):
    document: str
    document_id: str | None = None      # V8: source document UUID
    page: int | None = None
    chunk_id: str | None = None         # V8: chunk UUID for traceability
    snippet: str | None = None          # V8: chunk text excerpt
    similarity_score: float | None = None  # V8: 0-1 relevance score


class ChatAskResponse(BaseModel):
    answer: str
    sources: list[ChatAskSource]
