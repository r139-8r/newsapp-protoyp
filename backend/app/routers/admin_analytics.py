"""
NewsForge — Admin Analytics Routes
GET /admin/analytics/overview   — DAU, exports, AI usage, signups
GET /admin/analytics/templates  — Template performance stats
GET /admin/analytics/users      — User retention and plan distribution
GET /admin/analytics/ai-usage   — Voice/script generation breakdown
"""

from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_admin
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.admin_user import AdminUser
from app.models.ai_usage_log import AIUsageLog
from app.models.template import Template
from app.models.user import User
from app.schemas.admin import AIUsageStats, OverviewStats, TemplateStats

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])


def _today_start() -> datetime:
    return datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)


def _week_start() -> datetime:
    return _today_start() - timedelta(days=7)


@router.get("/overview", response_model=OverviewStats)
async def analytics_overview(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """High-level overview metrics for the admin dashboard home."""
    today = _today_start()

    # Total users
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()

    # New users today
    new_users_today = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= today)
    )).scalar_one()

    # DAU — unique users with activity today
    dau = (await db.execute(
        select(func.count(func.distinct(ActivityLog.user_id)))
        .where(ActivityLog.created_at >= today, ActivityLog.user_id.is_not(None))
    )).scalar_one()

    # Exports today
    total_exports_today = (await db.execute(
        select(func.count(ActivityLog.id))
        .where(ActivityLog.event_type == "export_completed", ActivityLog.created_at >= today)
    )).scalar_one()

    # Voice gens today
    total_voice_gens_today = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "voice_generation", AIUsageLog.created_at >= today)
    )).scalar_one()

    # Script gens today
    total_script_gens_today = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "script_generation", AIUsageLog.created_at >= today)
    )).scalar_one()

    # Published templates
    total_templates_published = (await db.execute(
        select(func.count(Template.id)).where(Template.status == "published")
    )).scalar_one()

    return OverviewStats(
        total_users=total_users,
        new_users_today=new_users_today,
        dau=dau,
        total_exports_today=total_exports_today,
        total_voice_gens_today=total_voice_gens_today,
        total_script_gens_today=total_script_gens_today,
        total_templates_published=total_templates_published,
    )


@router.get("/templates", response_model=list[TemplateStats])
async def analytics_templates(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """Template performance sorted by download count."""
    result = await db.execute(
        select(Template)
        .where(Template.status == "published")
        .order_by(Template.download_count.desc())
        .limit(50)
    )
    templates = result.scalars().all()
    return [TemplateStats.model_validate(t) for t in templates]


@router.get("/users")
async def analytics_users(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """User metrics: totals, retention, new user trend."""
    today = _today_start()
    week_ago = _week_start()

    total = (await db.execute(select(func.count(User.id)))).scalar_one()
    new_today = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= today)
    )).scalar_one()
    new_this_week = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_ago)
    )).scalar_one()

    return {
        "total_users": total,
        "new_today": new_today,
        "new_this_week": new_this_week,
        "plan_distribution": {"free": total},  # v1 all free
    }


@router.get("/ai-usage", response_model=AIUsageStats)
async def analytics_ai_usage(
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """AI feature usage breakdown."""
    today = _today_start()
    week_ago = _week_start()

    voice_today = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "voice_generation", AIUsageLog.created_at >= today)
    )).scalar_one()

    script_today = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "script_generation", AIUsageLog.created_at >= today)
    )).scalar_one()

    voice_week = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "voice_generation", AIUsageLog.created_at >= week_ago)
    )).scalar_one()

    script_week = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "script_generation", AIUsageLog.created_at >= week_ago)
    )).scalar_one()

    # Top voices used
    voice_result = await db.execute(
        select(AIUsageLog.voice_id, func.count(AIUsageLog.id).label("count"))
        .where(AIUsageLog.usage_type == "voice_generation", AIUsageLog.voice_id.is_not(None))
        .group_by(AIUsageLog.voice_id)
        .order_by(func.count(AIUsageLog.id).desc())
        .limit(5)
    )
    top_voices = [{"voice_id": row[0], "count": row[1]} for row in voice_result]

    # Top languages
    lang_result = await db.execute(
        select(AIUsageLog.language, func.count(AIUsageLog.id).label("count"))
        .group_by(AIUsageLog.language)
        .order_by(func.count(AIUsageLog.id).desc())
        .limit(5)
    )
    top_languages = [{"language": row[0], "count": row[1]} for row in lang_result]

    return AIUsageStats(
        voice_generations_today=voice_today,
        script_generations_today=script_today,
        voice_generations_week=voice_week,
        script_generations_week=script_week,
        top_voices=top_voices,
        top_languages=top_languages,
    )
