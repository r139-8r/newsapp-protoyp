# NewsForge — User & Admin Flows

**Agent Assignment:** 🔀 **Flow / UX-Logic Agent**
**Source:** Extracted from [newsforge_prd.md](file:///f:/newsapp/newsforge_prd.md) §6.5 (User Flow), §9.3 (Template Publishing Workflow), §10.3 (AI Pipeline), §8.4 (Rendering Pipeline), §2.4 ("Aha" Moment)
**Scope:** All user journeys, admin workflows, state transitions, edge cases, and interaction sequences.
**Last Updated:** 2026-06-24

---

## 1. User Flows (Mobile App)

### 1.1 Primary Flow: Template Selection → Export

This is the **core product loop**. Every user session follows this path.

```
Home → Browse templates by category
    → Tap template card → See full preview + "Use Template" button
    → [Use Template] → Fill screen with live preview
    → Type headline, upload photo, fill required fields
    → [Optional] Tap "AI Script" → Generate script → Copy to script field
    → [Optional] Tap "AI Voice" → Paste/type script → Select voice → Generate audio
    → Tap "Export" → Choose format + quality
    → [If video] → Select AI voice track → Set duration
    → [Export] → Processing spinner (client-side for images, server-side for video)
    → Save to gallery + Share sheet
    → [AHA MOMENT: Professional news content in < 60 seconds]
```

**Critical Metric:** Time to first export must be **< 90 seconds**.

---

### 1.2 User Registration / Onboarding Flow

```
App Launch (first time)
    → Splash Screen (branded, 2s)
    → Onboarding Carousel (3 slides):
        Slide 1: "Pick a template" (template browser preview)
        Slide 2: "Fill in the blanks" (fill screen preview)
        Slide 3: "Export in 60 seconds" (final output preview)
    → "Get Started" CTA
    → Auth Screen:
        → [Google Sign In] → Firebase Auth popup → Google OAuth → Firebase ID Token
            → POST /auth/google → Backend verifies → Custom JWT issued → Logged in
        → [Email Sign Up] → Name + Email + Password form
            → POST /auth/email/register → Custom JWT issued → Logged in
        → [Email Login] → Email + Password form
            → POST /auth/email/login → Custom JWT issued → Logged in
    → Home Screen (Template Browser)
```

---

### 1.3 Template Browsing & Selection Flow

```
Home Screen
    → Category Pills at top: [All] [Breaking News] [Sports] [Weather] [Politics] [Entertainment] [Business]
    → Tapping a category filters the grid (API: GET /api/templates?category=breaking_news)
    → Search bar: free-text search across template name/tags
    → Grid of template cards:
        Each card shows: thumbnail, name, format badge (Image/Video), size badge, pricing badge
    → Tap a card:
        → Full-screen template preview
        → Template metadata: Name, Category, Available sizes, Supported languages
        → "Use Template" button (full-width, sticky bottom)
        → [Use Template] → Navigates to Fill Screen
```

---

### 1.4 Template Fill & Live Preview Flow

```
Fill Screen
    ┌──────────────────────────────────┐
    │   LIVE PREVIEW (top 60% of screen)│
    │   Shows template with current     │
    │   input values rendered in        │
    │   real-time via Fabric.js         │
    └──────────────────────────────────┘
    ┌──────────────────────────────────┐
    │   INPUT FORM (scrollable)         │
    │   - Headline: [text input]        │
    │     "Max 80 characters"           │
    │   - Main Photo: [image picker]    │
    │     "Square crop recommended"     │
    │   - Source: [text input]          │
    │   - Date: [date picker]           │
    │   - Category: [select dropdown]   │
    └──────────────────────────────────┘
    ┌──────────────────────────────────┐
    │  [Preview]              [Export]  │  ← Sticky bottom bar
    └──────────────────────────────────┘

Each input change:
    → JS maps slot value to target_object_id
    → Fabric.js re-renders canvas (150ms debounce)
    → Preview updates in real-time

Image input:
    → Tap "Main Photo" → Options: [Gallery] [Camera]
    → User selects/captures image
    → Client-side crop to template's aspect_ratio_hint
    → Image placed into Fabric.js canvas layer
    → Image NEVER uploaded to server

Validation:
    → Required fields checked before "Export" enabled
    → Character limits enforced with live counter
    → Export button disabled until all required fields filled
```

---

### 1.5 AI Script Writer Flow

```
AI Tools Screen → AI Script Writer card
    → Input Form:
        - Topic/Headline: [text input, required]
        - Tone: [Formal | Casual | Dramatic | Neutral]
        - Target Length: [30s | 60s | 90s]
        - Key Points: [optional text area]
        - Language: [EN | HI | TA | TE | ...]
    → "Generate Script" button
    → Loading spinner (~500ms — Groq/Mistral is fast)
    → Generated script displayed in scrollable text area
    → Actions:
        → [Copy to Clipboard]
        → [Use for Voice] → Auto-fills AI Voice input with script text
        → [Edit] → User can modify the generated script
        → [Regenerate] → New generation with same inputs
    → Usage counter: "3 of 5 scripts remaining today" (v1.1+ only, v1 = unlimited)
```

---

### 1.6 AI Voice Generation Flow

```
AI Tools Screen → AI Voice Generator card
    → Input Form:
        - Script Text: [text area, required] (can be auto-filled from AI Script)
        - Voice: [dropdown — language → gender → style]
        - Speed: [slider 0.8× to 1.2× for free, 0.5× to 2.0× for Pro]
    → "Generate Voice" button
    → Loading indicator (~3s for Edge TTS)
    → Audio player appears with generated voice preview
    → Actions:
        → [Play / Pause] → Preview the voice
        → [Attach to Template] → Voice audio blob stored in client memory
            → Returns to Fill Screen with voice track attached
        → [Download Audio] → Save MP3 to device
        → [Regenerate] → New generation with same/different voice
    → Usage counter: "2 of 5 voices remaining today" (v1.1+ only)
```

---

### 1.7 Full AI Pipeline Flow (Script → Voice → Video)

This is the **killer UX** — seamless from idea to finished video:

```
User taps "AI Script" → enters topic → gets generated script (Groq/Mistral, ~500ms)
    → Taps "Use for Voice" → script auto-fills voice input
    → Selects voice → Taps "Generate Voice" → hears preview (Edge TTS, ~3s)
    → Taps "Attach to Template" → voice audio blob stored in client memory
    → Returns to Fill Screen → voice indicator shows "AI Voice attached ✓"
    → Taps "Export" → Choose MP4 format
    → FFmpeg.wasm composites video + voice on-device (~15-30s)
    → Progress bar: "Rendering video... 45%"
    → Complete → Save to gallery + Share sheet
    → 4 taps from idea to finished news video — ZERO server rendering
```

---

### 1.8 Export Flow

```
Fill Screen → Tap "Export"
    → Export Modal:
        - Format: [PNG] [JPG] [MP4 (video templates only)]
        - Size: [Instagram Story 1080×1920] [Instagram Post 1080×1080] [YouTube Thumbnail 1280×720]
        - Quality: [720p (Free)] [1080p (Pro)] [4K (Newsroom)]
        - [If video + voice attached] → "Include AI Voice: ✓"
        - [If video] → Duration indicator
    → "Export Now" button

For Image Templates:
    → Fabric.js canvas.toDataURL('image/png', quality)
    → Blob saved to device via Capacitor Filesystem
    → 100% client-side, instant (~1-2s)
    → POST /api/exports/log (analytics only)

For Video Templates:
    → FFmpeg.wasm lazy-loaded (first time: download ~25MB, show progress)
    → Each scene rendered as frames via Fabric.js
    → FFmpeg composites frames + voice audio + background music
    → Progress bar: "Rendering video... XX%"
    → MP4 saved to device
    → POST /api/exports/log (analytics only)

Post-Export:
    → "Saved to Gallery ✓" confirmation
    → Quick share buttons: [Instagram] [WhatsApp] [YouTube] [More...]
    → "Create Another" button → returns to template browser
```

---

### 1.9 My Projects Flow

```
Bottom Nav → "My Projects"
    → List of recent projects with:
        - Template thumbnail
        - Template name
        - Last edited date
        - Export status (exported / draft)
    → Tap project:
        → Re-opens Fill Screen with saved slot values
        → Text/select/date values restored from server (JSONB)
        → Images NOT restored (user must re-upload if has_user_images=true)
        → User can modify and re-export
    → Swipe to delete project
    → Long-press for options: [Re-export] [Duplicate] [Delete]
```

---

### 1.10 Profile & Settings Flow

```
Bottom Nav → "Profile"
    → User info: Name, Email, Plan (Free in v1)
    → Usage stats: Exports today, AI credits remaining
    → Settings:
        - Language preference → dropdown
        - Download quality → 720p / 1080p / 4K
        - Clear cached templates → confirmation dialog → clears IndexedDB
    → Account:
        - "My Data" → shows all stored data (GDPR)
        - "Export My Data" → GET /api/account/export → JSON download
        - "Delete My Account" → confirmation dialog → immediate hard delete
    → [v1.1+] Plan management:
        - Current plan display
        - "Upgrade to Pro" CTA with feature comparison
        - Subscription management (cancel, change plan)
```

---

### 1.11 OTA Template Sync Flow

```
App Launch
    → GET /api/templates/sync?since_timestamp={last_sync}
    → Response: { templates: [...], deleted_ids: [...], sync_timestamp }
    → New/updated templates added to local IndexedDB cache
    → Deleted template IDs removed from cache
    → sync_timestamp saved for next call
    → Repeats every 30 minutes while app is open

Result: Admin publishes template → appears in user's app within minutes.
No Play Store update required.
```

---

### 1.12 Offline Degradation Flow (v1)

```
Network lost (detected via @capacitor/network)
    → App shows cached templates from IndexedDB (browse-only)
    → Template fill screen works for cached templates (Fabric.js is local)
    → Image export works (100% client-side)
    → AI Voice → "Offline — voice generation requires internet" message
    → AI Script → "Offline — script generation requires internet" message
    → Video export with voice → "Attach voice while online, then export offline"
    → Projects cannot sync until online
    → Banner at top: "You're offline. Some features are limited."

Network restored
    → Banner dismissed
    → Sync triggered
    → Full features restored
```

---

## 2. Admin Flows (Web Dashboard)

### 2.1 Admin Login Flow

```
admin.newsforge.app
    → Login screen: Email + Password
    → POST /admin/auth/login → bcrypt verify → Admin JWT issued
    → Redirect to Dashboard Home
    → IP allowlisting check (if enabled)
    → Failed login: rate limit after 5 attempts (lockout 15 min)
```

---

### 2.2 Template Creation Flow

```
Dashboard → "Create Template" button
    → Template Editor opens:
        → Blank canvas (choose size: 1080×1920, 1080×1080, 1280×720)
        → Toolbar: Text, Image, Shape, Icon, Line, Background
    → Design Phase:
        → Add objects (text, images, shapes)
        → Style (colors, fonts, effects, positioning)
        → Arrange layers (drag to reorder, lock, group)
    → Input Slot Definition:
        → Select an object → Properties Panel
        → Check "Is Input Slot" ☑
        → Define: Label, Type (text/image/select/date/etc.), Constraints
        → Object gets blue dashed border indicator
    → Metadata:
        → Name, Category, Pricing (free in v1), Tags, Languages
    → [For video templates]:
        → Add scenes (Intro, Body, Outro)
        → Set durations, transitions, animations per scene
    → "Preview as User" → opens modal showing mobile fill screen UX
    → "Save Draft" → template saved, not visible to users
    → "Publish" → template goes live in the app (OTA sync)
```

---

### 2.3 Template Management Flow

```
Dashboard → Template Manager
    → Table/Grid view of all templates:
        Columns: Thumbnail, Name, Category, Format, Status, Downloads, Last Modified
    → Filters: Category, Status (Draft/Published/Archived), Pricing, Format
    → Actions per template:
        → [Edit] → opens Template Editor with existing data
        → [Publish] → status: draft → published (appears in app)
        → [Unpublish] → status: published → draft (removed from app)
        → [Archive] → hidden from users, admin can restore
        → [Delete] → permanent deletion (confirmation dialog)
    → Bulk actions: Select multiple → Publish / Archive / Change pricing
```

---

### 2.4 Template Publishing Workflow (State Machine)

```
                  ┌───────┐
                  │ Draft │ ← Initial state when created
                  └───┬───┘
                      │ [Publish]
                      ▼
                ┌──────────┐
                │ Published │ ← Visible in app, synced via OTA
                └─────┬────┘
                      │ [Unpublish]     │ [Archive]
                      ▼                 ▼
                ┌───────┐         ┌──────────┐
                │ Draft │         │ Archived │ ← Hidden from users, restorable
                └───────┘         └──────────┘
                                       │ [Restore]
                                       ▼
                                 ┌───────┐
                                 │ Draft │
                                 └───────┘
```

---

### 2.5 Asset Management Flow

```
Template Editor → Upload asset (image, font, audio)
    → POST /admin/templates/:id/assets
    → File validated (max 5MB, image-only for images)
    → Uploaded to Cloudflare R2:
        → Images: /templates/assets/{template_id}/{filename}
        → Fonts: /fonts/{filename}
        → Audio: /templates/audio/{filename}
    → R2 URL stored in template_assets table
    → Asset available in editor's asset library
    → Asset URL referenced in Fabric.js canvas JSON

Thumbnail generation:
    → On template save → auto-render canvas as thumbnail image
    → Upload to R2: /templates/thumbs/{template_id}.png
    → thumbnail_url stored in templates table
```

---

### 2.6 Analytics Dashboard Flow

```
Dashboard → Analytics
    → Overview tab:
        - DAU / MAU charts (from daily_metrics_snapshot)
        - Total exports today
        - AI usage (voice + script generations)
        - New signups
    → Templates tab:
        - Table: Template name, downloads, exports, conversion rate
        - Sort by: Most popular, Most exported, Newest
        - Identify top performers and underperformers
    → Users tab:
        - Total users, new vs returning
        - Plan distribution (Free/Pro/Newsroom)
        - Retention curves (Day 1, Day 7)
    → AI Usage tab:
        - Voice generations: count, languages, voices used
        - Script generations: count, tones, lengths
        - Cost tracking (Groq tokens consumed)
```

---

## 3. Edge Cases & Error Handling

### 3.1 FFmpeg.wasm Failures
```
Video export initiated
    → FFmpeg.wasm loads (first time: ~25MB download with progress bar)
    → IF out-of-memory (OOM):
        → Catch error gracefully
        → Show message: "Your device doesn't support video export. Try image templates instead."
        → Log error: POST /api/errors/log { type: 'ffmpeg_oom', device_info }
    → IF SharedArrayBuffer not available:
        → Show message: "Video export requires a newer version of Android (10+)."
        → Offer image export as alternative
```

### 3.2 AI Service Failures
```
Voice generation fails (Edge TTS down):
    → Show error: "Voice generation is temporarily unavailable. Please try again in a few minutes."
    → Backend auto-switches to Piper TTS after 3 consecutive failures
    → Log in ai_usage_log with error code

Script generation fails (Groq API down):
    → Show error: "Script generation is temporarily unavailable."
    → Offer manual script input as alternative
    → Log error
```

### 3.3 Network Errors
```
API call fails (timeout, 5xx, network error):
    → Show non-blocking toast: "Connection issue. Retrying..."
    → Auto-retry: 3 attempts with exponential backoff (1s, 2s, 4s)
    → If all retries fail: Show persistent banner with "Retry" button
    → Template data served from IndexedDB cache when possible
```

### 3.4 Cold Start Handling
```
First API call after HuggingFace Space sleep:
    → Response takes 15-30s (cold start)
    → Show animated "Preparing NewsForge..." screen with progress indication
    → Do NOT show error until > 45s timeout
    → Subsequent calls are fast (<500ms)
```

### 3.5 App Version Check
```
App launch → GET /api/app/config
    → Response: { min_supported_version, latest_version, maintenance_mode }
    → IF app_version < min_supported_version:
        → Force-update dialog (blocking): "Please update NewsForge to continue."
        → Link to Play Store
    → IF maintenance_mode == true:
        → Maintenance screen: "NewsForge is under maintenance. We'll be back shortly."
    → IF app_version < latest_version:
        → Optional update banner: "A new version is available. Update now?"
```

---

## 4. State Diagrams

### 4.1 User Session States
```
                    ┌──────────────┐
                    │  Anonymous   │ ← App opened, not logged in
                    └──────┬───────┘
                           │ [Login / Register]
                           ▼
                    ┌──────────────┐
                    │ Authenticated │ ← Full access to all features
                    └──────┬───────┘
                           │ [Token expired + refresh failed]
                           ▼
                    ┌──────────────┐
                    │  Logged Out  │ ← Must re-authenticate
                    └──────────────┘
```

### 4.2 Export States
```
    ┌──────────┐
    │  Filling  │ ← User editing input slots
    └────┬─────┘
         │ [All required fields filled]
         ▼
    ┌──────────┐
    │  Ready   │ ← Export button enabled
    └────┬─────┘
         │ [Tap Export]
         ▼
    ┌────────────┐
    │ Processing │ ← Rendering (image: ~1s, video: ~15-30s)
    └────┬───────┘
         │ [Complete]            │ [Error]
         ▼                      ▼
    ┌──────────┐          ┌─────────┐
    │ Exported │          │ Failed  │ → Error message + retry option
    └──────────┘          └─────────┘
```

---

*This document defines all user journeys and admin workflows for NewsForge. The Flow/UX-Logic Agent should reference this for implementing navigation, state management, and interaction sequences.*
