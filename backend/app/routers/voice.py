"""
NewsForge — Voice Generation Routes
POST /api/voice/generate — Generate MP3 audio from text (streams response)
GET  /api/voice/voices   — List available voices (filtered by plan tier)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from app.auth.dependencies import get_current_user
from app.models.ai_usage_log import AIUsageLog
from app.models.user import User
from app.database import get_db
from app.schemas.voice import VoiceGenerateRequest, VoiceListResponse
from app.services import tts_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/api/voice", tags=["ai-voice"])


@router.get("/voices", response_model=VoiceListResponse)
async def list_voices(_: User = Depends(get_current_user)):
    """
    List available TTS voices.
    v1: All voices available to all users (no tier restrictions).
    """
    voices = tts_service.get_available_voices()
    return VoiceListResponse(voices=voices)


@router.post("/generate")
async def generate_voice(
    body: VoiceGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate an AI voiceover and stream MP3 back to client.
    Audio is NEVER stored on server — ephemeral generation.
    """
    if not tts_service.is_tts_healthy():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Voice generation is temporarily unavailable. Please try again in a few minutes.",
        )

    try:
        audio_bytes = await tts_service.generate_voice_audio(
            text=body.text,
            voice_id=body.voice_id,
            speed=body.speed,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Voice generation is temporarily unavailable. Please try again in a few minutes.",
        )

    # Log AI usage (count only, no content stored)
    db.add(AIUsageLog(
        user_id=current_user.id,
        usage_type="voice_generation",
        input_length=len(body.text),
        model_used="edge-tts",
        voice_id=body.voice_id,
        language=body.voice_id,  # Simplified for v1
    ))

    # Stream MP3 back — never cached, never stored
    return Response(
        content=audio_bytes,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": "inline; filename=voice.mp3",
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )
