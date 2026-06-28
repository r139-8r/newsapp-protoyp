"""
NewsForge — AI Script Writer Service (Groq / Mistral)
Generates broadcast-ready news scripts using Groq API with Mistral model.
Free tier: 14,400 requests/day, 6,000 tokens/minute.
"""

from typing import Optional

from app.config import settings
from app.schemas.voice import ScriptGenerateRequest, ScriptGenerateResponse

# Lazy import Groq to avoid startup failure if API key not set
_groq_client = None


def _get_groq_client():
    global _groq_client
    if _groq_client is None:
        if not settings.GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not configured")
        from groq import Groq
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
    return _groq_client


# System prompt for news script generation
_SYSTEM_PROMPT = """You are a professional broadcast news writer. Generate concise, 
factual news scripts in the requested language and tone. 

Rules:
- Write ONLY the script text — no stage directions, no [ANCHOR:], no scene descriptions
- Keep it appropriate for the target duration (30s ≈ 75 words, 60s ≈ 150 words, 90s ≈ 225 words)
- Match the requested tone (formal=newscaster, casual=social media, dramatic=breaking news, neutral=factual)
- Do NOT include introductions like "Here's your script:" — just the script itself
- No placeholders like [NAME] or [DATE] — write concrete sentences
- If language is not English, write entirely in that language"""

# Token limits per target length (v1 = no tier restrictions, all users get max)
_LENGTH_TO_MAX_TOKENS = {
    30: 150,
    60: 300,
    90: 450,
}

_LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi (हिन्दी)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "bn": "Bengali (বাংলা)",
    "mr": "Marathi (मराठी)",
}


async def generate_script(request: ScriptGenerateRequest) -> ScriptGenerateResponse:
    """
    Generate a news script using Mistral API directly (if key set) or falling back to Groq.
    Returns ScriptGenerateResponse with the generated script.
    """
    import httpx

    max_tokens = _LENGTH_TO_MAX_TOKENS.get(request.target_length, 150)
    lang_name = _LANGUAGE_NAMES.get(request.language, "English")

    key_points_section = ""
    if request.key_points and request.key_points.strip():
        key_points_section = f"\n\nKey points to include:\n{request.key_points.strip()}"

    user_prompt = (
        f"Write a {request.target_length}-second {request.tone} news script "
        f"in {lang_name} about:\n\n{request.topic}{key_points_section}"
    )

    if settings.MISTRAL_API_KEY:
        # Use Mistral AI API directly via HTTPX
        headers = {
            "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.MISTRAL_MODEL,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.7,
            "top_p": 0.9,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.mistral.ai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                if response.status_code != 200:
                    raise RuntimeError(f"Mistral API returned status {response.status_code}: {response.text}")
                
                resp_json = response.json()
                script_text = resp_json["choices"][0]["message"]["content"].strip()
                word_count = len(script_text.split())

                return ScriptGenerateResponse(
                    script=script_text,
                    language=request.language,
                    target_length=request.target_length,
                    word_count=word_count,
                )
        except Exception as e:
            raise RuntimeError(f"Script generation via Mistral failed: {e}") from e
    else:
        # Fallback to Groq API
        client = _get_groq_client()
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": _SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=max_tokens,
                temperature=0.7,
                top_p=0.9,
            )
            script_text = response.choices[0].message.content.strip()
            word_count = len(script_text.split())

            return ScriptGenerateResponse(
                script=script_text,
                language=request.language,
                target_length=request.target_length,
                word_count=word_count,
            )
        except Exception as e:
            raise RuntimeError(f"Script generation via Groq failed: {e}") from e
