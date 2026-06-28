"""
NewsForge — Database Seed Script
Creates the initial admin user and seeds sample templates for development.

Usage:
    cd backend
    python scripts/seed.py

Requires DATABASE_URL to be set in .env
"""

import asyncio
import sys
import os

# Add parent dir to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import async_session_factory, Base, engine
from app.models.admin_user import AdminUser
from app.models.template import Template
from app.auth.password import hash_password


SAMPLE_TEMPLATES = [
    {
        "name": "Breaking News — Red Alert",
        "slug": "breaking-news-red-alert",
        "category": "breaking_news",
        "format": "image",
        "pricing": "free",
        "status": "published",
        "thumbnail_url": None,
        "tags": ["breaking", "news", "red", "alert"],
        "supported_languages": ["en", "hi"],
        "output_sizes": {
            "story": {"width": 1080, "height": 1920},
            "post": {"width": 1080, "height": 1080},
            "landscape": {"width": 1920, "height": 1080},
        },
        "canvas_data": {
            "background": "#DC2626",
            "gradient": "linear-gradient(135deg, #DC2626, #991B1B)",
            "version": "1.0",
        },
        "input_slots": [
            {"id": "headline", "type": "text", "label": "Headline", "placeholder": "Enter breaking news headline", "max_chars": 80, "required": True},
            {"id": "source", "type": "text", "label": "Source", "placeholder": "News Source Name", "max_chars": 40, "required": False},
            {"id": "main_photo", "type": "image", "label": "Main Photo", "required": False},
        ],
        "sort_order": 1,
        "download_count": 1247,
    },
    {
        "name": "Sports Score Card",
        "slug": "sports-score-card",
        "category": "sports",
        "format": "image",
        "pricing": "free",
        "status": "published",
        "thumbnail_url": None,
        "tags": ["sports", "score", "cricket", "football"],
        "supported_languages": ["en", "hi", "ta", "te"],
        "output_sizes": {
            "post": {"width": 1080, "height": 1080},
            "story": {"width": 1080, "height": 1920},
        },
        "canvas_data": {
            "background": "#059669",
            "gradient": "linear-gradient(135deg, #059669, #047857)",
            "version": "1.0",
        },
        "input_slots": [
            {"id": "team1", "type": "text", "label": "Team 1", "placeholder": "India", "max_chars": 30, "required": True},
            {"id": "team2", "type": "text", "label": "Team 2", "placeholder": "Australia", "max_chars": 30, "required": True},
            {"id": "score", "type": "text", "label": "Score", "placeholder": "245/6 (45 ov)", "max_chars": 40, "required": True},
            {"id": "match_type", "type": "select", "label": "Match Type", "options": ["ODI", "T20", "Test", "IPL"], "required": False},
        ],
        "sort_order": 2,
        "download_count": 1102,
    },
    {
        "name": "Election Results Live",
        "slug": "election-results-live",
        "category": "politics",
        "format": "video",
        "pricing": "free",
        "status": "published",
        "thumbnail_url": None,
        "tags": ["election", "results", "vote", "politics"],
        "supported_languages": ["en", "hi"],
        "output_sizes": {
            "story": {"width": 1080, "height": 1920},
        },
        "canvas_data": {
            "background": "#DC2626",
            "gradient": "linear-gradient(135deg, #F97316, #DC2626)",
            "version": "1.0",
        },
        "input_slots": [
            {"id": "headline", "type": "text", "label": "Headline", "placeholder": "Party wins majority", "max_chars": 80, "required": True},
            {"id": "party1", "type": "text", "label": "Party 1 Name", "placeholder": "Party A", "max_chars": 30, "required": True},
            {"id": "seats1", "type": "text", "label": "Party 1 Seats", "placeholder": "285", "max_chars": 10, "required": True},
            {"id": "party2", "type": "text", "label": "Party 2 Name", "placeholder": "Party B", "max_chars": 30, "required": True},
            {"id": "seats2", "type": "text", "label": "Party 2 Seats", "placeholder": "202", "max_chars": 10, "required": True},
        ],
        "scenes": [
            {"id": "s1", "duration_ms": 3000, "transition": "fade"},
            {"id": "s2", "duration_ms": 4000, "transition": "slide"},
        ],
        "sort_order": 3,
        "download_count": 2103,
    },
    {
        "name": "Weather Forecast Card",
        "slug": "weather-forecast-card",
        "category": "weather",
        "format": "image",
        "pricing": "free",
        "status": "published",
        "thumbnail_url": None,
        "tags": ["weather", "forecast", "temperature"],
        "supported_languages": ["en", "hi"],
        "output_sizes": {
            "post": {"width": 1080, "height": 1080},
            "story": {"width": 1080, "height": 1920},
        },
        "canvas_data": {
            "background": "#0EA5E9",
            "gradient": "linear-gradient(135deg, #0EA5E9, #0284C7)",
            "version": "1.0",
        },
        "input_slots": [
            {"id": "city", "type": "text", "label": "City", "placeholder": "Mumbai", "max_chars": 30, "required": True},
            {"id": "temperature", "type": "text", "label": "Temperature", "placeholder": "32°C", "max_chars": 10, "required": True},
            {"id": "condition", "type": "select", "label": "Condition", "options": ["Sunny", "Partly Cloudy", "Rainy", "Thunderstorm", "Foggy"], "required": True},
            {"id": "humidity", "type": "text", "label": "Humidity %", "placeholder": "78%", "max_chars": 10, "required": False},
        ],
        "sort_order": 4,
        "download_count": 654,
    },
    {
        "name": "Celebrity News Flash",
        "slug": "celebrity-news-flash",
        "category": "entertainment",
        "format": "image",
        "pricing": "free",
        "status": "published",
        "thumbnail_url": None,
        "tags": ["entertainment", "celebrity", "bollywood", "news"],
        "supported_languages": ["en", "hi"],
        "output_sizes": {
            "story": {"width": 1080, "height": 1920},
            "post": {"width": 1080, "height": 1080},
        },
        "canvas_data": {
            "background": "#DB2777",
            "gradient": "linear-gradient(135deg, #DB2777, #BE185D)",
            "version": "1.0",
        },
        "input_slots": [
            {"id": "headline", "type": "text", "label": "Headline", "placeholder": "Enter celebrity news", "max_chars": 80, "required": True},
            {"id": "celebrity_photo", "type": "image", "label": "Photo", "required": False},
            {"id": "source", "type": "text", "label": "Source", "placeholder": "Source", "max_chars": 40, "required": False},
        ],
        "sort_order": 5,
        "download_count": 1876,
    },
]


