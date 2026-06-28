"""
NewsForge — Daily Metrics Snapshot Model
Aggregated daily metrics retained indefinitely for trend analysis.
"""

import uuid
from datetime import date, datetime

from sqlalchemy import Integer, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class DailyMetricsSnapshot(Base):
    __tablename__ = "daily_metrics_snapshot"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    snapshot_date: Mapped[date] = mapped_column(
        Date, unique=True, nullable=False, index=True
    )
    dau: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    new_signups: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_exports: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_voice_gens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_script_gens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<DailyMetrics {self.snapshot_date}>"
