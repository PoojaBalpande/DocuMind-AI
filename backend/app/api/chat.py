"""Chat API endpoints — session management (no AI yet)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import ChatSession
from app.schemas.chat import ChatSessionCreate, ChatSessionResponse

router = APIRouter()


@router.get("/sessions", response_model=list[ChatSessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all chat sessions for the authenticated user."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [ChatSessionResponse.model_validate(s) for s in sessions]


@router.post("/session", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    data: ChatSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new chat session."""
    session = ChatSession(
        user_id=current_user.id,
        title=data.title,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return ChatSessionResponse.model_validate(session)
