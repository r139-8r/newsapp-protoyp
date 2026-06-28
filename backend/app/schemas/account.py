"""
NewsForge — Account & Export Schemas (Pydantic)
"""

from datetime import datetime
from typing import Any, Optional
import uuid
from pydantic import BaseModel


class UsageStats(BaseModel):
    exports_today: int
    voice_gens_today: int
    script_gens_today: int
    total_projects: int
    plan: str


class PreferencesUpdate(BaseModel):
    language_preference: Optional[str] = None


class ExportLogRequest(BaseModel):
    template_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    output_format: str  # png, jpg, mp4
    output_size_name: str


class ExportRemainingResponse(BaseModel):
    remaining: int  # -1 = unlimited
    limit: int       # -1 = unlimited
    is_unlimited: bool = True


class AppConfigResponse(BaseModel):
    min_supported_version: str
    latest_version: str
    maintenance_mode: bool
    maintenance_message: Optional[str] = None


class ErrorLogRequest(BaseModel):
    error_type: str
    message: str
    stack_trace: Optional[str] = None
    device_info: Optional[dict[str, Any]] = None
    app_version: Optional[str] = None
