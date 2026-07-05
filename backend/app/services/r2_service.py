"""
NewsForge — Hugging Face Dataset Storage Service
Uses huggingface_hub to upload and delete files in a public Hugging Face Dataset.
Acts as a completely free storage bucket replacement.
"""

import asyncio
import os
from typing import Optional
from huggingface_hub import HfApi
from app.config import settings

# Initialize HfApi client lazily if token is available
_hf_api = None

def _get_hf_api() -> Optional[HfApi]:
    """Lazily initialize the HfApi client using settings or environment variables."""
    global _hf_api
    if _hf_api is not None:
        return _hf_api

    token = settings.HF_TOKEN or os.environ.get("HF_TOKEN")
    if not token:
        print(
            "[WARNING] HF_TOKEN is not configured. "
            "File uploads will return placeholder URLs. "
            "Configure HF_TOKEN in your Space settings for storage updates."
        )
        return None

    _hf_api = HfApi(token=token)
    return _hf_api


def _get_repo_id() -> str:
    """Retrieve target dataset repository identifier."""
    return settings.HF_DATASET_REPO or "goat1242/newsapp"


def _public_url(path_in_repo: str) -> str:
    """Build the public HTTPS URL for an object inside the Hugging Face dataset."""
    repo = _get_repo_id()
    # Path inside Hugging Face datasets: https://huggingface.co/datasets/{repo}/resolve/main/{path}
    return f"https://huggingface.co/datasets/{repo}/resolve/main/{path_in_repo}"


async def upload_file(
    file_bytes: bytes,
    r2_key: str,
    content_type: str = "application/octet-stream",
) -> str:
    """
    Upload a file to the Hugging Face Dataset repo.
    Returns the public HTTPS access URL.
    If HF_TOKEN is not set, degrades gracefully and returns a local placeholder.
    Runs in a thread pool to avoid blocking FastAPI's event loop.
    """
    # Normalize path inside repo (Hugging Face prefers forward slashes)
    path_in_repo = r2_key.replace("\\", "/")

    client = _get_hf_api()
    if client is None:
        return f"https://placeholder.storage/{path_in_repo}"

    repo_id = _get_repo_id()

    def _upload():
        client.upload_file(
            path_or_fileobj=file_bytes,
            path_in_repo=path_in_repo,
            repo_id=repo_id,
            repo_type="dataset",
        )

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _upload)
    return _public_url(path_in_repo)


async def delete_file(r2_key: str) -> None:
    """
    Delete a file from the Hugging Face Dataset repo.
    No-op if storage is not configured.
    """
    path_in_repo = r2_key.replace("\\", "/")

    client = _get_hf_api()
    if client is None:
        return

    repo_id = _get_repo_id()

    def _delete():
        try:
            client.delete_file(
                path_in_repo=path_in_repo,
                repo_id=repo_id,
                repo_type="dataset",
            )
        except Exception as e:
            print(f"[Storage] Failed to delete {path_in_repo}: {e}")

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _delete)


async def generate_presigned_url(r2_key: str, expires_in: int = 3600) -> str:
    """
    For public HF datasets, files are always publicly accessible.
    Returns the direct public access URL.
    """
    path_in_repo = r2_key.replace("\\", "/")
    return _public_url(path_in_repo)
