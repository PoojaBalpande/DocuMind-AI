"""WorkspaceMember service — business logic for member management."""

from sqlalchemy.orm import Session
from app.models.workspace_member import WorkspaceMember
from app.schemas.workspace_member import CreateMemberRequest


class MemberService:
    """Handles workspace members query and edit operations."""

    @staticmethod
    def get_members(db: Session, user_id: str) -> list[WorkspaceMember]:
        """Retrieve all active members scoped to the current user."""
        return (
            db.query(WorkspaceMember)
            .filter(
                WorkspaceMember.user_id == user_id,
                WorkspaceMember.status != "removed"
            )
            .order_by(WorkspaceMember.created_at.asc())
            .all()
        )

    @staticmethod
    def invite_member(db: Session, user_id: str, data: CreateMemberRequest) -> WorkspaceMember:
        """Create a new member record with status 'pending'."""
        # Check if an active or pending member with the same email already exists for this user
        existing = (
            db.query(WorkspaceMember)
            .filter(
                WorkspaceMember.user_id == user_id,
                WorkspaceMember.member_email == str(data.member_email),
                WorkspaceMember.status != "removed"
            )
            .first()
        )
        if existing:
            raise ValueError("Member with this email is already active or pending in the workspace")

        member = WorkspaceMember(
            user_id=user_id,
            member_email=str(data.member_email),
            member_name=data.member_name,
            role=data.role,
            status="pending",
        )
        db.add(member)
        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def update_role(db: Session, user_id: str, member_id: str, new_role: str) -> WorkspaceMember:
        """Update role for a member. Cannot modify owner role."""
        member = (
            db.query(WorkspaceMember)
            .filter(
                WorkspaceMember.id == member_id,
                WorkspaceMember.user_id == user_id,
                WorkspaceMember.status != "removed"
            )
            .first()
        )
        if not member:
            raise KeyError("Member not found")

        # Owner protection
        if member.role == "owner":
            raise ValueError("Cannot modify owner role")
        if new_role == "owner":
            raise ValueError("Cannot set owner role via this action")

        member.role = new_role
        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def remove_member(db: Session, user_id: str, member_id: str) -> WorkspaceMember:
        """Soft remove a member by updating status to 'removed'."""
        member = (
            db.query(WorkspaceMember)
            .filter(
                WorkspaceMember.id == member_id,
                WorkspaceMember.user_id == user_id,
                WorkspaceMember.status != "removed"
            )
            .first()
        )
        if not member:
            raise KeyError("Member not found")

        # Owner protection
        if member.role == "owner":
            raise ValueError("Cannot remove owner")

        member.status = "removed"
        db.commit()
        db.refresh(member)
        return member
