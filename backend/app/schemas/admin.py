"""
NewsForge — Admin Schemas (Pydantic)
"""

from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, EmailStr


# ── Admin Auth ──

class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin_id: uuid.UUID
    name: str
    role: str


# ── Admin User Profile ──

class AdminProfile(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── User Management ──

class UserListItem(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    plan: str
    language_preference: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    users: list[UserListItem]
    total: int
    page: int
    per_page: int


class UserUpdate(BaseModel):
    plan: Optional[str] = None
    language_preference: Optional[str] = None
    name: Optional[str] = None


# ── Analytics ──

class OverviewStats(BaseModel):
    total_users: int
    new_users_today: int
    dau: int
    total_exports_today: int
    total_voice_gens_today: int
    total_script_gens_today: int
    total_templates_published: int


class TemplateStats(BaseModel):
    id: uuid.UUID
    name: str
    category: str
    format: str
    download_count: int
    status: str


class AIUsageStats(BaseModel):
    voice_generations_today: int
    script_generations_today: int
    voice_generations_week: int
    script_generations_week: int
    top_voices: list[dict]
    top_languages: list[dict]


# ── Template Asset ──

class AssetResponse(BaseModel):
    id: uuid.UUID
    template_id: Optional[uuid.UUID] = None
    asset_type: str
    r2_url: str
    file_size_bytes: int
    mime_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
