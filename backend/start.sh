#!/bin/bash
# ══════════════════════════════════════════════════
# NewsForge Backend — Startup Script
# Runs database init (create tables) then launches uvicorn
# Used by Docker CMD in HuggingFace Spaces
# ══════════════════════════════════════════════════

set -e

echo "[NewsForge] Running database table creation..."
python -c "
import asyncio
from app.database import init_db
asyncio.run(init_db())
print('[NewsForge] ✓ Database tables ready')
"

echo "[NewsForge] Seeding initial data (if needed)..."
python scripts/seed.py || echo "[NewsForge] Seed skipped or already seeded"

echo "[NewsForge] Starting uvicorn on port 7860..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 7860 \
    --workers 1 \
    --timeout-keep-alive 75
