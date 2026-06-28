"""
NewsForge — Cloudflare R2 Storage Service
Uses boto3 S3-compatible API to upload/delete files in R2.
"""

import asyncio
from typing import Optional
from functools import lru_cache

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

from app.config import settings

_r2_client = None


def _get_r2_client():
    """Lazily create the S3 client, supporting Backblaze B2 or Cloudflare R2."""
    global _r2_client
    if _r2_client is not None:
        return _r2_client

    # 1. Check if Backblaze B2 is configured
    if all([settings.B2_ENDPOINT_URL, settings.B2_ACCESS_KEY_ID, settings.B2_SECRET_ACCESS_KEY]):
        endpoint = settings.B2_ENDPOINT_URL
        if not endpoint.startswith("http://") and not endpoint.startswith("https://"):
            endpoint = f"https://{endpoint}"
        
        _r2_client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=settings.B2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.B2_SECRET_ACCESS_KEY,
            config=Config(
                retries={"max_attempts": 3, "mode": "adaptive"},
            ),
        )
        return _r2_client

    # 2. Fall back to Cloudflare R2
    if not all([settings.R2_ACCOUNT_ID, settings.R2_ACCESS_KEY_ID, settings.R2_SECRET_ACCESS_KEY]):
        raise RuntimeError(
            "Neither Backblaze B2 nor Cloudflare R2 credentials are fully configured. "
            "Configure either B2_ENDPOINT_URL/B2_ACCESS_KEY_ID/B2_SECRET_ACCESS_KEY "
            "or R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY."
        )

    _r2_client = boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(
            retries={"max_attempts": 3, "mode": "adaptive"},
        ),
        region_name="auto",
    )
    return _r2_client


def _get_bucket_name() -> str:
    """Determine the bucket name based on active provider configuration."""
    if all([settings.B2_ENDPOINT_URL, settings.B2_ACCESS_KEY_ID, settings.B2_SECRET_ACCESS_KEY]):
        return settings.B2_BUCKET_NAME or "newsforge"
    return settings.R2_BUCKET_NAME


def _public_url(r2_key: str) -> str:
    """Build the public CDN URL for the uploaded object."""
    # 1. Backblaze B2 public URL
    if all([settings.B2_ENDPOINT_URL, settings.B2_ACCESS_KEY_ID, settings.B2_SECRET_ACCESS_KEY]):
        if settings.B2_PUBLIC_URL:
            return f"{settings.B2_PUBLIC_URL.rstrip('/')}/{r2_key}"
        bucket = settings.B2_BUCKET_NAME or "newsforge"
        endpoint = settings.B2_ENDPOINT_URL.replace("https://", "").replace("http://", "")
        return f"https://{bucket}.{endpoint}/{r2_key}"

    # 2. Cloudflare R2 public URL
    if settings.R2_PUBLIC_URL:
        return f"{settings.R2_PUBLIC_URL.rstrip('/')}/{r2_key}"
    return f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{settings.R2_BUCKET_NAME}/{r2_key}"


async def upload_file(
    file_bytes: bytes,
    r2_key: str,
    content_type: str = "application/octet-stream",
) -> str:
    """
    Upload a file to cloud storage (Backblaze B2 / Cloudflare R2).
    Returns the public URL of the uploaded object.
    Runs in thread pool to avoid blocking the event loop.
    """
    client = _get_r2_client()
    bucket = _get_bucket_name()

    def _upload():
        client.put_object(
            Bucket=bucket,
            Key=r2_key,
            Body=file_bytes,
            ContentType=content_type,
        )

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _upload)
    return _public_url(r2_key)


async def delete_file(r2_key: str) -> None:
    """Delete a file from cloud storage."""
    client = _get_r2_client()
    bucket = _get_bucket_name()

    def _delete():
        try:
            client.delete_object(Bucket=bucket, Key=r2_key)
        except ClientError as e:
            if e.response["Error"]["Code"] != "NoSuchKey":
                raise

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _delete)


async def generate_presigned_url(r2_key: str, expires_in: int = 3600) -> str:
    """Generate a presigned URL for temporary private access."""
    client = _get_r2_client()
    bucket = _get_bucket_name()

    def _presign():
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": r2_key},
            ExpiresIn=expires_in,
        )

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _presign)
