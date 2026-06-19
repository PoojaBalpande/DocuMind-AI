"""Analytics API endpoints — JWT-protected workspace statistics."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.analytics import WorkspaceOverviewResponse
from app.schemas.analytics_insights import AnalyticsInsightsResponse
from app.services.analytics_service import AnalyticsService
from app.services.analytics_insights_service import AnalyticsInsightsService

router = APIRouter()


@router.get("/overview", response_model=WorkspaceOverviewResponse)
def get_workspace_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve workspace-level statistics for the authenticated user."""
    return AnalyticsService.get_workspace_overview(db, current_user.id)


@router.get("/insights", response_model=AnalyticsInsightsResponse)
def get_workspace_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve detailed usage insights for the authenticated user."""
    return AnalyticsInsightsService.get_workspace_insights(db, current_user.id)
