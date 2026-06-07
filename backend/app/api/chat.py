"""Chat API endpoints — session management (no AI yet)."""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, Message
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatAskRequest,
    ChatAskResponse,
    MessageResponse,
)
from app.services.rag.rag_pipeline import run_rag_pipeline

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


@router.post("/ask", response_model=ChatAskResponse)
def ask_question(
    data: ChatAskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ask a question grounded in the user's uploaded documents."""
    # 1. Validate session ownership
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == data.session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    # 2. Run the RAG pipeline
    result = run_rag_pipeline(db, current_user.id, data.message)

    # 3. Store the user's query
    user_message = Message(
        session_id=session.id,
        role="user",
        content=data.message,
    )
    db.add(user_message)

    # 4. Store the assistant's answer with citations
    assistant_message = Message(
        session_id=session.id,
        role="assistant",
        content=result["answer"],
        citations=result["sources"],
    )
    db.add(assistant_message)

    # 5. Commit messages to DB
    db.commit()

    return ChatAskResponse(
        answer=result["answer"],
        sources=result["sources"],
    )


@router.get("/sessions/{session_id}/messages", response_model=list[MessageResponse])
def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve chat history (messages) for a specific session."""
    # 1. Validate session ownership
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found",
        )

    # 2. Retrieve messages ordered by creation date
    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [MessageResponse.model_validate(m) for m in messages]

