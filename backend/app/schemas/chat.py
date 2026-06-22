"""Chat schemas — Pydantic v2 request/response models.

V8: ChatAskRequest adds optional document_id for retrieval mode control.
ChatAskSource enriched with document_id, chunk_id, snippet, similarity_score.
"""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_validator

from app.core.validators import validate_non_empty_string, strip_whitespace, validate_uuid_format


class ChatSessionCreate(BaseModel):
    title: str = Field(default="New Chat", min_length=1, max_length=255)

    @field_validator("title")
    @classmethod
    def check_title(cls, v: str) -> str:
        v = strip_whitespace(v)
        return validate_non_empty_string(v)


class ChatSessionUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)

    @field_validator("title")
    @classmethod
    def check_title(cls, v: str) -> str:
        v = strip_whitespace(v)
        return validate_non_empty_string(v)


class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentContributionSchema(BaseModel):
    document_id: UUID
    document_name: str
    chunk_ids: list[str]


class MessageResponse(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: list[dict] | None = None
    reasoning_metadata: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatAskRequest(BaseModel):
    session_id: str
    message: str = Field(..., min_length=1, max_length=5000)
    document_id: str | None = None  # V8: None = multi-doc, str = single-doc
    document_ids: list[str] | None = Field(default=None, max_length=20)  # V8 Phase 2: list of document IDs for scope filtering

    @field_validator("session_id")
    @classmethod
    def check_session_id(cls, v: str) -> str:
        return validate_uuid_format(v)

    @field_validator("document_id")
    @classmethod
    def check_document_id(cls, v: str | None) -> str | None:
        if v is not None:
            return validate_uuid_format(v)
        return v

    @field_validator("document_ids")
    @classmethod
    def check_document_ids(cls, v: list[str] | None) -> list[str] | None:
        if v is not None:
            if len(v) > 20:
                raise ValueError("document_ids list cannot exceed 20 items")
            for doc_id in v:
                validate_uuid_format(doc_id)
        return v

    @field_validator("message")
    @classmethod
    def check_message(cls, v: str) -> str:
        v = strip_whitespace(v)
        return validate_non_empty_string(v)



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
    reasoning_intent: str | None = None
    document_contributions: list[DocumentContributionSchema] | None = None

