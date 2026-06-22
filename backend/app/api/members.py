"""WorkspaceMember API endpoints — get, invite, edit, and remove team members."""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.validators import validate_uuid
from app.models.user import User
from app.schemas.workspace_member import (
    MemberResponse,
    CreateMemberRequest,
    UpdateMemberRoleRequest,
)
from app.services.member_service import MemberService

router = APIRouter()


@router.get("", response_model=list[MemberResponse])
def get_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve all active workspace members for the current user."""
    return MemberService.get_members(db, current_user.id)


@router.post("", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def invite_member(
    data: CreateMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Invite a new member to the workspace."""
    try:
        return MemberService.invite_member(db, current_user.id, data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/{id}/role", response_model=MemberResponse)
def update_member_role(
    id: str,
    data: UpdateMemberRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update role for a specific workspace member."""
    validate_uuid(id, "member_id")
    try:
        return MemberService.update_role(db, current_user.id, id, data.role)
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{id}", response_model=MemberResponse)
def remove_member(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft remove a member from the workspace."""
    validate_uuid(id, "member_id")
    try:
        return MemberService.remove_member(db, current_user.id, id)
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
