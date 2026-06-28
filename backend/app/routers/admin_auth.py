"""
NewsForge — Admin Authentication Route
POST /admin/auth/login — Email + password login for admin dashboard
Uses separate ADMIN_JWT_SECRET — admin tokens cannot authenticate user endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt import create_admin_access_token
from app.auth.password import verify_password
from app.database import get_db
from app.models.admin_user import AdminUser
from app.schemas.admin import AdminLoginRequest, AdminTokenResponse

router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post("/login", response_model=AdminTokenResponse)
async def admin_login(
    body: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Admin login with email + password.
    Returns an admin JWT (signed with ADMIN_JWT_SECRET).
    Rate-limited to 5 attempts before lockout (handled by middleware).
    """
    result = await db.execute(
        select(AdminUser).where(AdminUser.email == body.email)
    )
    admin = result.scalar_one_or_none()

    if not admin or not verify_password(body.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_admin_access_token(str(admin.id))
    return AdminTokenResponse(
        access_token=token,
        admin_id=admin.id,
        name=admin.name,
        role=admin.role,
    )
