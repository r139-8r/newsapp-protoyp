"""
NewsForge — Edge TTS Voice Generation Service
Generates AI voice audio using Microsoft Edge TTS via the edge-tts library.
Voice audio is streamed directly to client and never stored on server.
"""

import asyncio
import io
import tempfile
import os
from typing import Optional

import edge_tts

from app.schemas.voice import VoiceInfo


# Voice library mapping: display_name → Edge TTS voice name
# Free tier: 5 voices (2 English, 1 Hindi, 1 Tamil, 1 Telugu)
VOICE_CATALOG: list[VoiceInfo] = [
    VoiceInfo(
        voice_id="ananya",
        display_name="Ananya",
        language="Hindi",
        language_code="hi",
        gender="female",
        style="news",
    ),
    VoiceInfo(
        voice_id="raj",
        display_name="Raj",
        language="Hindi",
        language_code="hi",
        gender="male",
        style="news",
    ),
    VoiceInfo(
        voice_id="emma",
        display_name="Emma",
        language="English",
        language_code="en",
        gender="female",
        style="news",
    ),
    VoiceInfo(
        voice_id="james",
        display_name="James",
        language="English",
        language_code="en",
        gender="male",
        style="news",
    ),
    VoiceInfo(
        voice_id="kavya",
        display_name="Kavya",
        language="Tamil",
        language_code="ta",
        gender="female",
        style="news",
    ),
    VoiceInfo(
        voice_id="ravi",
        display_name="Ravi",
        language="Telugu",
        language_code="te",
        gender="male",
        style="news",
    ),
]

# Map voice_id → Edge TTS voice name
_VOICE_ID_TO_EDGE: dict[str, str] = {
    "ananya": "hi-IN-SwaraNeural",
    "raj":    "hi-IN-MadhurNeural",
    "emma":   "en-IN-NeerjaNeural",
    "james":  "en-IN-PrabhatNeural",
    "kavya":  "ta-IN-PallaviNeural",
    "ravi":   "te-IN-MohanNeural",
}

# Track health status
_tts_healthy = True
_tts_failure_count = 0


def get_available_voices() -> list[VoiceInfo]:
    """Return the list of available TTS voices."""
    return VOICE_CATALOG


def _rate_from_speed(speed: float) -> str:
    """Convert speed multiplier to Edge TTS rate string (e.g., '+10%', '-20%')."""
    pct = round((speed - 1.0) * 100)
    if pct >= 0:
        return f"+{pct}%"
    return f"{pct}%"


async def generate_voice_audio(text: str, voice_id: str, speed: float = 1.0) -> bytes:
    """
    Generate MP3 audio using Edge TTS.
    Returns raw MP3 bytes.
    Raises ValueError if voice_id is invalid.
    Raises RuntimeError on TTS failure.
    """
    global _tts_healthy, _tts_failure_count

    edge_voice = _VOICE_ID_TO_EDGE.get(voice_id)
    if not edge_voice:
        raise ValueError(f"Unknown voice_id: {voice_id}. Available: {list(_VOICE_ID_TO_EDGE.keys())}")

    rate = _rate_from_speed(speed)

    try:
        communicate = edge_tts.Communicate(text=text, voice=edge_voice, rate=rate)

        # Collect all audio chunks into memory
        audio_buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_buffer.write(chunk["data"])

        audio_bytes = audio_buffer.getvalue()
        if not audio_bytes:
            raise RuntimeError("Edge TTS returned empty audio")

        # Reset failure count on success
        _tts_failure_count = 0
        _tts_healthy = True
        return audio_bytes

    except Exception as e:
        _tts_failure_count += 1
        if _tts_failure_count >= 3:
            _tts_healthy = False
        raise RuntimeError(f"Voice generation failed: {e}") from e


async def health_check() -> bool:
    """
    Quick TTS health check — generates a 5-word test phrase.
    Called by APScheduler every 60 minutes.
    """
    global _tts_healthy, _tts_failure_count
    try:
        await generate_voice_audio("NewsForge voice system operational.", "emma", speed=1.0)
        _tts_healthy = True
        _tts_failure_count = 0
        return True
    except Exception:
        _tts_failure_count += 1
        if _tts_failure_count >= 3:
            _tts_healthy = False
        return False


def is_tts_healthy() -> bool:
    """Return current TTS health status."""
    return _tts_healthy
