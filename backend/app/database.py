"""
NewsForge Backend — Database Engine & Session
Uses SQLAlchemy async with asyncpg for PostgreSQL.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


# Process database URL to ensure it uses the asyncpg driver and handles SSL correctly
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)

# Handle Neon/Supabase/Render query params unsupported by asyncpg (e.g. channel_binding, sslmode)
try:
    from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse
    parsed = urlparse(db_url)
    qsl = parse_qsl(parsed.query)
    allowed_params = []
    for key, val in qsl:
        if key == "sslmode":
            if val in ("require", "prefer"):
                allowed_params.append(("ssl", "require"))
        elif key in ("ssl", "timeout", "command_timeout", "server_settings"):
            allowed_params.append((key, val))
    
    new_query = urlencode(allowed_params)
    db_url = urlunparse(parsed._replace(query=new_query))
except Exception:
    # Fallback to simple replace if parsing fails
    if "sslmode=" in db_url:
        db_url = db_url.replace("sslmode=require", "ssl=require")
        db_url = db_url.replace("sslmode=prefer", "ssl=prefer")
        db_url = db_url.replace("sslmode=disable", "")
    if "channel_binding=" in db_url:
        import re
        db_url = re.sub(r'[&?]channel_binding=[^&]*', '', db_url)

# Create async engine
engine = create_async_engine(
    db_url,
    echo=(settings.APP_ENV == "development"),
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

# Session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Declarative base for all models
class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    """FastAPI dependency that provides a database session per request."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all tables (for development only — use Alembic in production)."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """Dispose of the engine connection pool."""
    await engine.dispose()
