"""
NewsForge — Export Tracking & Health Routes
POST /api/exports/log        — Log an export event (analytics only)
GET  /api/exports/remaining  — Remaining exports today (unlimited in v1)
GET  /health                 — Keep-alive health check
GET  /api/app/config         — App version check for force-update
POST /api/errors/log         — Client-side error reporting
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.config import settings
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.schemas.account import (
    AppConfigResponse,
    ErrorLogRequest,
    ExportLogRequest,
    ExportRemainingResponse,
)
from app.services import tts_service

exports_router = APIRouter(prefix="/api/exports", tags=["exports"])
health_router = APIRouter(tags=["health"])


@exports_router.post("/log", status_code=status.HTTP_201_CREATED)
async def log_export(
    body: ExportLogRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Log a completed export event for analytics.
    Called by mobile client after successful image/video export.
    No file is uploaded — this is analytics-only.
    """
    db.add(ActivityLog(
        user_id=current_user.id,
        event_type="export_completed",
        metadata_={
            "template_id": str(body.template_id),
            "output_format": body.output_format,
            "output_size_name": body.output_size_name,
        },
    ))
    return {"status": "logged"}


@exports_router.get("/remaining", response_model=ExportRemainingResponse)
async def get_remaining_exports(
    _: User = Depends(get_current_user),
):
    """
    v1: All users have unlimited exports.
    v1.1+: Will enforce hidden per-tier limits.
    """
    return ExportRemainingResponse(remaining=-1, limit=-1, is_unlimited=True)


@health_router.get("/health")
async def health_check():
    """
    Health check endpoint for HuggingFace Space keep-alive cron (every 4 min).
    Returns 200 as long as the server is up.
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "env": settings.APP_ENV,
        "tts_status": "healthy" if tts_service.is_tts_healthy() else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@health_router.get("/api/app/config", response_model=AppConfigResponse)
async def app_config():
    """
    App version check called on each app launch.
    Returns min_supported_version for force-update and maintenance_mode flag.
    """
    return AppConfigResponse(
        min_supported_version=settings.MIN_SUPPORTED_VERSION,
        latest_version=settings.APP_VERSION,
        maintenance_mode=False,
    )


@health_router.post("/api/errors/log", status_code=status.HTTP_201_CREATED)
async def log_client_error(body: ErrorLogRequest):
    """
    Client-side error reporting from the mobile app.
    Logs to stderr (captured by HuggingFace Space logs).
    """
    import sys
    print(
        f"[CLIENT_ERROR] type={body.error_type} msg={body.message} "
        f"version={body.app_version}",
        file=sys.stderr,
    )
    return {"status": "logged"}
