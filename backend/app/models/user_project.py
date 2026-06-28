"""
NewsForge — User Project Model
Stores user's saved projects (template + filled slot values).
Slot values contain ONLY text/select/date values — NO base64 image data.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserProject(Base):
    __tablename__ = "user_projects"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    template_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("templates.id", ondelete="SET NULL"),
        nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, default="Untitled Project")
    slot_values: Mapped[dict | None] = mapped_column(
        JSONB, nullable=True
    )  # Text/select/date values ONLY. NO base64 image data.
    has_user_images: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    voice_audio_ref: Mapped[str | None] = mapped_column(Text, nullable=True)
    output_format: Mapped[str | None] = mapped_column(String(10), nullable=True)  # png/jpg/mp4
    output_size_name: Mapped[str | None] = mapped_column(String(50), nullable=True)
    is_exported: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<UserProject {self.name} (user={self.user_id})>"
