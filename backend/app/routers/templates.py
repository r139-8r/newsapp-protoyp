"""
NewsForge — Template Routes (User-Facing)
GET /api/templates              — List published templates (no canvas_data)
GET /api/templates/sync         — OTA sync since timestamp
GET /api/templates/:id          — Full template detail (with canvas_data)
GET /api/templates/:id/thumbnail — Redirect to R2 thumbnail URL
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.template import Template
from app.models.user import User
from app.schemas.templates import (
    TemplateDetail,
    TemplateListItem,
    TemplateListResponse,
    TemplateSyncResponse,
)

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=TemplateListResponse)
async def list_templates(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name or tag"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    List all published templates (metadata + thumbnail only, NO canvas_data).
    Paginated at 20 per page. Used by mobile home screen template grid.
    """
    query = select(Template).where(Template.status == "published")

    if category and category != "all":
        query = query.where(Template.category == category)

    if search:
        search_lower = search.lower()
        query = query.where(
            or_(
                func.lower(Template.name).contains(search_lower),
                Template.tags.any(search_lower),  # PostgreSQL array contains
            )
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Paginate and sort
    offset = (page - 1) * per_page
    query = (
        query
        .order_by(Template.sort_order.asc(), Template.download_count.desc())
        .offset(offset)
        .limit(per_page)
    )
    result = await db.execute(query)
    templates = result.scalars().all()

    return TemplateListResponse(
        templates=[TemplateListItem.model_validate(t) for t in templates],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + per_page) < total,
    )


@router.get("/sync", response_model=TemplateSyncResponse)
async def sync_templates(
    since_timestamp: Optional[str] = Query(None, description="ISO timestamp of last sync"),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    OTA template sync — returns templates updated/added since last sync.
    Called on app launch and every 30 minutes. Enables template updates
    without a Play Store release.
    """
    since_dt: Optional[datetime] = None
    if since_timestamp:
        try:
            since_dt = datetime.fromisoformat(since_timestamp.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid since_timestamp format")

    # Published templates updated since last sync
    query = select(Template).where(Template.status == "published")
    if since_dt:
        query = query.where(Template.updated_at > since_dt)

    result = await db.execute(query)
    templates = result.scalars().all()

    return TemplateSyncResponse(
        templates=[TemplateListItem.model_validate(t) for t in templates],
        deleted_ids=[],  # TODO: Track deleted template IDs in a separate table
        sync_timestamp=datetime.now(timezone.utc),
    )


@router.get("/{template_id}", response_model=TemplateDetail)
async def get_template(
    template_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    """
    Get full template detail including canvas_data, input_slots, scenes.
    Only returns published templates to users.
    Increments download_count on each full fetch.
    """
    result = await db.execute(
        select(Template).where(
            Template.id == template_id,
            Template.status == "published",
        )
    )
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    # Increment download count
    template.download_count += 1

    return TemplateDetail.model_validate(template)


@router.get("/{template_id}/thumbnail")
async def get_thumbnail(
    template_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Redirect to the R2 CDN thumbnail URL for a template."""
    result = await db.execute(
        select(Template.thumbnail_url).where(Template.id == template_id)
    )
    row = result.one_or_none()
    if not row or not row[0]:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thumbnail not found")

    return RedirectResponse(url=row[0], status_code=302)
