"""
NewsForge — User Project Routes
POST   /api/projects       — Save project
GET    /api/projects       — List user's projects
GET    /api/projects/:id   — Get single project
PATCH  /api/projects/:id   — Update slot values
DELETE /api/projects/:id   — Delete project

MANDATORY SECURITY RULE: Every query MUST include user_id filter.
Users can NEVER access other users' projects.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.models.user_project import UserProject
from app.schemas.projects import (
    ProjectCreate,
    ProjectListResponse,
    ProjectResponse,
    ProjectUpdate,
)

router = APIRouter(prefix="/api/projects", tags=["projects"])


def _user_project_query(user_id: uuid.UUID, project_id: uuid.UUID):
    """Build a query that always scopes to the owner user_id."""
    return select(UserProject).where(
        UserProject.user_id == user_id,
        UserProject.id == project_id,
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save a new project for the authenticated user."""
    project = UserProject(
        user_id=current_user.id,  # MANDATORY user_id scoping
        template_id=body.template_id,
        name=body.name,
        slot_values=body.slot_values,
        has_user_images=body.has_user_images,
        output_format=body.output_format,
        output_size_name=body.output_size_name,
    )
    db.add(project)
    await db.flush()

    # Log activity
    db.add(ActivityLog(
        user_id=current_user.id,
        event_type="template_used",
        metadata_={"template_id": str(body.template_id)},
    ))

    return ProjectResponse.model_validate(project)


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all projects for the authenticated user, newest first."""
    query = (
        select(UserProject)
        .where(UserProject.user_id == current_user.id)  # MANDATORY
        .order_by(UserProject.updated_at.desc())
    )
    result = await db.execute(query)
    projects = result.scalars().all()

    count_result = await db.execute(
        select(func.count()).where(UserProject.user_id == current_user.id)
    )
    total = count_result.scalar_one()

    return ProjectListResponse(
        projects=[ProjectResponse.model_validate(p) for p in projects],
        total=total,
    )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single project — only accessible by its owner."""
    result = await db.execute(_user_project_query(current_user.id, project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    return ProjectResponse.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update project slot values or export status."""
    result = await db.execute(_user_project_query(current_user.id, project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    update_data = body.model_dump(exclude_none=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a project. Only owner can delete."""
    result = await db.execute(_user_project_query(current_user.id, project_id))
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    await db.delete(project)
