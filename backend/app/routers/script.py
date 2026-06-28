"""
NewsForge — AI Script Writer Routes
POST /api/script/generate — Generate news script from topic
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.ai_usage_log import AIUsageLog
from app.models.user import User
from app.schemas.voice import ScriptGenerateRequest, ScriptGenerateResponse
from app.services import script_service

router = APIRouter(prefix="/api/script", tags=["ai-script"])


@router.post("/generate", response_model=ScriptGenerateResponse)
async def generate_script(
    body: ScriptGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate a broadcast-ready news script using Groq/Mistral.
    Script is returned to client only — never stored server-side.
    """
    try:
        result = await script_service.generate_script(body)
    except RuntimeError as e:
        error_msg = str(e)
        if "not configured" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Script generation is not configured on this server.",
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Script generation is temporarily unavailable. Please try again.",
        )

    # Log usage (count only — generated script NOT stored per anti-patterns rule)
    model_name = settings.MISTRAL_MODEL if settings.MISTRAL_API_KEY else settings.GROQ_MODEL
    db.add(AIUsageLog(
        user_id=current_user.id,
        usage_type="script_generation",
        input_length=len(body.topic),
        model_used=model_name,
        language=body.language,
        tokens_used=result.word_count * 2,  # Rough estimate
    ))

    return result
