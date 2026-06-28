"""
NewsForge — Voice & Script Schemas (Pydantic)
"""

from typing import Optional
from pydantic import BaseModel, field_validator


# ── Voice ──

class VoiceInfo(BaseModel):
    """A single available TTS voice."""
    voice_id: str
    display_name: str
    language: str
    language_code: str
    gender: str  # male, female
    style: Optional[str] = None  # news, conversational, etc.


class VoiceGenerateRequest(BaseModel):
    text: str
    voice_id: str
    speed: float = 1.0

    @field_validator("text")
    @classmethod
    def text_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Text cannot be empty")
        if len(v) > 2000:
            raise ValueError("Text exceeds maximum length of 2000 characters")
        return v

    @field_validator("speed")
    @classmethod
    def speed_range(cls, v: float) -> float:
        if not (0.5 <= v <= 2.0):
            raise ValueError("Speed must be between 0.5 and 2.0")
        return v


class VoiceListResponse(BaseModel):
    voices: list[VoiceInfo]


# ── Script ──

class ScriptGenerateRequest(BaseModel):
    topic: str
    tone: str = "formal"  # formal, casual, dramatic, neutral
    target_length: int = 30  # seconds: 30, 60, 90
    key_points: Optional[str] = None
    language: str = "en"  # en, hi, ta, te, bn, mr

    @field_validator("topic")
    @classmethod
    def topic_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Topic cannot be empty")
        return v

    @field_validator("tone")
    @classmethod
    def valid_tone(cls, v: str) -> str:
        valid = {"formal", "casual", "dramatic", "neutral"}
        if v not in valid:
            raise ValueError(f"Tone must be one of: {valid}")
        return v

    @field_validator("target_length")
    @classmethod
    def valid_length(cls, v: int) -> int:
        if v not in (30, 60, 90):
            raise ValueError("Target length must be 30, 60, or 90 seconds")
        return v


class ScriptGenerateResponse(BaseModel):
    script: str
    language: str
    target_length: int
    word_count: int
