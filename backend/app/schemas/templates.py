"""
NewsForge — Template & Sync Schemas (Pydantic)
"""

from datetime import datetime
from typing import Any, Optional
import uuid

from pydantic import BaseModel


# ── Template List Item (lightweight — no canvas_data) ──

class TemplateListItem(BaseModel):
    """Lightweight template metadata for the browse grid. No canvas_data."""
    id: uuid.UUID
    name: str
    slug: str
    category: str
    format: str
    pricing: str
    status: str
    thumbnail_url: Optional[str] = None
    output_sizes: Optional[Any] = None
    tags: Optional[list[str]] = None
    supported_languages: Optional[list[str]] = None
    download_count: int
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Template Detail (full — includes canvas_data) ──

class TemplateDetail(BaseModel):
    """Full template with canvas_data, input_slots, scenes for the fill screen."""
    id: uuid.UUID
    name: str
    slug: str
    category: str
    format: str
    pricing: str
    status: str
    output_sizes: Optional[Any] = None
    canvas_data: Optional[Any] = None
    input_slots: Optional[Any] = None
    scenes: Optional[Any] = None
    voice_config: Optional[Any] = None
    background_music_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[list[str]] = None
    supported_languages: Optional[list[str]] = None
    download_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Template List Response ──

class TemplateListResponse(BaseModel):
    """Paginated template list."""
    templates: list[TemplateListItem]
    total: int
    page: int
    per_page: int
    has_more: bool


# ── OTA Sync Response ──

class TemplateSyncResponse(BaseModel):
    """Response for OTA template sync — only changed/new/deleted since timestamp."""
    templates: list[TemplateListItem]
    deleted_ids: list[uuid.UUID]
    sync_timestamp: datetime


# ── Admin Template Create/Update ──

class TemplateCreate(BaseModel):
    name: str
    category: str
    format: str
    pricing: str = "free"
    output_sizes: Optional[Any] = None
    canvas_data: Optional[Any] = None
    input_slots: Optional[Any] = None
    scenes: Optional[Any] = None
    voice_config: Optional[Any] = None
    background_music_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[list[str]] = None
    supported_languages: Optional[list[str]] = None
    sort_order: int = 0


class TemplateUpdate(TemplateCreate):
    name: Optional[str] = None
    category: Optional[str] = None
    format: Optional[str] = None


class TemplateStatusUpdate(BaseModel):
    status: str  # draft, published, archived
