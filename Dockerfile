# ══════════════════════════════════════════════════
# NewsForge Backend — Root Dockerfile for HF Spaces
# Copies only the backend folder to ensure it runs correctly
# ══════════════════════════════════════════════════

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# HuggingFace Spaces runs as user 1000
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY backend/ .

# Make startup script executable
RUN chmod +x start.sh
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 7860

CMD ["bash", "start.sh"]
