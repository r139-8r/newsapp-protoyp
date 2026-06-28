# NewsForge — Technical Architecture Specification

**Agent Assignment:** 🏗️ **Architecture Agent**
**Source:** Extracted from [newsforge_prd.md](file:///f:/newsapp/newsforge_prd.md) §7 (Technical Architecture), §8 (Template System), §10 (AI Features), §11 (Database Schema), §12 (API Architecture), §13 (Data Storage Strategy)
**Scope:** Full stack architecture, database schema, API contracts, rendering pipelines, AI integrations, hosting, and infrastructure.
**Last Updated:** 2026-06-24

---

## 1. Stack Overview

| Layer | Technology | Cost |
| :--- | :--- | :--- |
| **Mobile App** | Progressive Web App (PWA) wrapped with Capacitor for **Android Play Store only** | ₹0 |
| **Mobile UI** | Vanilla HTML5 + CSS + JS (PWA) | ₹0 |
| **Admin Dashboard** | HTML5 + Vanilla CSS + Vanilla JS (SPA-like), server-rendered via Jinja2 | ₹0 |
| **Template Editor** | Fabric.js v6 (Canvas-based visual editor) | ₹0 (MIT) |
| **Backend** | Python 3.11+ / FastAPI (async) | ₹0 |
| **Database** | PostgreSQL via NeonDB (free tier: 0.5GB, 100 CU-hours/month) | ₹0 |
| **Object Storage** | Cloudflare R2 (free tier: 10GB, 1M Class A, 10M Class B, zero egress) | ₹0 |
| **Image Rendering** | **Client-side** Canvas API (Fabric.js renderer on mobile) | ₹0 |
| **Video Rendering** | **Client-side** via FFmpeg.wasm (WebAssembly) running in browser/WebView | ₹0 |
| **AI Voice** | Microsoft Edge TTS via `edge-tts` Python library on HuggingFace Space | ₹0 |
| **AI Script Writer** | **Groq API free tier** (Mistral model, 14.4K req/day, 6K tokens/min) | ₹0 |
| **Hosting (Frontend/PWA)** | Vercel free tier | ₹0 |
| **Hosting (Backend API + Voice)** | HuggingFace Spaces (Docker SDK, free CPU tier) — **single Space** | ₹0 |
| **Keep-Alive** | GitHub Actions cron ping every 4 minutes (6AM–11PM UTC) | ₹0 |
| **DNS/CDN** | Cloudflare free tier | ₹0 |
| **Email** | Resend.com free tier (100 emails/day) | ₹0 |
| **Analytics** | Custom event logging to `activity_log` table + Plausible (self-hosted) | ₹0 |
| **Push Notifications** | Firebase Cloud Messaging (free) via Capacitor plugin | ₹0 |

### 1.1 Project Directory Structure

To ensure easy code management, clear separation of concerns, and independent deployment/hosting setups, the project repository is split into distinct directories:

*   **`/mobile`**: User-facing Android PWA application codebase. Contains HTML/CSS/JS frontend, Capacitor configuration, and native Android code wrapper.
*   **`/admin`**: Web-based admin dashboard and Fabric.js visual template editor. Server-rendered via Jinja2 templates.
*   **`/backend`**: FastAPI (Python 3.11+) backend API server. Handles database models, authentication, API routes, and Edge TTS voice integration.
*   **`/shared`**: Public/shared assets, database migration files, common schema models, and documentation.

This structural separation ensures that mobile app files do not mix with admin dashboard templates, preventing codebase sprawl and simplifying local testing.

---

## 2. System Topology

```
┌─────────────────────────────────────────────────────────────┐
│              ADMIN DASHBOARD (Web-Based)                     │
│  Template Editor │ Template Manager │ Analytics │ Settings   │
└────────────────────────┬────────────────────────────────────┘
                         │ Publishes Templates (JSON + Assets)
                         ▼
              ┌─────────────────────┐
              │   NewsForge Cloud   │
              │  (API + Storage)    │
              └──────────┬──────────┘
                         │ Serves Templates + AI Services
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              MOBILE APP (User-Facing)                        │
│  Browse Templates │ Fill Inputs │ AI Voice │ AI Script │ Export│
└─────────────────────────────────────────────────────────────┘
```

---

## 3. PWA + Capacitor Strategy (Android Only)

**Why PWA, not React Native or Flutter:**
- Aligns with vanilla HTML/CSS/JS stack (no new framework to learn)
- Fabric.js (rendering engine) is a web library — runs natively in PWA
- Capacitor wraps the PWA for **Android Play Store** distribution with native APIs (camera, file system, share)
- **Android only** — India is 95% Android. No iOS build planned.
- Lightweight APK size (~5–8MB vs 30MB+ for React Native)
- Works on budget Android devices (critical for Indian market)

**Capacitor Plugins Needed:**
- `@capacitor/camera` — Photo capture for template inputs
- `@capacitor/filesystem` — Save exports to device gallery
- `@capacitor/share` — Native share sheet for exports
- `@capacitor/push-notifications` — FCM integration
- `@capacitor/network` — Detect online/offline state
- `@capacitor/splash-screen` — Branded launch screen
- `@capacitor/preferences` — Secure token storage (Android SharedPreferences with encryption)

**⚠️ SharedArrayBuffer Requirement (FFmpeg.wasm — Critical Config):**
FFmpeg.wasm requires `SharedArrayBuffer`, which needs specific HTTP headers served by the WebView:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

These must be configured in the Capacitor Android project via a custom `WebViewClient` override in `MainActivity.java` that intercepts requests and injects the headers. Additionally, all cross-origin resources (R2 images, Google Fonts) must include `Cross-Origin-Resource-Policy: cross-origin` headers — configured via Cloudflare Transform Rules for R2 assets and `crossorigin` attributes on font `<link>` tags.

---

## 4. HuggingFace Spaces Strategy (Single Space)

Since video/image rendering is **100% client-side**, the backend is dramatically simpler. We only need **one** HuggingFace Space.

**Single Space: API Server + Voice (FastAPI)**
- Handles: Auth, template CRUD, user management, project management, analytics, **AI Voice generation (Edge TTS)**
- Docker SDK with FastAPI + uvicorn + edge-tts
- Keep-alive via GitHub Actions cron
- **No FFmpeg on server** — video compositing happens client-side via FFmpeg.wasm
- **No heavy CPU load** — the most intensive operation is Edge TTS (~2-5s per generation)

| Constraint | Impact | Mitigation |
| :--- | :--- | :--- |
| **Cold starts** | 15–30s delay after sleep | Cron ping every 4 min. Queue UI shows "preparing..." |
| **Ephemeral disk** | Generated voice files lost on restart | Stream immediately to client, delete temp file. Template assets on R2. |
| **2 vCPU limit** | Sufficient — no video rendering on server | Edge TTS is lightweight. Max 5 concurrent voice requests. |
| **16GB RAM** | More than enough for API + Edge TTS | Monitor memory. Fail gracefully if exceeded. |

---

## 5. Cloudflare R2 Storage Strategy

| Content | Storage Location | Size Estimate | Lifecycle |
| :--- | :--- | :--- | :--- |
| Template background images | R2 `/templates/assets/` | ~50KB–500KB each | Permanent (admin-uploaded) |
| Template thumbnail previews | R2 `/templates/thumbs/` | ~20KB each | Permanent (auto-generated) |
| Template element assets (shapes, icons, overlays) | R2 `/templates/elements/` | ~10KB–100KB each | Permanent (admin-uploaded) |
| Font files (Google Fonts subset) | R2 `/fonts/` | ~50KB–200KB each | Permanent |
| **Total at 200 templates** | | **~500MB** | **Well within 10GB free tier** |

**What is NOT stored on R2:**
- User-uploaded photos (processed client-side, never uploaded)
- Generated voice audio (ephemeral, streamed from HF Space)
- Rendered video files (generated on-device via FFmpeg.wasm)
- User export files (saved directly to user's device)

---

## 6. Template System Architecture

### 6.1 Template Format (JSON Schema)

Every template is stored as a JSON document that defines its visual structure, input slots, and metadata. Created by admin editor (Fabric.js), consumed by mobile renderer.

```json
{
  "template_id": "uuid",
  "version": 1,
  "schema_version": "2.0",
  "fabric_version": "6.4.0",
  "metadata": {
    "name": "Breaking News — Red Alert",
    "category": "breaking_news",
    "format": "image",
    "output_sizes": [
      {"name": "Instagram Story", "width": 1080, "height": 1920},
      {"name": "Instagram Post", "width": 1080, "height": 1080},
      {"name": "YouTube Thumbnail", "width": 1280, "height": 720}
    ],
    "pricing": "free",
    "tags": ["breaking", "urgent", "red", "english"],
    "languages": ["en", "hi"],
    "created_at": "2026-06-23T00:00:00Z",
    "published": true
  },
  "canvas": {
    "width": 1080,
    "height": 1920,
    "backgroundColor": "#1a1a1a",
    "fabricJSON": { /* Full Fabric.js canvas state JSON */ }
  },
  "input_slots": [
    {
      "slot_id": "headline",
      "label": "Headline",
      "type": "text",
      "target_object_id": "headline_text_layer",
      "constraints": {
        "max_length": 80,
        "min_length": 5,
        "required": true,
        "placeholder": "Enter breaking news headline..."
      },
      "default_value": "BREAKING NEWS"
    }
  ],
  "scenes": null,
  "voice_config": null
}
```

### 6.2 Video Template Format (Extended)

```json
{
  "format": "video",
  "output_sizes": [
    {"name": "Instagram Reel", "width": 1080, "height": 1920, "fps": 30},
    {"name": "YouTube Short", "width": 1080, "height": 1920, "fps": 30},
    {"name": "Landscape", "width": 1920, "height": 1080, "fps": 30}
  ],
  "scenes": [
    {
      "scene_id": "intro",
      "duration_seconds": 3,
      "canvas": { /* Fabric.js state for this scene */ },
      "transition_in": "fade",
      "transition_out": "slide_left",
      "animations": [
        {
          "target_object_id": "headline_text_layer",
          "type": "typewriter",
          "delay_ms": 500,
          "duration_ms": 2000
        }
      ]
    }
  ],
  "voice_config": {
    "enabled": true,
    "script_slot_id": "news_script",
    "timing_mode": "auto"
  },
  "background_music": {
    "asset_url": "r2://templates/audio/news_ambient_01.mp3",
    "volume": 0.15
  }
}
```

### 6.3 Input Slot Types

| Type | Admin Defines | User Sees | Rendering |
| :--- | :--- | :--- | :--- |
| `text` | Max/min length, font override, color override, multiline | Text input field | Replaces text in target Fabric.js object |
| `image` | Aspect ratio, min resolution, crop mode (fill/fit) | Image picker (gallery/camera) | Replaces image src in target Fabric.js object, auto-cropped |
| `select` | Options list, default value | Dropdown / pill selector | Replaces text content or swaps between preset visual states |
| `color` | Color palette options (admin-curated) | Color swatch picker | Updates fill/stroke on target object |
| `date` | Format string, default (today/manual) | Date picker | Formatted date string replaces text |
| `number` | Min, max, unit label | Number input with stepper | Formatted number replaces text |
| `toggle` | Label, affects which layers visible | Toggle switch | Shows/hides target objects |
| `logo` | Size constraints, position | Image upload (square crop enforced) | Places logo in designated area |

---

## 7. Rendering Pipeline (100% Client-Side)

> **⚡ KEY DESIGN DECISION:** Both image AND video rendering happen entirely on the user's device. The server never renders any media.

### 7.1 Image Templates (Client-Side — Fabric.js)
```
User fills input slots
    → JS maps each slot value to its target_object_id
    → For text: update Fabric.js text object content
    → For image: load user image, clip to object shape/size
    → For select: update text or swap object preset
    → Fabric.js re-renders canvas
    → canvas.toDataURL('image/png', quality) → download/share
    → NOTHING sent to server. 100% client-side.
```

### 7.2 Video Templates (Client-Side — FFmpeg.wasm)
```
User fills input slots + optionally generates AI voice (voice IS server-side)
    → Client renders each scene as image frames using Fabric.js canvas
    → For each scene:
        → Render scene canvas at target FPS (e.g., 30fps)
        → Apply animations by generating intermediate frame canvases
        → Export each frame as image blob (PNG/JPEG)
    → FFmpeg.wasm (WebAssembly) composites on-device:
        → Input: rendered frames + voice audio blob + background music
        → Apply transitions between scenes
        → Output: MP4 file generated in browser memory
    → User downloads/shares the MP4 directly from device
    → NOTHING sent to server except the voice generation API call.
```

### 7.3 FFmpeg.wasm Configuration
- **Library:** `@ffmpeg/ffmpeg` (MIT license, ~25MB WASM core — loaded lazily on first video export)
- **Performance:** Modern Android phones (Snapdragon 6xx+) can composite a 30-second 720p video in ~15-30 seconds
- **Memory:** Peak ~200-400MB during compositing. Works on devices with 3GB+ RAM
- **Fallback for low-end devices:** Show graceful message: "Your device doesn't support video export. Try image templates instead."

---

## 8. AI Features Architecture

### 8.1 AI Voice Generation (Edge TTS)

```
Mobile App → POST /api/voice/generate { text, voice_id, speed }
    → FastAPI on HuggingFace Space
    → edge_tts.Communicate(text, voice).save(temp_file)
    → Stream MP3 back to client as response
    → Delete temp file immediately
    → Client plays preview / stores in memory for video compositing
```

**Voice Library:**

| Tier | Voices Available | Languages | Speed Control | Max Length |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | 5 voices (2 English, 1 Hindi, 1 Tamil, 1 Telugu) | EN, HI, TA, TE | 0.8×–1.2× only | 500 characters (~30s) |
| **Pro** | 50+ voices (all Edge TTS neural voices) | 30+ languages | 0.5×–2.0× | 2000 characters (~120s) |
| **Newsroom** | 50+ voices + SSML control | 30+ languages | Full SSML | 5000 characters (~300s) |

**Edge TTS Health Monitoring:**
- APScheduler health check: 5-word test voice every 60 minutes
- 3 consecutive failures → auto-switch to Piper TTS fallback + admin alert email
- All failures logged in `ai_usage_log`

**Fallback Chain:**
1. **Piper TTS** (open-source, self-hosted on HF Space)
2. **Google Cloud TTS** free tier (4M chars/month)
3. Paid-only voice at cost-pass-through

### 8.2 AI Script Writer (Groq API — Mistral)

**Token Limits:**

| Tier | Input Tokens (max) | Output Tokens (max) | Effective Script Length |
| :--- | :--- | :--- | :--- |
| **Free** | 200 tokens (~150 words) | 150 tokens (~100 words / ~30s script) | 30-second news script |
| **Pro** | 500 tokens (~375 words) | 400 tokens (~300 words / ~90s script) | 90-second news script |
| **Newsroom** | 1000 tokens (~750 words) | 1000 tokens (~750 words / ~300s script) | 5-minute news script |

**Groq API Configuration:**
```python
import groq

client = groq.Groq(api_key=os.environ["GROQ_API_KEY"])

response = client.chat.completions.create(
    model="mistral-saba-24b",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ],
    max_tokens=output_token_limit,
    temperature=0.7,
    top_p=0.9,
)
```

**Groq Fallback Chain:**
1. **Mistral API** free tier (La Plateforme — 1M tokens/month free)
2. **Groq paid tier** ($0.24/1M tokens)
3. Self-hosted Mistral 7B on HuggingFace Inference Endpoints

### 8.3 AI Pipeline Integration (Script → Voice → Video)
```
User taps "AI Script" → enters topic → gets generated script (Groq/Mistral, ~500ms)
    → Taps "Use for Voice" → script auto-fills voice input
    → Selects voice → Taps "Generate Voice" → hears preview (Edge TTS, ~3s)
    → Taps "Attach to Template" → voice audio blob stored in client memory
    → Taps "Export" → FFmpeg.wasm composites video + voice on-device (~15-30s)
    → 4 taps from idea to finished news video — ZERO server rendering
```

---

## 9. Database Schema (Core Tables)

```sql
-- Core tables (v1)
users
├── id (UUID, PK)
├── email
├── name
├── auth_provider (google/email)
├── auth_provider_id
├── plan (free — v1 is free-only)
├── plan_expires_at (timestamp, nullable — v1.1+)
├── language_preference (default: 'en')
├── created_at
└── updated_at

templates
├── id (UUID, PK)
├── name
├── slug (unique, for URL)
├── category (breaking_news/sports/weather/politics/entertainment/business/general)
├── format (image/video)
├── pricing (free/premium)
├── status (draft/published/archived)
├── output_sizes (JSONB)
├── canvas_data (JSONB — full Fabric.js canvas state)
├── input_slots (JSONB — array of InputSlot objects)
├── scenes (JSONB, nullable — for video templates)
├── voice_config (JSONB, nullable)
├── background_music_url (text, nullable — R2 URL)
├── thumbnail_url (text — R2 URL)
├── tags (text[] — PostgreSQL array)
├── supported_languages (text[])
├── download_count (integer, default 0)
├── sort_order (integer)
├── created_by (UUID, FK → admin_users)
├── created_at
└── updated_at

template_assets
├── id (UUID, PK)
├── template_id (FK → templates, nullable — null = shared asset)
├── asset_type (background/element/icon/font/audio)
├── r2_key (text)
├── r2_url (text — public CDN URL)
├── file_size_bytes (integer)
├── mime_type (text)
├── created_at
└── updated_at

admin_users
├── id (UUID, PK)
├── email
├── name
├── role (superadmin/editor)
├── password_hash (bcrypt)
├── created_at
└── updated_at

user_projects
├── id (UUID, PK)
├── user_id (FK → users)
├── template_id (FK → templates)
├── slot_values (JSONB — text/select/date values ONLY. NO base64 image data.)
├── has_user_images (boolean, default false)
├── voice_audio_ref (text, nullable — temporary reference)
├── output_format (png/jpg/mp4)
├── output_size_name (text)
├── is_exported (boolean)
├── created_at
└── updated_at

ai_usage_log
├── id (UUID, PK)
├── user_id (FK → users)
├── usage_type (voice_generation/script_generation)
├── input_length (integer)
├── model_used (text)
├── voice_id (text, nullable)
├── language (text)
├── tokens_used (integer, nullable)
├── created_at
└── (no output stored — ephemeral)

activity_log
├── id (UUID, PK)
├── user_id (FK → users, nullable)
├── event_type (template_viewed/template_used/export_completed/voice_generated/
│               script_generated/plan_upgraded/plan_downgraded/user_registered)
├── metadata (JSONB — no PII, only IDs and counts)
├── created_at
└── (no PII in metadata)

-- Aggregated metrics (retained indefinitely)
daily_metrics_snapshot
├── id (UUID, PK)
├── snapshot_date (DATE, unique)
├── dau (integer)
├── new_signups (integer)
├── total_exports (integer)
├── total_voice_gens (integer)
├── total_script_gens (integer)
├── created_at
└── updated_at

-- v1.1+ tables (deferred)
subscriptions (v1.1+)
daily_usage (v1.1+)
```

**Schema Size Estimate (500 users, 100 templates):**
- `templates` (100 rows × ~50KB avg) ≈ 5MB
- `users` (500 rows × ~200B) ≈ 100KB
- `user_projects` (2000 rows × ~2KB) ≈ 4MB
- `activity_log` (50K rows × ~200B) ≈ 10MB
- **Total: ~20MB — well within 0.5GB NeonDB free tier**

---

## 10. API Architecture (Full Endpoint Reference)

```
--- User Authentication ---
POST   /auth/google                       → Google OAuth login (Firebase Auth)
POST   /auth/email/register               → Email + password registration
POST   /auth/email/login                   → Email + password login
POST   /auth/refresh                       → Refresh JWT token
GET    /auth/me                            → Get current user profile

--- Templates (User-Facing) ---
GET    /api/templates                      → List published templates (metadata + thumbnails ONLY, NO canvas_data). Paginated: 20/page.
GET    /api/templates/:id                  → Get full template detail (canvas_data + input_slots + scenes). Lazy-loaded.
GET    /api/templates/:id/thumbnail        → Get template thumbnail URL (redirect to R2)

--- User Projects ---
POST   /api/projects                       → Save a project
GET    /api/projects                       → List user's saved projects
GET    /api/projects/:id                   → Get a saved project
PATCH  /api/projects/:id                   → Update project slot values
DELETE /api/projects/:id                   → Delete a project

--- AI Voice ---
POST   /api/voice/generate                 → Generate voice audio from text
GET    /api/voice/voices                   → List available voices (filtered by plan tier)

--- AI Script ---
POST   /api/script/generate                → Generate news script from topic (Groq/Mistral)

--- Template Sync (OTA) ---
GET    /api/templates/sync                 → Get templates updated since last sync

--- Export Tracking ---
POST   /api/exports/log                    → Log an export event
GET    /api/exports/remaining              → Get remaining exports for today

--- Account ---
GET    /api/account/usage                  → Get current usage stats
PATCH  /api/account/preferences            → Update preferences
DELETE /api/account                        → Delete all user data (GDPR)
GET    /api/account/export                 → Export all data as JSON (GDPR)

--- Subscriptions (v1.1+ — NOT in v1) ---
POST   /api/subscriptions/google-play/verify
POST   /api/subscriptions/google-play/webhook
POST   /api/subscriptions/razorpay/create
POST   /api/subscriptions/razorpay/webhook
GET    /api/subscriptions/current
POST   /api/subscriptions/cancel

--- Admin API (Requires admin auth) ---
POST   /admin/auth/login
GET    /admin/templates
POST   /admin/templates
PUT    /admin/templates/:id
PATCH  /admin/templates/:id/status
DELETE /admin/templates/:id
POST   /admin/templates/:id/assets
GET    /admin/templates/:id/assets
DELETE /admin/templates/:id/assets/:aid
GET    /admin/analytics/overview
GET    /admin/analytics/templates
GET    /admin/analytics/users
GET    /admin/analytics/ai-usage
GET    /admin/users
PATCH  /admin/users/:id

--- Health & Monitoring ---
GET    /health                             → Health check for keep-alive cron pings
GET    /api/app/config                     → App version check
POST   /api/errors/log                     → Client-side error reporting
```

---

## 11. Data Storage Strategy

### 11.1 What We Store vs. Don't

| We Store | We Do NOT Store |
| :--- | :--- |
| User email + name | User photos/images (client-side only) |
| Plan/subscription status | Generated voice audio files |
| Template definitions (admin-created) | Rendered video files |
| User project metadata (template + slot values) | AI-generated scripts (client-side only) |
| AI usage counts (not content) | Device fingerprints, IP addresses |
| Activity logs (event type + IDs, no PII) | Credit card numbers |

### 11.2 Storage Budget Forecast

| Milestone | NeonDB Usage | R2 Usage | Status |
| :--- | :--- | :--- | :--- |
| Launch (100 templates, 100 users) | ~15MB | ~200MB | ✅ Comfortable |
| 6 months (200 templates, 1K users) | ~50MB | ~500MB | ✅ Comfortable |
| 12 months (500 templates, 5K users) | ~150MB | ~2GB | ✅ Within limits |
| 18 months (1K templates, 10K users) | ~400MB | ~5GB | ⚠️ Approaching limit |
| **Scale trigger** | >400MB | >8GB | Upgrade NeonDB ($19/mo) |

### 11.3 Data Lifecycle Rules

| Data Type | Retention | Cleanup |
| :--- | :--- | :--- |
| User projects (saved) | Until user deletes or account deleted | Manual |
| Activity logs | **60 days** rolling | APScheduler cron job |
| AI usage logs | **60 days** rolling | Same cleanup job |
| Archived templates | Indefinite (hidden) | Admin manual delete |
| Deleted user accounts | **Immediate hard delete** | GDPR compliance |

---

## 12. Template Publishing Workflow

```
Admin opens editor
    → Designs template visually (add objects, style, arrange)
    → Marks specific objects as "Input Slots" with constraints
    → Sets metadata (name, category, pricing, sizes, tags, languages)
    → [For video] Defines scenes, transitions, animations
    → Clicks "Preview as User" → sees the fill-screen UX
    → Clicks "Save Draft" → template saved but not visible to users
    → Reviews draft → Clicks "Publish" → template goes live in the app
    → [Later] Can "Archive" (hide) or "Unpublish" templates
```

### Template JSON Serialization
1. Fabric.js `canvas.toJSON(['id', 'slot_config'])` exports full canvas state
2. Custom properties (`slot_config`) included for input slot metadata
3. JSON stored in `templates.canvas_data` (JSONB) in NeonDB
4. Asset references stored as R2 URLs
5. Template thumbnail auto-generated and uploaded to R2

---

*This document defines the complete technical architecture for NewsForge. The Architecture Agent should reference this for all infrastructure, backend, database, and API decisions.*
