"""
NewsForge Backend — FastAPI Application Factory
Assembles all routers, middleware, and lifecycle hooks into a single app.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import close_db, init_db
from app.middleware.security import (
    AdminIPGuardMiddleware,
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
)
from app.routers.auth import router as auth_router
from app.routers.templates import router as templates_router
from app.routers.projects import router as projects_router
from app.routers.voice import router as voice_router
from app.routers.script import router as script_router
from app.routers.account import router as account_router
from app.routers.health import exports_router, health_router
from app.routers.admin_auth import router as admin_auth_router
from app.routers.admin_templates import router as admin_templates_router
from app.routers.admin_analytics import router as admin_analytics_router
from app.routers.admin_users import router as admin_users_router
from app.tasks.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown lifecycle management.
    - Startup: connect DB, run migrations (dev), start scheduler
    - Shutdown: stop scheduler, close DB pool
    """
    print(f"[NewsForge] Starting up in {settings.APP_ENV} mode...")

    # In development, auto-create tables (production uses Alembic migrations)
    if settings.APP_ENV == "development":
        await init_db()

    # Start background scheduler
    start_scheduler()

    print(f"[NewsForge] ✓ API ready — v{settings.APP_VERSION}")
    yield

    # Shutdown
    print("[NewsForge] Shutting down...")
    stop_scheduler()
    await close_db()
    print("[NewsForge] ✓ Shutdown complete")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="NewsForge API",
        description=(
            "Backend API for NewsForge — AI-powered news video generator. "
            "Serves the mobile PWA and admin dashboard."
        ),
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.APP_ENV != "production" else None,
        redoc_url="/redoc" if settings.APP_ENV != "production" else None,
        lifespan=lifespan,
    )

    # ── CORS Middleware (must be first) ──
    origins = settings.cors_origins_list
    allow_credentials = True
    if "*" in origins:
        origins = ["*"]
        allow_credentials = False

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
        expose_headers=["Content-Disposition"],
        max_age=86400,  # Cache preflight for 24h
    )

    # ── Security Middleware (applied in reverse order) ──
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(AdminIPGuardMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)

    # ── Exception Handlers ──
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Catch-all for unhandled exceptions — never expose stack traces."""
        import traceback
        import sys
        print(f"[ERROR] Unhandled exception: {exc}", file=sys.stderr)
        if settings.APP_ENV == "development":
            traceback.print_exc(file=sys.stderr)
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred. Please try again."},
        )

    # ── User-Facing Routers ──
    app.include_router(health_router)           # /health, /api/app/config, /api/errors/log
    app.include_router(auth_router)             # /auth/*
    app.include_router(templates_router)        # /api/templates/*
    app.include_router(projects_router)         # /api/projects/*
    app.include_router(voice_router)            # /api/voice/*
    app.include_router(script_router)           # /api/script/*
    app.include_router(account_router)          # /api/account/*
    app.include_router(exports_router)          # /api/exports/*

    # ── Admin Routers ──
    app.include_router(admin_auth_router)       # /admin/auth/*
    app.include_router(admin_templates_router)  # /admin/templates/*
    app.include_router(admin_analytics_router)  # /admin/analytics/*
    app.include_router(admin_users_router)      # /admin/users/*

    # ── Root redirect ──
    @app.get("/", include_in_schema=False)
    async def root():
        return JSONResponse(
            content={
                "name": "NewsForge API",
                "version": settings.APP_VERSION,
                "docs": "/docs",
                "health": "/health",
            }
        )

    return app


# Create app instance (used by uvicorn)
app = create_app()
