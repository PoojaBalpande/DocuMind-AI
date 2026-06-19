"""Analytics service — business logic for gathering workspace analytics."""

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.document import Document
from app.models.chat import ChatSession, Message


class AnalyticsService:
    """Handles querying and calculating workspace-level stats."""

    @staticmethod
    def get_workspace_overview(db: Session, user_id: str) -> dict:
        """Calculate documents count, chats count, messages count, and storage used for a user."""
        # 1. Total Documents
        total_documents = (
            db.query(func.count(Document.id))
            .filter(Document.user_id == user_id)
            .scalar()
        ) or 0

        # 2. Total Chats (exclude soft-deleted)
        total_chats = (
            db.query(func.count(ChatSession.id))
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False
            )
            .scalar()
        ) or 0

        # 3. Total Messages (belonging to active chat sessions)
        total_messages = (
            db.query(func.count(Message.id))
            .join(ChatSession, ChatSession.id == Message.session_id)
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False
            )
            .scalar()
        ) or 0

        # 4. Storage Used in MB (sum of document sizes divided by 1024 * 1024)
        total_bytes = (
            db.query(func.sum(Document.file_size))
            .filter(Document.user_id == user_id)
            .scalar()
        ) or 0

        storage_used_mb = round(float(total_bytes) / (1024.0 * 1024.0), 1)

        return {
            "total_documents": total_documents,
            "total_chats": total_chats,
            "total_messages": total_messages,
            "storage_used_mb": storage_used_mb,
        }
