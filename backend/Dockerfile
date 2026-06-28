# ══════════════════════════════════════════════════
# NewsForge Backend — HuggingFace Spaces Dockerfile
# Docker SDK • CPU basic • FastAPI + Edge TTS
# ══════════════════════════════════════════════════

FROM python:3.11-slim

# Prevent Python from buffering stdout/stderr (important for HF logs)
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# HuggingFace Spaces runs as user 1000
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install system dependencies for edge-tts and asyncpg
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make startup script executable
RUN chmod +x start.sh

# Switch to non-root user
USER appuser

# HuggingFace Spaces expects port 7860
EXPOSE 7860

# Start the application
CMD ["bash", "start.sh"]
