"""
NewsForge — Security Middleware
- CORS headers (supplementing FastAPI CORSMiddleware for fine-grained control)
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Admin IP allowlisting
- Request logging
"""

import time
import sys
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adds security headers to every response.
    Critical for the mobile PWA since it uses FFmpeg.wasm (needs COOP/COEP).
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Cross-Origin Isolation headers required for FFmpeg.wasm SharedArrayBuffer
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"

        # Standard security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # CSP — allow inline styles/scripts for the PWA, block frames
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: blob: https:; "
            "media-src 'self' blob:; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none';"
        )

        # HSTS only in production
        if settings.APP_ENV == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains"
            )

        return response


class AdminIPGuardMiddleware(BaseHTTPMiddleware):
    """
    Restrict admin endpoints to an allowlisted set of IPs.
    If allowlist is empty, all IPs are allowed (useful for dev).
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self._allowlist = settings.admin_ip_allowlist_set

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only guard /admin/* routes
        if request.url.path.startswith("/admin") and self._allowlist:
            client_ip = request.client.host if request.client else ""

            # Check forwarded IP (behind proxies like HuggingFace Space nginx)
            forwarded_for = request.headers.get("X-Forwarded-For", "")
            real_ip = forwarded_for.split(",")[0].strip() if forwarded_for else client_ip

            if real_ip not in self._allowlist and client_ip not in self._allowlist:
                from fastapi.responses import JSONResponse
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Access denied"},
                )

        return await call_next(request)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Minimal request/response logging. Excludes /health to reduce noise."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.url.path == "/health":
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        print(
            f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] "
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} ({elapsed_ms:.0f}ms)",
            file=sys.stderr,
        )

        return response
