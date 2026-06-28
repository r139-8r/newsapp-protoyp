"""
Alembic Environment Configuration — Async-aware
"""

import asyncio
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy.ext.asyncio import create_async_engine

# Allow importing app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.config import settings
from app.database import Base

# Import all models so Alembic can detect them
import app.models  # noqa: F401

# Alembic Config object
config = context.config

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

# Set database URL from our settings
config.set_main_option("sqlalchemy.url", db_url)

# Setup logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# MetaData for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (no DB connection needed)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations using an async engine."""
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        await conn.run_sync(do_run_migrations)
    await engine.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
