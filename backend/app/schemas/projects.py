"""
NewsForge — Project Schemas (Pydantic)
"""

from datetime import datetime
from typing import Any, Optional
import uuid

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    template_id: uuid.UUID
    name: str = "Untitled Project"
    slot_values: Optional[dict[str, Any]] = None
    has_user_images: bool = False
    output_format: Optional[str] = None
    output_size_name: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    slot_values: Optional[dict[str, Any]] = None
    has_user_images: Optional[bool] = None
    output_format: Optional[str] = None
    output_size_name: Optional[str] = None
    is_exported: Optional[bool] = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    template_id: Optional[uuid.UUID] = None
    name: str
    slot_values: Optional[dict[str, Any]] = None
    has_user_images: bool
    output_format: Optional[str] = None
    output_size_name: Optional[str] = None
    is_exported: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int
