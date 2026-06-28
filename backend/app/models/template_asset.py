"""
NewsForge — Template Asset Model
Tracks files uploaded to Cloudflare R2 (backgrounds, icons, fonts, audio).
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TemplateAsset(Base):
    __tablename__ = "template_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("templates.id", ondelete="CASCADE"), nullable=True
    )  # null = shared asset across templates
    asset_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # background, element, icon, font, audio
    r2_key: Mapped[str] = mapped_column(Text, nullable=False)  # R2 object key
    r2_url: Mapped[str] = mapped_column(Text, nullable=False)  # Public CDN URL
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<TemplateAsset {self.asset_type}: {self.r2_key}>"
