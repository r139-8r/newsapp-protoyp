"""
NewsForge — Admin Template Management Routes
Full CRUD for templates + asset uploads to Cloudflare R2.
All routes require admin authentication.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_admin
from app.database import get_db
from app.models.admin_user import AdminUser
from app.models.template import Template
from app.models.template_asset import TemplateAsset
from app.schemas.admin import AssetResponse
from app.schemas.templates import (
    TemplateCreate,
    TemplateDetail,
    TemplateListItem,
    TemplateListResponse,
    TemplateStatusUpdate,
    TemplateUpdate,
)
from app.services import r2_service

router = APIRouter(prefix="/admin/templates", tags=["admin-templates"])


def _slugify(name: str) -> str:
    """Generate a URL-safe slug from a template name."""
    import re
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    slug = re.sub(r"^-+|-+$", "", slug)
    return slug


async def _unique_slug(db: AsyncSession, base_slug: str, exclude_id: Optional[uuid.UUID] = None) -> str:
    """Generate a unique slug, appending a counter if needed."""
    slug = base_slug
    counter = 1
    while True:
        query = select(Template).where(Template.slug == slug)
        if exclude_id:
            query = query.where(Template.id != exclude_id)
        result = await db.execute(query)
        if not result.scalar_one_or_none():
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


@router.get("", response_model=TemplateListResponse)
async def admin_list_templates(
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    format_filter: Optional[str] = Query(None, alias="format"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """List all templates (including draft/archived) for admin management."""
    query = select(Template)

    if category:
        query = query.where(Template.category == category)
    if status_filter:
        query = query.where(Template.status == status_filter)
    if format_filter:
        query = query.where(Template.format == format_filter)
    if search:
        query = query.where(func.lower(Template.name).contains(search.lower()))

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    offset = (page - 1) * per_page
    query = query.order_by(Template.updated_at.desc()).offset(offset).limit(per_page)
    result = await db.execute(query)
    templates = result.scalars().all()

    return TemplateListResponse(
        templates=[TemplateListItem.model_validate(t) for t in templates],
        total=total,
        page=page,
        per_page=per_page,
        has_more=(offset + per_page) < total,
    )


@router.post("", response_model=TemplateDetail, status_code=status.HTTP_201_CREATED)
async def admin_create_template(
    body: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Create a new template (starts as draft)."""
    base_slug = _slugify(body.name)
    slug = await _unique_slug(db, base_slug)

    template = Template(
        name=body.name,
        slug=slug,
        category=body.category,
        format=body.format,
        pricing=body.pricing,
        status="draft",
        output_sizes=body.output_sizes,
        canvas_data=body.canvas_data,
        input_slots=body.input_slots,
        scenes=body.scenes,
        voice_config=body.voice_config,
        background_music_url=body.background_music_url,
        thumbnail_url=body.thumbnail_url,
        tags=body.tags,
        supported_languages=body.supported_languages,
        sort_order=body.sort_order,
        created_by=current_admin.id,
    )
    db.add(template)
    await db.flush()
    return TemplateDetail.model_validate(template)


@router.put("/{template_id}", response_model=TemplateDetail)
async def admin_update_template(
    template_id: uuid.UUID,
    body: TemplateUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """Fully update an existing template."""
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    update_data = body.model_dump(exclude_none=True)
    if "name" in update_data:
        base_slug = _slugify(update_data["name"])
        update_data["slug"] = await _unique_slug(db, base_slug, exclude_id=template_id)

    for field, value in update_data.items():
        setattr(template, field, value)

    return TemplateDetail.model_validate(template)


@router.patch("/{template_id}/status", response_model=TemplateDetail)
async def admin_update_status(
    template_id: uuid.UUID,
    body: TemplateStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """
    Change template status: draft → published → archived.
    Published templates become visible in the mobile app immediately via OTA sync.
    """
    valid_statuses = {"draft", "published", "archived"}
    if body.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")

    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    template.status = body.status
    return TemplateDetail.model_validate(template)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_template(
    template_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """Permanently delete a template (irreversible — use Archive instead)."""
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    await db.delete(template)


# ── Asset Management ──

@router.post("/{template_id}/assets", response_model=AssetResponse)
async def admin_upload_asset(
    template_id: uuid.UUID,
    asset_type: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """
    Upload a template asset (image, font, audio) to Cloudflare R2.
    Max 5MB, image-only for non-audio assets.
    """
    # Validate template exists
    result = await db.execute(select(Template).where(Template.id == template_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Template not found")

    # Validate file size (5MB max)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

    # Validate MIME type
    allowed_images = {"image/jpeg", "image/png", "image/webp"}
    allowed_audio = {"audio/mpeg", "audio/mp3"}
    allowed_fonts = {"font/woff", "font/woff2", "font/ttf", "application/octet-stream"}
    mime = file.content_type or "application/octet-stream"

    if asset_type in ("background", "element", "icon") and mime not in allowed_images:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP images are allowed")

    # Build R2 key
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "bin"
    if asset_type in ("background", "element", "icon"):
        r2_key = f"templates/assets/{template_id}/{asset_type}_{uuid.uuid4()}.{ext}"
    elif asset_type == "audio":
        r2_key = f"templates/audio/{template_id}/{uuid.uuid4()}.{ext}"
    elif asset_type == "font":
        r2_key = f"fonts/{uuid.uuid4()}.{ext}"
    else:
        r2_key = f"templates/misc/{template_id}/{uuid.uuid4()}.{ext}"

    # Upload to R2
    try:
        r2_url = await r2_service.upload_file(content, r2_key, mime)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    asset = TemplateAsset(
        template_id=template_id,
        asset_type=asset_type,
        r2_key=r2_key,
        r2_url=r2_url,
        file_size_bytes=len(content),
        mime_type=mime,
    )
    db.add(asset)
    await db.flush()
    return AssetResponse.model_validate(asset)


@router.get("/{template_id}/assets", response_model=list[AssetResponse])
async def admin_list_assets(
    template_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """List all assets for a template."""
    result = await db.execute(
        select(TemplateAsset).where(TemplateAsset.template_id == template_id)
    )
    return [AssetResponse.model_validate(a) for a in result.scalars().all()]


@router.delete("/{template_id}/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_asset(
    template_id: uuid.UUID,
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: AdminUser = Depends(get_current_admin),
):
    """Delete a template asset from DB and R2."""
    result = await db.execute(
        select(TemplateAsset).where(
            TemplateAsset.id == asset_id,
            TemplateAsset.template_id == template_id,
        )
    )
    asset = result.scalar_one_or_none()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Delete from R2
    try:
        await r2_service.delete_file(asset.r2_key)
    except Exception:
        pass  # Don't block DB delete if R2 fails

    await db.delete(asset)
