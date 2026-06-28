"""
NewsForge — User Authentication Routes
POST /auth/google         — Google OAuth via Firebase ID token
POST /auth/email/register — Email + password registration
POST /auth/email/login    — Email + password login
POST /auth/refresh        — Refresh JWT (one-time rotation)
GET  /auth/me             — Get current user profile
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.firebase import verify_firebase_token
from app.auth.jwt import (
    create_user_access_token,
    create_user_refresh_token,
    verify_user_token,
)
from app.auth.password import hash_password, verify_password
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    EmailLoginRequest,
    EmailRegisterRequest,
    GoogleAuthRequest,
    RefreshTokenRequest,
    TokenResponse,
    UserProfile,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _build_token_response(user: User) -> AuthResponse:
    """Build a full auth response with tokens and user profile."""
    tokens = TokenResponse(
        access_token=create_user_access_token(str(user.id)),
        refresh_token=create_user_refresh_token(str(user.id)),
    )
    profile = UserProfile.model_validate(user)
    return AuthResponse(tokens=tokens, user=profile)


async def _log_registration(db: AsyncSession, user: User):
    """Log user registration activity."""
    log = ActivityLog(
        user_id=user.id,
        event_type="user_registered",
        metadata_={"auth_provider": user.auth_provider},
    )
    db.add(log)


@router.post("/google", response_model=AuthResponse)
async def google_auth(
    body: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange a Firebase ID token for a custom NewsForge JWT pair.
    Creates user on first sign-in (upsert by email).
    Firebase token is NOT used again after this exchange.
    """
    # Verify the Firebase ID token
    try:
        firebase_data = await verify_firebase_token(body.firebase_id_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    email = firebase_data["email"]
    name = firebase_data["name"]
    uid = firebase_data["uid"]

    # Find existing user or create new one
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    is_new = user is None
    if is_new:
        user = User(
            email=email,
            name=name,
            auth_provider="google",
            auth_provider_id=uid,
        )
        db.add(user)
        await db.flush()  # Get user.id
        await _log_registration(db, user)
    else:
        # Update name/provider_id if changed
        user.auth_provider_id = uid
        if not user.name:
            user.name = name

    return _build_token_response(user)


@router.post("/email/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def email_register(
    body: EmailRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user with email + password."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        email=body.email,
        name=body.name,
        auth_provider="email",
        password_hash=hash_password(body.password),
    )
    db.add(user)
    await db.flush()
    await _log_registration(db, user)

    return _build_token_response(user)


@router.post("/email/login", response_model=AuthResponse)
async def email_login(
    body: EmailLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Login with email + password."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or user.auth_provider != "email" or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return _build_token_response(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Rotate the refresh token — returns a new access token + new refresh token.
    Old refresh token is invalidated (one-time use design).
    """
    from jose import JWTError
    try:
        payload = verify_user_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Not a refresh token")
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, ValueError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(
        access_token=create_user_access_token(str(user.id)),
        refresh_token=create_user_refresh_token(str(user.id)),
    )


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return UserProfile.model_validate(current_user)
