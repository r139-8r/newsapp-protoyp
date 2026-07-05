"""
NewsForge Backend — Application Configuration
Reads all settings from environment variables via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Database ──
    DATABASE_URL: str = "postgresql+asyncpg://localhost/newsforge"

    # ── JWT Secrets (separate for user vs admin — security isolation) ──
    USER_JWT_SECRET: str = "dev-user-secret-change-in-production"
    ADMIN_JWT_SECRET: str = "dev-admin-secret-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # ── Firebase (Google OAuth) ──
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    # ── Hugging Face Dataset (Public Storage Bucket alternative) ──
    HF_TOKEN: Optional[str] = None
    HF_DATASET_REPO: str = "goat1242/newsapp"

    # ── Groq API & Mistral API (AI Script Writer) ──
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    MISTRAL_API_KEY: Optional[str] = None
    MISTRAL_MODEL: str = "ministral-8b-2512"

    # ── CORS ──
    CORS_ORIGINS: str = "http://localhost:5500,http://localhost:3000,http://127.0.0.1:5500"

    # ── Admin ──
    ADMIN_IP_ALLOWLIST: str = ""

    # ── App ──
    APP_ENV: str = "development"
    APP_VERSION: str = "1.0.0"
    MIN_SUPPORTED_VERSION: str = "1.0.0"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def admin_ip_allowlist_set(self) -> set[str]:
        """Parse comma-separated admin IPs into a set."""
        if not self.ADMIN_IP_ALLOWLIST:
            return set()
        return {ip.strip() for ip in self.ADMIN_IP_ALLOWLIST.split(",") if ip.strip()}

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Singleton instance
settings = Settings()
