"""
NewsForge — Auth Schemas (Pydantic)
Request and response models for all authentication endpoints.
"""

from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, EmailStr, field_validator


# ── Request Models ──

class GoogleAuthRequest(BaseModel):
    """Firebase ID token from client Google OAuth flow."""
    firebase_id_token: str


class EmailRegisterRequest(BaseModel):
    """Email + password registration."""
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v


class EmailLoginRequest(BaseModel):
    """Email + password login."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Refresh token for token rotation."""
    refresh_token: str


# ── Response Models ──

class TokenResponse(BaseModel):
    """JWT token pair returned after successful auth."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    """Current authenticated user profile."""
    id: uuid.UUID
    email: str
    name: str
    auth_provider: str
    plan: str
    language_preference: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Combined auth response: tokens + user profile."""
    tokens: TokenResponse
    user: UserProfile
