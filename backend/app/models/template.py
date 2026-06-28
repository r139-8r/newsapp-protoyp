"""
NewsForge — Template Model
Central model for news templates created by admins, consumed by mobile users.
Uses JSONB for flexible canvas data, input slots, scenes, and voice config.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Template(Base):
    __tablename__ = "templates"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # breaking_news, sports, weather, politics, entertainment, business, general
    format: Mapped[str] = mapped_column(
        String(10), nullable=False
    )  # "image" or "video"
    pricing: Mapped[str] = mapped_column(
        String(10), nullable=False, default="free"
    )  # "free" or "premium"
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft", index=True
    )  # "draft", "published", "archived"

    # JSONB fields for flexible template data
    output_sizes: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    canvas_data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)  # Full Fabric.js state
    input_slots: Mapped[list | None] = mapped_column(JSONB, nullable=True)  # Array of InputSlot
    scenes: Mapped[list | None] = mapped_column(JSONB, nullable=True)  # For video templates
    voice_config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    background_music_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # PostgreSQL arrays
    tags: Mapped[list | None] = mapped_column(ARRAY(String), nullable=True)
    supported_languages: Mapped[list | None] = mapped_column(ARRAY(String), nullable=True)

    download_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )  # FK to admin_users (logical, not enforced)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Template {self.name} ({self.status})>"