async def seed():
    """Run the seeding process."""
    print("NewsForge Seed Script")
    print("=" * 40)

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✓ Tables created/verified")

    async with async_session_factory() as db:
        # Create admin user
        from sqlalchemy import select
        result = await db.execute(select(AdminUser).where(AdminUser.email == "admin@newsforge.app"))
        existing_admin = result.scalar_one_or_none()

        if not existing_admin:
            admin = AdminUser(
                email="admin@newsforge.app",
                name="NewsForge Admin",
                role="superadmin",
                password_hash=hash_password("Admin@123"),
            )
            db.add(admin)
            print("✓ Admin user created: admin@newsforge.app / Admin@123")
            print("  ⚠️  CHANGE PASSWORD IMMEDIATELY IN PRODUCTION!")
        else:
            print("✓ Admin user already exists — skipping")

        # Create sample templates
        result = await db.execute(select(Template))
        existing_templates = result.scalars().all()
        existing_slugs = {t.slug for t in existing_templates}

        created = 0
        for data in SAMPLE_TEMPLATES:
            if data["slug"] not in existing_slugs:
                template = Template(**data)
                db.add(template)
                created += 1

        if created:
            print(f"✓ Seeded {created} sample templates")
        else:
            print("✓ Sample templates already exist — skipping")

        await db.commit()

    print("\n✓ Seed complete!")
    print("\nAdmin Dashboard Login:")
    print("  Email: admin@newsforge.app")
    print("  Password: Admin@123")


if __name__ == "__main__":
    asyncio.run(seed())
