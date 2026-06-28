"""
NewsForge — Database Models Package
Imports all models so Alembic and Base.metadata can discover them.
"""

from app.models.user import User
from app.models.admin_user import AdminUser
from app.models.template import Template
from app.models.template_asset import TemplateAsset
from app.models.user_project import UserProject
from app.models.ai_usage_log import AIUsageLog
from app.models.activity_log import ActivityLog
from app.models.daily_metrics import DailyMetricsSnapshot

__all__ = [
    "User",
    "AdminUser",
    "Template",
    "TemplateAsset",
    "UserProject",
    "AIUsageLog",
    "ActivityLog",
    "DailyMetricsSnapshot",
]
