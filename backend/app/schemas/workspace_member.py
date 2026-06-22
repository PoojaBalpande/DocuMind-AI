"""WorkspaceMember schemas — Pydantic request/response models for team members."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.validators import validate_non_empty_string, strip_whitespace


class MemberResponse(BaseModel):
    id: str
    workspace_id: str | None
    user_id: str
    member_email: str
    member_name: str
    role: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CreateMemberRequest(BaseModel):
    member_name: str = Field(..., min_length=1, max_length=255)
    member_email: EmailStr
    role: str = Field("viewer", pattern="^(owner|admin|member|viewer)$")

    @field_validator("member_name")
    @classmethod
    def check_member_name(cls, v: str) -> str:
        v = strip_whitespace(v)
        return validate_non_empty_string(v)


class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(..., pattern="^(owner|admin|member|viewer)$")
