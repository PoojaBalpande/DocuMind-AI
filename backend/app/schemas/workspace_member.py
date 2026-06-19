"""WorkspaceMember schemas — Pydantic request/response models for team members."""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


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


class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(..., pattern="^(owner|admin|member|viewer)$")
