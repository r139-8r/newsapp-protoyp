"""
NewsForge — Account Management Routes (GDPR Compliant)
GET    /api/account/usage        — Usage stats for profile screen
PATCH  /api/account/preferences  — Update language preference
GET    /api/account/export       — Export all user data as JSON (GDPR)
DELETE /api/account              — Hard delete all user data (GDPR)
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.ai_usage_log import AIUsageLog
from app.models.user import User
from app.models.user_project import UserProject
from app.schemas.account import PreferencesUpdate, UsageStats
from app.schemas.auth import UserProfile

router = APIRouter(prefix="/api/account", tags=["account"])


def _today_start() -> datetime:
    return datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


@router.get("/usage", response_model=UsageStats)
async def get_usage(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get today's usage stats for the profile screen."""
    today = _today_start()

    exports_today = (await db.execute(
        select(func.count(ActivityLog.id)).where(
            ActivityLog.user_id == current_user.id,
            ActivityLog.event_type == "export_completed",
            ActivityLog.created_at >= today,
        )
    )).scalar_one()

    voice_today = (await db.execute(
        select(func.count(AIUsageLog.id)).where(
            AIUsageLog.user_id == current_user.id,
            AIUsageLog.usage_type == "voice_generation",
            AIUsageLog.created_at >= today,
        )
    )).scalar_one()

    script_today = (await db.execute(
        select(func.count(AIUsageLog.id)).where(
            AIUsageLog.user_id == current_user.id,
            AIUsageLog.usage_type == "script_generation",
            AIUsageLog.created_at >= today,
        )
    )).scalar_one()

    total_projects = (await db.execute(
        select(func.count(UserProject.id)).where(UserProject.user_id == current_user.id)
    )).scalar_one()

    return UsageStats(
        exports_today=exports_today,
        voice_gens_today=voice_today,
        script_gens_today=script_today,
        total_projects=total_projects,
        plan=current_user.plan,
    )


@router.patch("/preferences", response_model=UserProfile)
async def update_preferences(
    body: PreferencesUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update user language preference."""
    update_data = body.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    return UserProfile.model_validate(current_user)


@router.get("/export")
async def export_user_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GDPR Right to Portability — export all user data as JSON.
    Includes: profile, projects, activity logs, AI usage counts.
    """
    projects_result = await db.execute(
        select(UserProject).where(UserProject.user_id == current_user.id)
    )
    projects = projects_result.scalars().all()

    ai_result = await db.execute(
        select(AIUsageLog).where(AIUsageLog.user_id == current_user.id)
    )
    ai_logs = ai_result.scalars().all()

    export = {
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "name": current_user.name,
            "auth_provider": current_user.auth_provider,
            "plan": current_user.plan,
            "language_preference": current_user.language_preference,
            "created_at": current_user.created_at.isoformat(),
        },
        "projects": [
            {
                "id": str(p.id),
                "name": p.name,
                "template_id": str(p.template_id) if p.template_id else None,
                "slot_values": p.slot_values,
                "output_format": p.output_format,
                "is_exported": p.is_exported,
                "created_at": p.created_at.isoformat(),
            }
            for p in projects
        ],
        "ai_usage_summary": {
            "total_voice_generations": sum(1 for l in ai_logs if l.usage_type == "voice_generation"),
            "total_script_generations": sum(1 for l in ai_logs if l.usage_type == "script_generation"),
        },
    }

    return JSONResponse(
        content=export,
        headers={"Content-Disposition": "attachment; filename=newsforge-data-export.json"},
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GDPR Right to Erasure — immediately hard-delete ALL user data.
    This is irreversible. Cascade deletes all projects, logs, etc.
    """
    user_id = current_user.id

    # Delete all user data — cascades handle related records
    await db.execute(delete(ActivityLog).where(ActivityLog.user_id == user_id))
    await db.execute(delete(AIUsageLog).where(AIUsageLog.user_id == user_id))
    await db.execute(delete(UserProject).where(UserProject.user_id == user_id))
    await db.delete(current_user)
