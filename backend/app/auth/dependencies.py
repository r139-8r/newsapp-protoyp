"""
NewsForge — FastAPI Auth Dependencies
Provides get_current_user and get_current_admin as injectable dependencies.
Supports both Bearer token (Capacitor Android) and HttpOnly cookie (PWA).
"""

import uuid
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import verify_user_token, verify_admin_token
from app.database import get_db
from app.models.user import User
from app.models.admin_user import AdminUser

# Optional bearer scheme — doesn't auto-raise 403 if missing (we check cookie too)
_bearer_scheme = HTTPBearer(auto_error=False)


def _extract_token(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials],
    cookie_name: str,
) -> Optional[str]:
    """Extract JWT from Authorization header OR cookie."""
    # 1. Bearer header (Capacitor Android app)
    if credentials and credentials.scheme.lower() == "bearer":
        return credentials.credentials
    # 2. HttpOnly cookie (PWA browser)
    return request.cookies.get(cookie_name)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency: Returns the authenticated User.
    Accepts Bearer token (Capacitor) or 'nf_access_token' HttpOnly cookie (PWA).
    Raises 401 if missing/invalid.
    """
    token = _extract_token(request, credentials, cookie_name="nf_access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = verify_user_token(token)
        user_id_str: str = payload.get("sub", "")
        token_type: str = payload.get("type", "")
        if not user_id_str or token_type != "access":
            raise ValueError("Invalid token payload")
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_current_admin(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    """
    Dependency: Returns the authenticated AdminUser.
    Uses ADMIN_JWT_SECRET — cannot be spoofed with user tokens.
    Raises 401 if missing/invalid.
    """
    token = _extract_token(request, credentials, cookie_name="nf_admin_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required",
        )

    try:
        payload = verify_admin_token(token)
        admin_id_str: str = payload.get("sub", "")
        token_type: str = payload.get("type", "")
        if not admin_id_str or token_type != "access":
            raise ValueError("Invalid token payload")
        admin_id = uuid.UUID(admin_id_str)
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token",
        )

    result = await db.execute(select(AdminUser).where(AdminUser.id == admin_id))
    admin = result.scalar_one_or_none()

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found",
        )

    return admin
