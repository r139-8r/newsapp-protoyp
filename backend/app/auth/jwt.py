"""
NewsForge — JWT Token Utilities
Separate signing secrets for user tokens vs admin tokens.
- Access tokens: 1-hour expiry
- Refresh tokens: 30-day expiry, one-time use (rotated on each refresh)
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from jose import JWTError, jwt

from app.config import settings


# Token types
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"


def _create_token(
    subject: str,
    token_type: str,
    secret: str,
    expires_delta: timedelta,
    extra_claims: Optional[dict] = None,
) -> str:
    """Internal helper to create a signed JWT."""
    now = datetime.now(timezone.utc)
    expire = now + expires_delta
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": expire,
        "jti": str(uuid.uuid4()),  # Unique token ID for refresh token rotation
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, secret, algorithm="HS256")


def create_user_access_token(user_id: str) -> str:
    """Create a short-lived access token for a mobile app user."""
    return _create_token(
        subject=user_id,
        token_type=ACCESS_TOKEN_TYPE,
        secret=settings.USER_JWT_SECRET,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )


def create_user_refresh_token(user_id: str) -> str:
    """Create a long-lived refresh token for a mobile app user."""
    return _create_token(
        subject=user_id,
        token_type=REFRESH_TOKEN_TYPE,
        secret=settings.USER_JWT_SECRET,
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def create_admin_access_token(admin_id: str) -> str:
    """Create an access token for an admin dashboard user."""
    return _create_token(
        subject=admin_id,
        token_type=ACCESS_TOKEN_TYPE,
        secret=settings.ADMIN_JWT_SECRET,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        extra_claims={"role": "admin"},
    )


def verify_user_token(token: str) -> dict:
    """
    Verify a user token using USER_JWT_SECRET.
    Returns the decoded payload.
    Raises JWTError on invalid/expired tokens.
    """
    payload = jwt.decode(token, settings.USER_JWT_SECRET, algorithms=["HS256"])
    return payload


def verify_admin_token(token: str) -> dict:
    """
    Verify an admin token using ADMIN_JWT_SECRET.
    Returns the decoded payload.
    Raises JWTError on invalid/expired tokens.
    """
    payload = jwt.decode(token, settings.ADMIN_JWT_SECRET, algorithms=["HS256"])
    return payload
