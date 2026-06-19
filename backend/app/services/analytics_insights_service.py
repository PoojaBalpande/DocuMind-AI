"""Analytics insights service — business logic for detailed usage insights."""

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.document import Document
from app.models.chat import ChatSession, Message


class AnalyticsInsightsService:
    """Handles querying and calculating workspace usage insights."""

    @staticmethod
    def get_workspace_insights(db: Session, user_id: str) -> dict:
        """Fetch recent activities, upload trends, message trends, and most active chats."""
        # 1. Fetch recent activities
        # 1.1 Document Uploads (up to 20)
        docs = (
            db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.created_at.desc())
            .limit(20)
            .all()
        )
        activities = []
        for doc in docs:
            activities.append({
                "type": "document_upload",
                "description": f"Uploaded {doc.original_filename}",
                "timestamp": doc.created_at,
            })

        # 1.2 Chat Sessions Created (up to 20, non-deleted)
        chats = (
            db.query(ChatSession)
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False
            )
            .order_by(ChatSession.created_at.desc())
            .limit(20)
            .all()
        )
        for chat in chats:
            activities.append({
                "type": "chat_created",
                "description": f"Started chat: {chat.title}",
                "timestamp": chat.created_at,
            })

        # 1.3 Recent Questions Asked (up to 20, from active sessions, role == 'user')
        msgs = (
            db.query(Message)
            .join(ChatSession, ChatSession.id == Message.session_id)
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False,
                Message.role == "user"
            )
            .order_by(Message.created_at.desc())
            .limit(20)
            .all()
        )
        for msg in msgs:
            activities.append({
                "type": "recent_question",
                "description": f"Asked: {msg.content}",
                "timestamp": msg.created_at,
            })

        # Sort combined activity feed by timestamp descending, limit to 20
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        recent_activity = activities[:20]

        # 2. Time boundaries for trends (in UTC)
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())  # Current week starting Monday
        month_start = today_start.replace(day=1)                          # Current month starting 1st

        # 3. Document Upload Trends
        upload_today = (
            db.query(func.count(Document.id))
            .filter(Document.user_id == user_id, Document.created_at >= today_start)
            .scalar()
        ) or 0
        upload_week = (
            db.query(func.count(Document.id))
            .filter(Document.user_id == user_id, Document.created_at >= week_start)
            .scalar()
        ) or 0
        upload_month = (
            db.query(func.count(Document.id))
            .filter(Document.user_id == user_id, Document.created_at >= month_start)
            .scalar()
        ) or 0

        # 4. Chat Message Trends
        chat_today = (
            db.query(func.count(Message.id))
            .join(ChatSession, ChatSession.id == Message.session_id)
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False,
                Message.created_at >= today_start
            )
            .scalar()
        ) or 0
        chat_week = (
            db.query(func.count(Message.id))
            .join(ChatSession, ChatSession.id == Message.session_id)
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False,
                Message.created_at >= week_start
            )
            .scalar()
        ) or 0
        chat_month = (
            db.query(func.count(Message.id))
            .join(ChatSession, ChatSession.id == Message.session_id)
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False,
                Message.created_at >= month_start
            )
            .scalar()
        ) or 0

        # 5. Top 5 active chats by message volume (excluding deleted chats)
        top_chats_results = (
            db.query(
                ChatSession.id.label("session_id"),
                ChatSession.title.label("title"),
                func.count(Message.id).label("message_count")
            )
            .join(Message, Message.session_id == ChatSession.id)
            .filter(
                ChatSession.user_id == user_id,
                ChatSession.is_deleted == False
            )
            .group_by(ChatSession.id)
            .order_by(func.count(Message.id).desc())
            .limit(5)
            .all()
        )

        top_chats = []
        for session_id, title, count in top_chats_results:
            top_chats.append({
                "session_id": session_id,
                "title": title,
                "message_count": count
            })

        return {
            "recent_activity": recent_activity,
            "upload_trends": {
                "today": upload_today,
                "week": upload_week,
                "month": upload_month,
            },
            "chat_trends": {
                "today": chat_today,
                "week": chat_week,
                "month": chat_month,
            },
            "top_chats": top_chats,
        }
