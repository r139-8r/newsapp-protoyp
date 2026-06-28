"""
NewsForge — Analytics Service
Helper functions for logging activity and generating analytics summaries.
"""

import uuid
from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity_log import ActivityLog
from app.models.ai_usage_log import AIUsageLog
from app.models.daily_metrics import DailyMetricsSnapshot
from app.models.user import User


async def log_activity(
    db: AsyncSession,
    user_id: Optional[uuid.UUID],
    event_type: str,
    metadata: Optional[dict] = None,
) -> None:
    """Log a user activity event. No PII in metadata."""
    db.add(ActivityLog(
        user_id=user_id,
        event_type=event_type,
        metadata_=metadata or {},
    ))


async def log_ai_usage(
    db: AsyncSession,
    user_id: uuid.UUID,
    usage_type: str,
    input_length: int,
    model: str,
    voice_id: Optional[str] = None,
    language: str = "en",
    tokens: Optional[int] = None,
) -> None:
    """Log an AI generation event (count only, no content)."""
    db.add(AIUsageLog(
        user_id=user_id,
        usage_type=usage_type,
        input_length=input_length,
        model_used=model,
        voice_id=voice_id,
        language=language,
        tokens_used=tokens,
    ))


async def snapshot_daily_metrics(db: AsyncSession) -> None:
    """
    Aggregate daily metrics into the snapshot table.
    Called by APScheduler at midnight UTC.
    Uses upsert to be safe for re-runs.
    """
    today = date.today()
    today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)

    dau = (await db.execute(
        select(func.count(func.distinct(ActivityLog.user_id)))
        .where(ActivityLog.created_at >= today_start, ActivityLog.user_id.is_not(None))
    )).scalar_one()

    new_signups = (await db.execute(
        select(func.count(User.id)).where(User.created_at >= today_start)
    )).scalar_one()

    total_exports = (await db.execute(
        select(func.count(ActivityLog.id))
        .where(ActivityLog.event_type == "export_completed", ActivityLog.created_at >= today_start)
    )).scalar_one()

    total_voice = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "voice_generation", AIUsageLog.created_at >= today_start)
    )).scalar_one()

    total_script = (await db.execute(
        select(func.count(AIUsageLog.id))
        .where(AIUsageLog.usage_type == "script_generation", AIUsageLog.created_at >= today_start)
    )).scalar_one()

    # Upsert the snapshot
    result = await db.execute(
        select(DailyMetricsSnapshot).where(DailyMetricsSnapshot.snapshot_date == today)
    )
    snapshot = result.scalar_one_or_none()

    if snapshot:
        snapshot.dau = dau
        snapshot.new_signups = new_signups
        snapshot.total_exports = total_exports
        snapshot.total_voice_gens = total_voice
        snapshot.total_script_gens = total_script
    else:
        db.add(DailyMetricsSnapshot(
            snapshot_date=today,
            dau=dau,
            new_signups=new_signups,
            total_exports=total_exports,
            total_voice_gens=total_voice,
            total_script_gens=total_script,
        ))

    await db.commit()


async def cleanup_old_logs(db: AsyncSession, days: int = 60) -> None:
    """Delete activity and AI usage logs older than `days` days."""
    from datetime import timedelta
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    await db.execute(delete(ActivityLog).where(ActivityLog.created_at < cutoff))
    await db.execute(delete(AIUsageLog).where(AIUsageLog.created_at < cutoff))
    await db.commit()
