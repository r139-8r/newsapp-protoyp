"""
NewsForge — Background Scheduler (APScheduler)
Manages recurring background tasks:
1. TTS health check (every 60 minutes)
2. Daily metrics snapshot (daily at 00:05 UTC)
3. Activity log cleanup (daily at 01:00 UTC — 60-day rolling retention)
"""

import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import async_session_factory
from app.services import tts_service

_scheduler: AsyncIOScheduler | None = None


async def _run_tts_health_check():
    """Ping Edge TTS to verify voice generation is operational."""
    healthy = await tts_service.health_check()
    status = "✓ healthy" if healthy else "✗ degraded"
    print(f"[Scheduler] TTS health check: {status}")


async def _run_daily_snapshot():
    """Aggregate today's metrics into daily_metrics_snapshot table."""
    from app.services.analytics_service import snapshot_daily_metrics
    async with async_session_factory() as db:
        await snapshot_daily_metrics(db)
    print("[Scheduler] Daily metrics snapshot completed")


async def _run_log_cleanup():
    """Delete activity and AI usage logs older than 60 days."""
    from app.services.analytics_service import cleanup_old_logs
    async with async_session_factory() as db:
        await cleanup_old_logs(db, days=60)
    print("[Scheduler] Log cleanup completed (>60 days removed)")


def start_scheduler() -> AsyncIOScheduler:
    """Create, configure, and start the APScheduler instance."""
    global _scheduler
    if _scheduler and _scheduler.running:
        return _scheduler

    _scheduler = AsyncIOScheduler(timezone="UTC")

    # TTS health check: every 60 minutes
    _scheduler.add_job(
        _run_tts_health_check,
        trigger=CronTrigger(minute=0),  # Top of every hour
        id="tts_health_check",
        replace_existing=True,
        misfire_grace_time=300,
    )

    # Daily metrics snapshot: every day at 00:05 UTC
    _scheduler.add_job(
        _run_daily_snapshot,
        trigger=CronTrigger(hour=0, minute=5),
        id="daily_snapshot",
        replace_existing=True,
        misfire_grace_time=600,
    )

    # Log cleanup: every day at 01:00 UTC
    _scheduler.add_job(
        _run_log_cleanup,
        trigger=CronTrigger(hour=1, minute=0),
        id="log_cleanup",
        replace_existing=True,
        misfire_grace_time=600,
    )

    _scheduler.start()
    print("[Scheduler] Started: TTS health check (hourly), daily snapshot (00:05), log cleanup (01:00)")
    return _scheduler


def stop_scheduler():
    """Gracefully stop the scheduler on app shutdown."""
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        print("[Scheduler] Stopped")
