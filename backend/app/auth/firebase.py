"""
NewsForge — Firebase ID Token Verification
Used ONLY for the initial Google OAuth exchange.
Firebase tokens are verified here and then discarded —
the backend issues its own custom JWTs for all subsequent requests.
"""

import json
import os
from typing import Optional

import firebase_admin
from firebase_admin import auth as firebase_auth, credentials

from app.config import settings

_firebase_app: Optional[firebase_admin.App] = None


def _get_firebase_app() -> Optional[firebase_admin.App]:
    """Initialize Firebase app lazily (only when first needed)."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    if not settings.FIREBASE_PROJECT_ID:
        return None

    try:
        # Try service account file first
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        else:
            # Fall back to Application Default Credentials with project ID
            cred = credentials.ApplicationDefault()

        _firebase_app = firebase_admin.initialize_app(
            cred,
            {"projectId": settings.FIREBASE_PROJECT_ID},
        )
    except Exception as e:
        print(f"[Firebase] Warning: Could not initialize Firebase app: {e}")
        return None

    return _firebase_app


async def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token from the client.
    Returns: {"uid": str, "email": str, "name": str}
    Raises ValueError if token is invalid or Firebase is not configured.
    """
    app = _get_firebase_app()
    if app is None:
        raise ValueError(
            "Firebase is not configured. Set FIREBASE_PROJECT_ID in environment variables."
        )

    try:
        decoded = firebase_auth.verify_id_token(id_token, app=app)
        return {
            "uid": decoded.get("uid", ""),
            "email": decoded.get("email", ""),
            "name": decoded.get("name", decoded.get("email", "").split("@")[0]),
        }
    except firebase_auth.InvalidIdTokenError as e:
        raise ValueError(f"Invalid Firebase token: {e}")
    except firebase_auth.ExpiredIdTokenError:
        raise ValueError("Firebase token has expired")
    except Exception as e:
        raise ValueError(f"Firebase token verification failed: {e}")
