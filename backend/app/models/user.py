"""
NewsForge — User Model
Stores mobile app users (Google OAuth or email/password).
"""

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    auth_provider: Mapped[str] = mapped_column(
        String(20), nullable=False, default="email"
    )  # "google" or "email"
    auth_provider_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # Firebase UID for Google users
    password_hash: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # Only for email auth
    plan: Mapped[str] = mapped_column(
        String(20), nullable=False, default="free"
    )  # free (v1 is free-only)
    plan_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )  # v1.1+
    language_preference: Mapped[str] = mapped_column(
        String(10), nullable=False, default="en"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
