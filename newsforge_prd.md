# NewsForge — Product Requirements Document (PRD)
**Status:** Active Project • **Last Updated:** 2026-06-24 (v3 — Production Audit Fixes)  
**Product Type:** Android Mobile App (B2C/B2B2C) + Admin Dashboard (Web) • **Target Launch:** 5 weeks from kickoff  
**Founder:** Solo Indie Hacker • **Budget:** ₹0 (Free-tier infrastructure only) • **v1 = Completely Free (no payments)**  
**Sections:** 22 — Vision, Audience, Competition, Pricing, Marketing, UI/UX, Architecture, Template System, Admin Dashboard, AI Features, Database, API, Data Storage Strategy, Security, MVP Scope, Roadmap, Anti-Patterns, Metrics, Risks, App Store, Compliance, Changelog

---

## 1. Product Vision

**One-Liner:** NewsForge lets anyone create professional, broadcast-quality news graphics and videos in under 60 seconds — no editing skills, no design tools, just pick a template, fill in the blanks, and export.

**Emotional Pitch (Brand Psychology):**
> "You don't need a newsroom, a design team, or a video editor. You just need a story. NewsForge turns your headline into a broadcast-ready news graphic or video — complete with AI voiceover and a professional script — in the time it takes to write a tweet."

We don't sell a video editor. We sell **speed**, **credibility**, **professional output**, and **the death of the learning curve**.

**Product Category:**
NewsForge is a **Template-Driven News Content Factory** — a two-sided system where admins design premium templates via a web-based editor, and end-users consume those templates on mobile to produce news content instantly.

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

**Why "NewsForge" and Not "Another Canva":**
1. **News-specific** — Every template is purpose-built for news content (breaking news banners, lower thirds, story cards, news reels). Canva has 10,000 templates; we have 50 that are *perfect* for news.
2. **Zero-skill rendering** — Users never touch a timeline, never drag layers, never adjust keyframes. They type a headline, upload a photo, tap "Generate Voice", and export.
3. **Admin-curated quality** — Templates aren't user-generated chaos. Every template is designed by the admin in a professional editor and published with strict input constraints.
4. **AI-native** — Voice generation and script writing are first-class features, not afterthoughts.
5. **OTA template delivery** — Templates are synced over-the-air from the cloud. Admin publishes a new template → it appears in users' apps within minutes. No Play Store update needed. Ever.

---

## 2. Core Audience & Their Problems

### 2.1 Primary Personas

| Persona | Description | Size Estimate |
| :--- | :--- | :--- |
| **The YouTube/Instagram News Creator** | Runs a news channel on YouTube or Instagram. Needs to push 3–5 news stories/day as graphics or short videos. Currently uses CapCut or InShot which requires editing skills and takes 20–40 minutes per video. | ~5M creators globally |
| **The WhatsApp News Channel Operator** | Runs a WhatsApp Channel or Group broadcasting local news. Needs eye-catching news graphics fast. Currently screenshots TV news or uses basic poster apps. | ~10M+ in India alone |
| **The Local/Citizen Journalist** | Covers hyperlocal news (city, district). Not tech-savvy. Needs professional-looking output to build credibility. Currently writes plain text posts or uses low-quality apps with watermarks. | ~2M in India, growing |
| **The Social Media News Page Admin** | Manages a Facebook/Twitter/Instagram news page. Posts 10–20 news items/day. Speed is everything. Currently copies graphics from other pages or uses Canva (slow for volume). | ~3M globally |

### 2.2 Secondary Persona (Deprioritized)

| Persona | Description | Why Deprioritized |
| :--- | :--- | :--- |
| **The Professional News Organization** | Established newsrooms with existing Adobe/FCPX workflows. | Won't switch to a mobile-first tool. Different budget, different workflow. Target in v3+ with white-label/API. |

### 2.3 Validated Pain Points

| Pain Point | Severity | Current Workaround |
| :--- | :--- | :--- |
| **"Design Skill Barrier"** — Creating professional news graphics/videos requires Photoshop, After Effects, or hours in Canva. | 🔴 Critical | Use CapCut/InShot templates (generic, not news-specific) or pay a designer ($5–$20 per graphic). |
| **"Speed vs Quality Tradeoff"** — News is time-sensitive. Spending 30 min editing a 15-second news reel means missing the story window. | 🔴 Critical | Post text-only updates, screenshot TV news (copyright risk), or post without graphics. |
| **"Credibility Gap"** — Poorly designed graphics make the creator look amateur. Audiences trust visually polished content. | 🟠 High | Use stolen graphics from professional outlets, slap text on stock photos. |
| **"Voice & Script Burden"** — Recording voiceovers requires quiet space, good mic, and scripting skills. Writing concise news scripts is a distinct skill. | 🟠 High | Skip voiceovers entirely, or record shaky phone audio. No AI assist. |
| **"Template Fatigue"** — Generic template apps (Canva, InShot) have thousands of templates, but finding news-specific ones is a needle-in-a-haystack problem. | 🟡 Medium | Search "news" in Canva, get 80% irrelevant results. Settle for "close enough." |
| **"Vernacular Content Gap"** — Most design tools default to English. Indian regional language support (Hindi, Tamil, Telugu, etc.) is an afterthought. | 🟡 Medium | Manually type in regional scripts; fonts render poorly; no RTL support. |

### 2.4 The "Aha" Moment
The instant a user picks a "Breaking News" template, types their headline, uploads one photo, taps "Generate Voice" and hears a professional AI anchor reading their story over an animated graphic — and exports the whole thing in under 60 seconds. **That's the moment they stop using CapCut.**

---

## 3. Competitive Landscape & Our Positioning

### 3.1 Competitor Matrix

| Competitor | Price | News-Specific | Templates | AI Voice | AI Script | No Editing Skill | Admin Editor | Our Advantage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Canva** | $0–$15/mo | ❌ Generic | ✅ 10K+ | ❌ | ❌ | ❌ Still drag-and-drop | ❌ | We're news-specific, zero-skill, AI-native. |
| **CapCut** | Free | ❌ Generic | ✅ | ❌ | ❌ | ❌ Timeline editing | ❌ | No timeline. No learning curve. News-first. |
| **InVideo** | $15–$30/mo | ❌ Generic | ✅ | ✅ | ✅ | ❌ Editor UI | ❌ | Cheaper/free. Mobile-first. Faster workflow. |
| **FlexClip** | $0–$20/mo | ✅ Partial | ✅ | ✅ | ✅ | ❌ Editor required | ❌ | We're fill-in-the-blank, not edit-on-timeline. |
| **HeyGen** | $24–$60/mo | ❌ Generic | ✅ | ✅ AI Avatar | ✅ | ✅ | ❌ | Expensive. We're ₹0 free tier with similar output. |
| **News Maker Apps (Play Store)** | Free+Ads | ✅ | ✅ Basic | ❌ | ❌ | ✅ | ❌ | Low quality templates. No AI. No video. We're premium. |
| **NewsForge (Us)** | Freemium | ✅ Purpose-built | ✅ Curated | ✅ | ✅ | ✅ | ✅ | News-first, AI-native, admin-curated, zero-skill. |

### 3.2 Our Unfair Advantages
1. **News-specific template curation** — Every template is designed for a specific news format (breaking news, sports scores, weather, election results). Not a generic design tool.
2. **Admin-controlled template pipeline** — Quality is guaranteed by admin curation, not crowd-sourced templates. A professional editor (Fabric.js-based) produces consistent, polished designs.
3. **AI voice + AI script as first-class features** — Built into the core flow, not bolted-on extras.
4. **Fill-in-the-blank UX** — Users never see a canvas, timeline, or layer panel. They see a form with labeled inputs (Headline, Photo, Source, Date) and a live preview.
5. **India-first + Vernacular** — Multi-language support, Indian regional fonts, lightweight APK for budget devices.
6. **₹0 operation** — Edge TTS on HuggingFace, Groq free tier (Mistral) for scripts, Cloudflare R2 for assets. We can offer a generous free tier that undercuts paid competitors.
7. **100% client-side rendering** — Both image AND video rendering happen on the user's device. Zero server GPU/CPU cost. Backend stays stress-free.
8. **OTA template sync** — New templates appear in-app instantly. No Play Store update required for content changes.

### 3.3 Commodity Features (Easy to Copy)
- Basic news graphic templates with text overlays
- Social media format presets (9:16, 16:9, 1:1)
- PNG/JPG export
- Basic text input forms

### 3.4 Features That Create Defensibility
- **Admin template editor** — Building a Fabric.js-based visual editor with input-slot definitions is a significant engineering moat
- **AI voice pipeline** — Integrating Edge TTS seamlessly into the export flow requires real orchestration
- **Template-to-video rendering pipeline** — Server-side FFmpeg composition from JSON template definitions is non-trivial
- **Admin-designed template library** — Growing library of premium, professionally designed news templates

---

## 4. Pricing Strategy

### 4.1 Pricing Tiers

> **⚡ v1 Launch:** v1 launches as a **completely free app** with no payment integration, no premium tiers, no rate limits, and no watermarks. All templates are free, all features (AI Voice, AI Script, exports) are fully available with no restrictions. The pricing tiers below are the **planned monetization model for v1.1+** once product-market fit is validated and payment integration (Google Play Billing for Android app, Razorpay for PWA) is implemented.

| | **Free** | **Pro** ★ Recommended | **Newsroom** |
| :--- | :--- | :--- | :--- |
| **Monthly** | ₹0 | ₹299/mo (~$3.50) | ₹799/mo (~$9.50) |
| **Annual** | ₹0 | ₹199/mo (billed ₹2,388/yr) | ₹549/mo (billed ₹6,588/yr) |
| Templates | Free templates only | All templates (free + premium) | All templates + early access |
| Exports/day | Unlimited ★ | Unlimited | Unlimited |
| AI Voice | Unlimited ★ (standard voices) | Unlimited (standard + premium voices) | Unlimited (all voices + SSML) |
| AI Script | Unlimited ★ | Unlimited | Unlimited |
| Video Templates | ❌ Image only | ✅ Image + Video | ✅ Image + Video + Custom |
| Watermark | "Made with NewsForge" (small, corner) | No watermark | No watermark |
| Export Quality | 720p | 1080p | 1080p + 4K |
| Custom Branding | ❌ | ✅ Add your logo | ✅ Full white-label |
| Offline Mode | ❌ | ✅ Cached templates | ✅ Full offline |
| Languages | English + Hindi | All supported languages | All + priority for new languages |

> **★ "Unlimited" = Soft Rate Limited (Hidden)**  
> Free tier shows "Unlimited" in the UI but is **silently rate-limited** on the backend:  
> - Exports: 10/day (client-side, enforced via localStorage counter + server-side `exports/log` API)  
> - AI Voice: 5 generations/day  
> - AI Script: 5 scripts/day  
> When limits are hit, the user sees a friendly message: *"You're on fire today! 🔥 Upgrade to Pro for uninterrupted access."*  
> Pro and Newsroom tiers have genuinely high limits (100/day exports, 50 voice, 50 script) that feel unlimited in practice.  
> **Why this matters:** Showing "Unlimited" on the Play Store listing dramatically improves install conversion rate vs showing "5/day". The soft limit catches only power users — exactly the ones most likely to convert.

### 4.2 Pricing Psychology
- **₹299 anchored against ₹799** — Pro feels like the obvious deal for serious creators.
- **"Unlimited" labeling on free tier** — Removes download friction. Soft rate limits catch only power users who are prime conversion candidates.
- **India-first pricing** — ₹299/mo ($3.50) is affordable for Indian creators. Comparable to Canva Pro India pricing.
- **No free tier for video** — Video templates are the premium upsell. Image templates + AI voice free tier hooks them, video converts them.
- **Annual discount (~33%)** — Strong incentive for commitment. Reduces churn.
- **Soft limits feel generous** — 10 exports/day is more than most casual users need. They never feel restricted. Power users hit the wall and convert.

### 4.3 Willingness to Pay Validation
- Indian Instagram news pages generating ₹5K–₹50K/mo from sponsorships will easily pay ₹299/mo for professional output.
- YouTube news creators earning from AdSense spend ₹500–₹2000/mo on tools already.
- Canva Pro India costs ₹499/mo — we're cheaper with news-specific value.

---

## 5. Marketing Strategy (₹0 Budget)

### 5.1 Channel 1: Play Store ASO (Primary Acquisition)

| Action | Expected Impact | Timeline |
| :--- | :--- | :--- |
| Target keywords: "news maker", "breaking news creator", "news video maker", "news banner maker", "news graphics" | 50% of early installs | Week 5 |
| 5 high-res screenshots showing: template selection → fill inputs → AI voice → final output | Conversion rate optimization | Week 5 |
| Short demo video (15s) showing the 60-second workflow | Install conversion +30% | Week 5 |
| Vernacular descriptions (Hindi, Tamil, Telugu, Bengali) | Expands addressable market 3× | Week 6 |

### 5.2 Channel 2: Content & SEO
Write 5 "bridge" articles on our blog:
1. *"How to Create Professional News Graphics on Your Phone (No Design Skills)"*
2. *"Best Free AI Voice Generator for News Videos in 2026"*
3. *"How to Start a YouTube News Channel with Zero Budget"*
4. *"Breaking News Banner Maker: Free Templates for Instagram & WhatsApp"*
5. *"AI News Script Writer: Generate Broadcast-Ready Scripts in Seconds"*

### 5.3 Channel 3: Social Media & Community
- **YouTube Shorts/Instagram Reels**: Post "Before vs After" content — raw headline → polished NewsForge output. Show the 60-second workflow. Target: 3 posts/week.
- **Twitter/X**: Build-in-public. Share weekly MAU/download milestones.
- **Reddit**: r/journalism, r/ContentCreators, r/YouTubers — genuine help + tool links.
- **WhatsApp Groups**: Indian journalist/blogger groups — direct sharing of app link.

### 5.4 Channel 4: Watermark Virality Loop
Every free-tier export includes a small "Made with NewsForge" watermark. When these graphics/videos are shared on social media, they become organic advertisements. This is our primary viral distribution loop.

```
User creates news graphic → Shares on Instagram/WhatsApp/YouTube
    → Viewers see "Made with NewsForge" watermark
    → Curious viewers search Play Store
    → New installs → New content with watermark
    → Viral loop continues
```

### 5.5 Channel 5: Template Trojan Horse
Create free, high-quality news templates that are only available in NewsForge. When news creators see polished output from other creators, they ask "what app is that?" — the template exclusivity drives installs.

---

## 6. UI/UX Strategy

### 6.1 Design Philosophy
Strictly aligned with our brand rules:
- **Premium, minimal, mobile-first.** Thumb-friendly interactions, generous touch targets, clean surfaces.
- **No neo-brutalism.** No high-contrast borders, no grainy noise, no glowing elements.
- **Speed over options.** Every screen should move the user toward export. Zero dead-ends, zero configuration overwhelm.
- **Dark-mode-first for mobile.** News creators work at all hours. Dark mode reduces eye strain and makes template previews pop.

### 6.2 Design System Tokens

| Element | Value |
| :--- | :--- |
| **Background (Dark)** | Deep Charcoal (#0F0F12) |
| **Background (Light)** | Cool White (#F5F5F7) |
| **Surface** | Elevated Dark (#1A1A1F) / Warm Gray (#E8E8EC) |
| **Primary Text** | Pure White (#FFFFFF) / Near Black (#1D1D1F) |
| **Accent** | Electric Blue (#3B82F6) |
| **Success** | Emerald (#10B981) |
| **Warning** | Amber (#F59E0B) |
| **Premium Badge** | Gold Gradient (#F59E0B → #EF4444) |
| **Headline Font** | Inter (sans-serif, tight tracking) — modern authority |
| **Body Font** | Inter (sans-serif) — clean readability |
| **Label/Data Font** | JetBrains Mono (monospace) — technical precision |
| **Border Radius** | 12px (modern, rounded, mobile-native feel) |
| **Shadows** | Subtle elevation shadows (0 2px 8px rgba(0,0,0,0.15)) |

### 6.3 Key Screens (Mobile App)

**A. Home / Template Browser**
- Top: Search bar + category pills (Breaking News, Sports, Weather, Politics, Entertainment, Business, Custom)
- Grid: Template thumbnails with badges (Free, Premium 👑, New ✨, Trending 🔥)
- Each card shows: Preview image, template name, format (Image/Video), size badge (Story/Post/Landscape)
- Bottom nav: Home, My Projects, AI Tools, Profile

**B. Template Fill Screen (The Core Experience)**
- Full-width live preview at top (shows template with user inputs in real-time)
- Below preview: Scrollable form with labeled input fields:
  - Each field defined by the template (e.g., "Headline" → text input, "Main Photo" → image picker, "Source" → text, "Date" → date picker)
  - Input constraints shown (e.g., "Max 60 characters", "Square crop recommended")
- Sticky bottom bar: "Preview" and "Export" buttons
- No canvas. No layers. No timeline. Just a form and a preview.

**C. AI Tools Screen**
- Two cards:
  - **AI Script Writer** — Input: topic/keywords + tone (Formal/Casual/Dramatic/Neutral) + length (30s/60s/90s) → Output: formatted news script
  - **AI Voice Generator** — Input: script text (paste or from AI Script) + voice selector (language, gender, style) → Output: audio preview + download
- Usage counters: "3 of 5 scripts remaining today" (free tier)

**D. Export Screen**
- Format selector: PNG / JPG / MP4 (video templates only)
- Quality selector: 720p (Free) / 1080p (Pro) / 4K (Newsroom)
- Add AI Voice toggle (for video templates) — select from generated voices
- Preview final output
- "Export" button → progress bar → save to gallery / share sheet
- Post-export: "Share to Instagram / WhatsApp / YouTube" quick actions

**E. My Projects Screen**
- List of recent exports with thumbnails
- "Edit & Re-export" option (re-opens fill screen with saved inputs)
- Cloud sync for Pro/Newsroom users (localStorage for free tier)

**F. Profile & Settings**
- Current plan + upgrade CTA
- Usage stats (exports today, AI credits remaining)
- Language preference
- Download quality preference
- Cache management (clear cached templates)

### 6.4 Key Screens (Admin Dashboard — Web)

**A. Dashboard Home**
- Metrics overview: Total templates, total users, exports today, AI usage, revenue
- Quick actions: "Create Template", "View Analytics", "Manage Users"

**B. Template Manager**
- Table/grid of all templates with: Thumbnail, Name, Category, Format, Pricing (Free/Premium), Status (Draft/Published/Archived), Downloads count, Last modified
- Filters: Category, Status, Pricing, Format
- Bulk actions: Publish, Archive, Change pricing

**C. Template Editor (Detailed in §9)**
- Full-featured visual editor (Fabric.js-based)
- Layers panel, properties panel, canvas area, toolbar
- Input slot definition interface
- For video: Scene manager + basic timeline

**D. Analytics**
- Template performance: Which templates get most downloads/exports
- User metrics: DAU, MAU, retention, conversion
- AI usage: Voice generations, script generations, cost tracking
- Revenue: Subscriptions, plan distribution

### 6.5 User Flow (Template Selection → Export)
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

---

## 7. Technical Architecture

### 7.1 Stack Overview

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
| **Push Notifications** | Firebase Cloud Messaging (free) via Capacitor plugin | ₹0 |

### 7.1.1 Project Directory Structure

To keep the development and deployment simple, decoupled, and easy to manage for a solo founder, the repository code must be organized into distinct folders:

*   **`/mobile`**: User-facing Android PWA codebase (HTML5/CSS/JS frontend + Capacitor integration + native wrapper).
*   **`/admin`**: Web-based admin dashboard and Fabric.js visual template editor (HTML5/CSS/JS, server-rendered via Jinja2).
*   **`/backend`**: Python FastAPI backend (auth, database, template API, Edge TTS integration, deployment scripts).
*   **`/shared`**: Shared database migrations, common schema schemas, public assets, and setup documentation.

Separating these components into folders allows for modular iteration, keeps frontend and backend concerns isolated, and avoids library version conflicts.

### 7.2 PWA + Capacitor Strategy (Android Only)

**Why PWA, not React Native or Flutter:**
- Aligns with our vanilla HTML/CSS/JS stack (no new framework to learn)
- Fabric.js (our rendering engine) is a web library — runs natively in PWA
- Capacitor wraps the PWA for **Android Play Store** distribution with native APIs (camera, file system, share)
- **Android only** — India is 95% Android. No iOS build planned until revenue justifies Apple Developer fee ($99/yr) and review overhead.
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

### 7.3 HuggingFace Spaces Strategy (Single Space — Lightweight)

Since video/image rendering is now **100% client-side**, the backend is dramatically simpler. We only need **one** HuggingFace Space.

**Single Space: API Server + Voice (FastAPI)**
- Handles: Auth, template CRUD, user management, project management, analytics, **AI Voice generation (Edge TTS)**
- Docker SDK with FastAPI + uvicorn + edge-tts
- Keep-alive via GitHub Actions cron
- **No FFmpeg on server** — video compositing happens client-side via FFmpeg.wasm
- **No heavy CPU load** — the most intensive operation is Edge TTS (~2-5s per generation), which is lightweight

| Constraint | Impact | Mitigation |
| :--- | :--- | :--- |
| **Cold starts** | 15–30s delay after sleep | Cron ping every 4 min. Queue UI shows "preparing..." |
| **Ephemeral disk** | Generated voice files lost on restart | Stream immediately to client, delete temp file. Template assets on R2. |
| **2 vCPU limit** | Sufficient — no video rendering on server anymore | Edge TTS is lightweight. Max 5 concurrent voice requests. |
| **16GB RAM** | More than enough for API + Edge TTS | Monitor memory. Fail gracefully if exceeded. |

### 7.4 Cloudflare R2 Storage Strategy

| Content | Storage Location | Size Estimate | Lifecycle |
| :--- | :--- | :--- | :--- |
| Template background images | R2 `/templates/assets/` | ~50KB–500KB each | Permanent (admin-uploaded) |
| Template thumbnail previews | R2 `/templates/thumbs/` | ~20KB each | Permanent (auto-generated) |
| Template element assets (shapes, icons, overlays) | R2 `/templates/elements/` | ~10KB–100KB each | Permanent (admin-uploaded) |
| Font files (Google Fonts subset) | R2 `/fonts/` | ~50KB–200KB each | Permanent |
| **Total at 200 templates** | | **~500MB** | **Well within 10GB free tier** |

**What is NOT stored on R2:**
- User-uploaded photos (processed client-side, composited in-memory, never uploaded)
- Generated voice audio (ephemeral, streamed from HF Space)
- Rendered video files (ephemeral, streamed from HF Space)
- User export files (saved directly to user's device)

---

## 8. Template System Architecture

### 8.1 Template Format (JSON Schema)
Every template is stored as a JSON document that defines its visual structure, input slots, and metadata. This JSON is created by the admin editor (Fabric.js) and consumed by the mobile renderer.

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
    },
    {
      "slot_id": "main_image",
      "label": "Main Photo",
      "type": "image",
      "target_object_id": "main_image_layer",
      "constraints": {
        "required": true,
        "min_width": 400,
        "aspect_ratio_hint": "16:9",
        "placeholder": "Upload or capture a photo"
      }
    },
    {
      "slot_id": "source_name",
      "label": "Source / Channel Name",
      "type": "text",
      "target_object_id": "source_text_layer",
      "constraints": {
        "max_length": 30,
        "required": false,
        "placeholder": "e.g., NewsForge India"
      }
    },
    {
      "slot_id": "date_line",
      "label": "Date",
      "type": "date",
      "target_object_id": "date_text_layer",
      "constraints": {
        "required": false,
        "format": "DD MMM YYYY",
        "default": "today"
      }
    },
    {
      "slot_id": "category_badge",
      "label": "Category",
      "type": "select",
      "target_object_id": "category_badge_layer",
      "constraints": {
        "options": ["BREAKING", "EXCLUSIVE", "DEVELOPING", "UPDATE", "ALERT"],
        "required": true,
        "default": "BREAKING"
      }
    }
  ],
  "scenes": null,
  "voice_config": null
}
```

### 8.2 Video Template Format (Extended)
Video templates extend the base format with scenes and timeline:

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
    },
    {
      "scene_id": "body",
      "duration_seconds": 5,
      "canvas": { /* Fabric.js state */ },
      "transition_in": "slide_left",
      "transition_out": "fade"
    },
    {
      "scene_id": "outro",
      "duration_seconds": 2,
      "canvas": { /* Fabric.js state */ },
      "transition_in": "fade",
      "transition_out": "fade"
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

### 8.3 Input Slot Types

| Type | Admin Defines | User Sees | Rendering |
| :--- | :--- | :--- | :--- |
| `text` | Max/min length, font override, color override, multiline | Text input field | Replaces text in target Fabric.js object |
| `image` | Aspect ratio, min resolution, crop mode (fill/fit) | Image picker (gallery/camera) | Replaces image src in target Fabric.js object, auto-cropped |
| `select` | Options list, default value | Dropdown / pill selector | Replaces text content or swaps between preset visual states |
| `color` | Color palette options (admin-curated) | Color swatch picker | Updates fill/stroke on target object |
| `date` | Format string, default (today/manual) | Date picker | Formatted date string replaces text |
| `number` | Min, max, unit label | Number input with stepper | Formatted number replaces text (e.g., scores) |
| `toggle` | Label, affects which layers visible | Toggle switch | Shows/hides target objects (e.g., "Show Logo" toggle) |
| `logo` | Size constraints, position | Image upload (square crop enforced) | Places logo in designated area |

### 8.4 Template Rendering Pipeline (100% Client-Side)

> **⚡ KEY DESIGN DECISION:** Both image AND video rendering happen entirely on the user's device. The server never renders any media. This keeps our backend stress-free and eliminates server GPU/CPU costs.

**Image Templates (Client-Side — Fabric.js):**
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

**Video Templates (Client-Side — FFmpeg.wasm):**
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

**FFmpeg.wasm Strategy:**
- **Library:** `@ffmpeg/ffmpeg` (MIT license, ~25MB WASM core — loaded lazily on first video export)
- **SharedArrayBuffer requirement:** Requires COOP/COEP HTTP headers (see §7.2 for full configuration). Capacitor WebView requires custom `WebViewClient` override in `MainActivity.java` to inject these headers. Android 10+ (API 29+) required. Cloudflare R2 must serve assets with `Cross-Origin-Resource-Policy: cross-origin` header via Transform Rules.
- **Performance:** Modern Android phones (Snapdragon 6xx+) can composite a 30-second 720p video in ~15-30 seconds.
- **Memory:** Peak ~200-400MB during compositing. Works on devices with 3GB+ RAM (covers 90%+ of Indian Android market).
- **Fallback for low-end devices:** If FFmpeg.wasm fails (OOM), show a message: "Your device doesn't support video export. Try image templates instead." — graceful degradation, not a crash.

**What this means for the backend:**
- Server handles ONLY: Auth, template serving, AI voice (Edge TTS), AI script (Groq/Mistral), analytics logging
- No FFmpeg installed on HuggingFace Space
- No video rendering queue, no concurrent render limits, no temp file cleanup
- Massive reduction in server complexity and cost

---

## 9. Admin Dashboard & Template Editor

### 9.1 Template Editor Architecture
The template editor is the crown jewel of the admin dashboard. It's a browser-based visual editor built on **Fabric.js v6** that gives admins the power to design templates with a professional tool, then define which elements become user-fillable input slots.

**Editor Layout:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  TOOLBAR (Top)                                                        │
│  [Text] [Image] [Shape] [Icon] [Line] [Background] │ [Undo] [Redo]  │
├────────────┬─────────────────────────────────────┬───────────────────┤
│  LAYERS    │         CANVAS AREA                  │   PROPERTIES     │
│  PANEL     │                                      │   PANEL          │
│  (Left)    │   ┌──────────────────────────┐      │   (Right)        │
│            │   │                          │      │                   │
│  ☐ Layer 5 │   │    [Live Canvas]         │      │  Position: X, Y  │
│  ☐ Layer 4 │   │    (Fabric.js)           │      │  Size: W × H     │
│  ☐ Layer 3 │   │                          │      │  Rotation: 0°    │
│  ☐ Layer 2 │   │    (Drag, resize,        │      │  Font: Inter     │
│  ☐ Layer 1 │   │     rotate objects)      │      │  Color: #FFF     │
│            │   │                          │      │  Opacity: 100%   │
│            │   └──────────────────────────┘      │                   │
│            │                                      │  ── INPUT SLOT ──│
│            │   [Size: 1080×1920] [Zoom: 75%]     │  ☑ Is Input Slot │
│            │                                      │  Label: Headline │
│            │                                      │  Type: text      │
│            │                                      │  Max Length: 80  │
│            │                                      │  Required: ☑     │
├────────────┴─────────────────────────────────────┴───────────────────┤
│  SCENE TIMELINE (Bottom — Video Templates Only)                       │
│  [Intro: 3s] → [Body: 5s] → [Outro: 2s]   │ [+Scene] [Preview ▶]  │
└──────────────────────────────────────────────────────────────────────┘
```

### 9.2 Editor Features

**Canvas Tools:**
- **Text tool** — Add text with Google Fonts, size, color, alignment, letter spacing, line height, shadow
- **Image tool** — Upload images from local or R2 asset library. Crop, mask, filters (brightness, contrast, grayscale)
- **Shape tool** — Rectangle, circle, triangle, polygon, star, custom SVG
- **Icon library** — Curated set of news-relevant icons (microphone, camera, globe, location pin, etc.)
- **Background** — Solid color, gradient, image, pattern
- **Line/Divider** — Horizontal, vertical, custom paths

**Layer Management:**
- Drag-to-reorder layers
- Lock/unlock layers
- Show/hide layers
- Group/ungroup
- Duplicate layer
- Layer naming (for identifying target_object_id)

**Properties Panel:**
- Position (X, Y), Size (W, H), Rotation, Opacity
- Fill color, Stroke color/width
- Font family, size, weight, style, alignment
- **Input Slot Definition** — Toggle "Is Input Slot" checkbox:
  - When enabled: Define slot label, type, constraints
  - The object becomes user-editable on mobile
  - Visual indicator (blue dashed border) shows which objects are input slots

**Scene Management (Video Templates):**
- Add/remove/reorder scenes
- Set duration per scene (seconds)
- Transition selector (fade, slide, zoom, cut)
- Per-object animations (typewriter, fade-in, slide-in, scale, bounce)
- Animation timing (delay, duration)
- Preview button plays all scenes in sequence

### 9.3 Template Publishing Workflow
```
Admin opens editor
    → Designs template visually (add objects, style, arrange)
    → Marks specific objects as "Input Slots" with constraints
    → Sets metadata (name, category, pricing, sizes, tags, languages)
    → [For video] Defines scenes, transitions, animations
    → Clicks "Preview as User" → sees the fill-screen UX the user will see
    → Clicks "Save Draft" → template saved but not visible to users
    → Reviews draft → Clicks "Publish" → template goes live in the app
    → [Later] Can "Archive" (hide) or "Unpublish" templates
```

### 9.4 Template JSON Serialization
When the admin saves a template:
1. Fabric.js `canvas.toJSON(['id', 'slot_config'])` exports the full canvas state as JSON
2. Custom properties (`slot_config`) are included for input slot metadata
3. This JSON is stored in `templates.canvas_data` (JSONB) in NeonDB
4. Asset references (images, fonts) are stored as R2 URLs
5. Template thumbnail auto-generated from canvas preview and uploaded to R2

---

## 10. AI Features Architecture

### 10.1 AI Voice Generation (Edge TTS)

**Technology:** `edge-tts` Python library accessing Microsoft's free neural TTS service.

> **Voice generation is the ONLY media operation that runs server-side.** Edge TTS requires a server-side Python process. All other rendering (image + video) is client-side.

**Architecture:**
```
Mobile App → POST /api/voice/generate { text, voice_id, speed }
    → FastAPI on HuggingFace Space (single Space handles API + Voice)
    → edge_tts.Communicate(text, voice).save(temp_file)
    → Stream MP3 back to client as response
    → Delete temp file immediately
    → Client plays preview / stores in memory for video compositing (FFmpeg.wasm)
```

**Voice Library:**

| Tier | Voices Available | Languages | Speed Control | Max Length |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | 5 voices (2 English, 1 Hindi, 1 Tamil, 1 Telugu) | EN, HI, TA, TE | 0.8×–1.2× only | 500 characters (~30s) |
| **Pro** | 50+ voices (all Edge TTS neural voices) | 30+ languages | 0.5×–2.0× | 2000 characters (~120s) |
| **Newsroom** | 50+ voices + SSML control (emphasis, pauses) | 30+ languages | Full SSML | 5000 characters (~300s) |

**Quality Differentiation Strategy:**
- Free tier uses standard neural voices (still high quality — Microsoft's TTS is excellent)
- The "low quality" aspect is enforced through **restrictions**, not through degraded audio:
  - Fewer voice options (only 5 voices)
  - Shorter max length (500 chars)
  - No speed control beyond narrow range
  - No SSML (Speech Synthesis Markup Language) for emphasis/pauses
  - **Small audio watermark** at the end: "Voice by NewsForge" (1 second, low volume)
- Pro/Newsroom removes all restrictions

**Rate Limiting (Hidden — UI shows "Unlimited"):**

| Tier | Actual Hidden Limit/Day | Concurrent Requests |
| :--- | :--- | :--- |
| Free | 5 (shown as "Unlimited") | 1 |
| Pro | 50 (effectively unlimited) | 3 |
| Newsroom | 200 (effectively unlimited) | 5 |

**Edge TTS Sustainability Note:**
Edge TTS accesses Microsoft's free service via web scraping. If Microsoft restricts this:
- **Fallback 1:** Piper TTS (open-source, runs locally on HF Space, lower quality but fully self-hosted)
- **Fallback 2:** Google Cloud TTS free tier (4M characters/month — sufficient for early scale)
- **Fallback 3:** Introduce paid-only voice at a cloud API cost-pass-through model

**Edge TTS Health Monitoring:**
- Automated health check: APScheduler generates a 5-word test voice every 60 minutes via Edge TTS
- If 3 consecutive checks fail → auto-switch to Piper TTS fallback + send admin alert email
- All voice generation failures logged in `ai_usage_log` with error codes and failure reason
- Piper TTS fallback pre-built and ready as a Docker layer — switching is a config flag (`TTS_PROVIDER=piper`), not a code change

### 10.2 AI Script Writer (Groq API — Mistral Model)

**Technology:** Groq API free tier running **Mistral** model.

**Why Groq + Mistral (not Gemini):**
- **Groq free tier:** 14,400 requests/day, 6,000 tokens/minute — far more generous than Gemini's ~1,500 RPD
- **Mistral on Groq:** Blazing fast inference (~200-500ms for short scripts) — Groq's LPU architecture is 10× faster than standard GPU inference
- **No API key waitlist** — Groq provides instant API keys
- **Token limits are explicit and predictable** (unlike Gemini's opaque quota system)

**Token Limits (Explicit):**

| Tier | Input Tokens (max) | Output Tokens (max) | Effective Script Length |
| :--- | :--- | :--- | :--- |
| **Free** | 200 tokens (~150 words of topic/context) | 150 tokens (~100 words / ~30s script) | 30-second news script |
| **Pro** | 500 tokens (~375 words) | 400 tokens (~300 words / ~90s script) | 90-second news script |
| **Newsroom** | 1000 tokens (~750 words) | 1000 tokens (~750 words / ~300s script) | 5-minute news script |

**Groq API Configuration:**
```python
import groq

client = groq.Groq(api_key=os.environ["GROQ_API_KEY"])

response = client.chat.completions.create(
    model="mistral-saba-24b",  # or "mixtral-8x7b-32768" for longer scripts
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ],
    max_tokens=output_token_limit,  # Enforced per tier
    temperature=0.7,
    top_p=0.9,
)
```

**Prompt Engineering:**
```
System: You are a professional news scriptwriter for broadcast media. 
Write concise, factual, engaging scripts suitable for voiceover narration.
Use short sentences. Vary sentence length for rhythm.
Never use jargon. Write for a general audience.
Open with the most important fact (inverted pyramid).
Include the who, what, when, where, and why.
The script should feel natural when read aloud.

User provides:
- Topic/headline: "{user_input_topic}"
- Tone: "{formal|casual|dramatic|neutral}"
- Target length: "{30s|60s|90s}" (approx word count: 75/150/225 words)
- Key points to include: "{optional bullet points}"
- Language: "{en|hi|ta|te|...}"

Output: A broadcast-ready news script with natural paragraph breaks.
```

**Rate Limiting (Hidden — UI shows "Unlimited"):**

| Tier | Actual Hidden Limit/Day | Max Input Tokens | Max Output Tokens |
| :--- | :--- | :--- | :--- |
| Free | 5 (shown as "Unlimited") | 200 | 150 |
| Pro | 50 (effectively unlimited) | 500 | 400 |
| Newsroom | 200 (effectively unlimited) | 1000 | 1000 |

**Script Caching:**
- Scripts are NOT cached server-side (each generation is unique)
- Scripts are stored temporarily in the user's project on their device (localStorage)
- User can edit the generated script before using it for voice generation

**Groq Sustainability Note:**
If Groq changes free tier limits:
- **Fallback 1:** Mistral API free tier (La Plateforme — 1M tokens/month free)
- **Fallback 2:** Groq paid tier ($0.24/1M tokens for Mistral — extremely cheap at scale)
- **Fallback 3:** Self-hosted Mistral 7B on HuggingFace Inference Endpoints (paid, ~$0.06/hr)

### 10.3 AI Pipeline Integration (Script → Voice → Video)
The killer UX is the seamless pipeline:
```
User taps "AI Script" → enters topic → gets generated script (Groq/Mistral, ~500ms)
    → Taps "Use for Voice" → script auto-fills voice input
    → Selects voice → Taps "Generate Voice" → hears preview (Edge TTS, ~3s)
    → Taps "Attach to Template" → voice audio blob stored in client memory
    → Taps "Export" → FFmpeg.wasm composites video + voice on-device (~15-30s)
    → 4 taps from idea to finished news video — ZERO server rendering
```

---

## 11. Database Schema (Core Tables)

```
users
├── id (UUID, PK)
├── email
├── name
├── auth_provider (google/email)
├── auth_provider_id
├── plan (free — v1 is free-only; pro/newsroom tiers added in v1.1+ with payments)
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
├── output_sizes (JSONB — array of {name, width, height, fps?})
├── canvas_data (JSONB — full Fabric.js canvas state + custom properties)
├── input_slots (JSONB — array of InputSlot objects)
├── scenes (JSONB, nullable — for video templates: array of Scene objects)
├── voice_config (JSONB, nullable — voice settings for video templates)
├── background_music_url (text, nullable — R2 URL)
├── thumbnail_url (text — R2 URL)
├── tags (text[] — PostgreSQL array)
├── supported_languages (text[] — ['en', 'hi', 'ta', ...])
├── download_count (integer, default 0)
├── sort_order (integer — for admin-controlled ordering)
├── created_by (UUID, FK → admin_users)
├── created_at
└── updated_at

template_assets
├── id (UUID, PK)
├── template_id (FK → templates, nullable — null = shared asset)
├── asset_type (background/element/icon/font/audio)
├── r2_key (text — Cloudflare R2 object key)
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
├── slot_values (JSONB — text/select/date values ONLY. e.g. { "headline": "...", "source": "..." })
├── ── NO base64 image data. NO data: URIs. Images are client-side only.
├── has_user_images (boolean, default false — if true, user must re-upload images on re-edit)
├── voice_audio_ref (text, nullable — temporary reference, NOT stored permanently)
├── output_format (png/jpg/mp4)
├── output_size_name (text — e.g., "Instagram Story")
├── is_exported (boolean)
├── created_at
└── updated_at

ai_usage_log
├── id (UUID, PK)
├── user_id (FK → users)
├── usage_type (voice_generation/script_generation)
├── input_length (integer — characters for voice, words for script)
├── model_used (text — 'edge-tts' / 'groq-mistral')
├── voice_id (text, nullable)
├── language (text)
├── tokens_used (integer, nullable — for script: input+output tokens)
├── created_at
└── (no output stored — ephemeral)

activity_log
├── id (UUID, PK)
├── user_id (FK → users, nullable)
├── event_type (template_viewed/template_used/export_completed/voice_generated/
│               script_generated/plan_upgraded/plan_downgraded/user_registered)
├── metadata (JSONB — event-specific data: template_id, format, etc.)
├── created_at
└── (no PII in metadata — only IDs and counts)

-- v1.1+ tables (not in v1 launch — no payment integration)
subscriptions
├── id (UUID, PK)
├── user_id (FK → users)
├── plan (pro/newsroom)
├── payment_provider (google_play/razorpay/stripe)
├── payment_id (text — Google: purchaseToken, Razorpay: payment_id, Stripe: sub_id)
├── product_id (text — Google Play product ID, e.g. 'pro_monthly')
├── status (active/cancelled/expired/trial/pending)
├── auto_renewing (boolean — Google Play manages renewal)
├── started_at
├── expires_at
├── cancelled_at (nullable)
├── created_at
└── updated_at

daily_usage (v1.1+ — for rate limiting when payment tiers are enforced)
├── id (UUID, PK)
├── user_id (FK → users)
├── usage_date (DATE, default CURRENT_DATE — no cron reset needed, query by date)
├── usage_type (export/voice_generation/script_generation)
├── count (integer, default 0)
├── UNIQUE(user_id, usage_date, usage_type)
├── created_at
└── updated_at

-- v1 table — aggregated metrics (retained indefinitely, unlike raw activity_log)
daily_metrics_snapshot
├── id (UUID, PK)
├── snapshot_date (DATE, unique)
├── dau (integer — distinct active users)
├── new_signups (integer)
├── total_exports (integer)
├── total_voice_gens (integer)
├── total_script_gens (integer)
├── created_at
└── updated_at
-- Populated nightly by APScheduler. Solves the problem of losing trend data
-- when raw activity_log rows are cleaned up at 60 days.
```

**Schema Size Estimate (500 users, 100 templates):**
- `templates` (100 rows × ~50KB avg canvas_data) ≈ 5MB
- `users` (500 rows × ~200B) ≈ 100KB
- `user_projects` (2000 rows × ~2KB) ≈ 4MB
- `activity_log` (50K rows × ~200B) ≈ 10MB
- `ai_usage_log` (10K rows × ~150B) ≈ 1.5MB
- **Total: ~20MB — well within 0.5GB NeonDB free tier**

---

## 12. API Architecture

```
--- User Authentication ---
POST   /auth/google                       → Google OAuth login (Firebase Auth)
POST   /auth/email/register               → Email + password registration
POST   /auth/email/login                   → Email + password login
POST   /auth/refresh                       → Refresh JWT token
GET    /auth/me                            → Get current user profile

--- Templates (User-Facing) ---
GET    /api/templates                      → List published templates (metadata + thumbnail URLs only, NO canvas_data). Filterable: category, format, language. Paginated: 20 per page.
GET    /api/templates/:id                  → Get full template detail (canvas_data + input_slots + scenes). Lazy-loaded only when user taps "Use Template".
GET    /api/templates/:id/thumbnail        → Get template thumbnail URL (redirect to R2)

--- User Projects ---
POST   /api/projects                       → Save a project (template + filled slot values)
GET    /api/projects                       → List user's saved projects
GET    /api/projects/:id                   → Get a saved project
PATCH  /api/projects/:id                   → Update project slot values
DELETE /api/projects/:id                   → Delete a project

--- AI Voice ---
POST   /api/voice/generate                 → Generate voice audio from text
         Body: { text, voice_id, speed?, ssml? }
         Returns: audio/mpeg stream
GET    /api/voice/voices                   → List available voices (filtered by user's plan tier)

--- AI Script ---
POST   /api/script/generate                → Generate news script from topic (Groq/Mistral)
         Body: { topic, tone, length, key_points?, language }
         Returns: { script_text, word_count, estimated_duration_seconds, tokens_used }

--- Template Sync (OTA) ---
GET    /api/templates/sync                 → Get templates updated since last sync
         Query: { since_timestamp }
         Returns: { templates: [...], deleted_ids: [...], sync_timestamp }
         (Client stores sync_timestamp, calls on app open + every 30 minutes)

--- Export Tracking ---
POST   /api/exports/log                    → Log an export event (for analytics + rate limiting)
         Body: { template_id, format, output_size }
GET    /api/exports/remaining              → Get remaining exports for today

--- Account ---
GET    /api/account/usage                  → Get current usage stats (exports, voice, scripts today)
PATCH  /api/account/preferences            → Update language, quality preferences
DELETE /api/account                        → Delete all user data (GDPR)
GET    /api/account/export                 → Export all data as JSON (GDPR)

--- Subscriptions (v1.1+ — not in v1 launch, no payment integration) ---
POST   /api/subscriptions/google-play/verify  → Verify Google Play purchase token (Android app — mandatory for digital goods)
POST   /api/subscriptions/google-play/webhook → Google Play RTDN (Real-Time Developer Notifications)
POST   /api/subscriptions/razorpay/create     → Create Razorpay subscription (PWA web only — India)
POST   /api/subscriptions/razorpay/webhook    → Razorpay webhook handler
GET    /api/subscriptions/current             → Get current subscription status
POST   /api/subscriptions/cancel              → Cancel subscription (routes to correct provider)

--- Admin API (Requires admin auth) ---
POST   /admin/auth/login                   → Admin login
GET    /admin/templates                    → List all templates (including drafts)
POST   /admin/templates                    → Create new template
PUT    /admin/templates/:id                → Update template (full replace of canvas_data)
PATCH  /admin/templates/:id/status         → Publish / Archive / Unpublish
DELETE /admin/templates/:id                → Delete template permanently
POST   /admin/templates/:id/assets         → Upload asset for template (image, font, audio)
GET    /admin/templates/:id/assets         → List assets for template
DELETE /admin/templates/:id/assets/:aid    → Delete asset
GET    /admin/analytics/overview           → Dashboard metrics
GET    /admin/analytics/templates          → Template performance metrics
GET    /admin/analytics/users              → User metrics
GET    /admin/analytics/ai-usage           → AI feature usage metrics
GET    /admin/users                        → List users (with plan, usage stats)
PATCH  /admin/users/:id                    → Update user (plan override, ban, etc.)

--- Health & Monitoring ---
GET    /health                             → Health check for keep-alive cron pings
GET    /api/app/config                     → App version check { min_supported_version, latest_version, maintenance_mode }
POST   /api/errors/log                     → Client-side error reporting (JS errors, FFmpeg.wasm OOM crashes, voice failures)
```

---

## 13. Data Storage Strategy (What We Store vs. Don't)

This is a critical section. Given our ₹0 budget with NeonDB (0.5GB) and Cloudflare R2 (10GB), every byte matters.

### 13.1 What We Store

| Data | Where | Why | Size Impact |
| :--- | :--- | :--- | :--- |
| User accounts (email, name, plan) | NeonDB | Core identity + billing | Tiny (~200B/user) |
| Template metadata + canvas JSON | NeonDB | Core product — must be in DB for querying | ~50KB/template |
| Template input slot definitions | NeonDB (inside template JSONB) | Defines the user experience | Included in template |
| Template assets (images, fonts, audio) | Cloudflare R2 | Binary files too large for DB, need CDN delivery | ~500KB–2MB/template |
| Template thumbnails | Cloudflare R2 | Fast browsing on mobile | ~20KB/template |
| User project metadata (which template, filled values) | NeonDB | Allows "edit & re-export" feature | ~2KB/project |
| AI usage logs (type, length, timestamp) | NeonDB | Rate limiting + analytics | ~150B/event |
| Activity logs (event type, metadata) | NeonDB | Analytics + debugging | ~200B/event |
| Subscription/payment references | NeonDB | Billing records | ~300B/subscription |
| Admin accounts | NeonDB | Dashboard access control | Tiny |

### 13.2 What We Do NOT Store

| Data | Why Not | Alternative |
| :--- | :--- | :--- |
| **User-uploaded photos** | Images are composited client-side. Never leave the user's device. Even for video templates — all rendering is client-side. | Client-side processing. |
| **Generated voice audio files** | Streamed directly to client, consumed immediately. No reason to persist. | Regenerate on demand (Edge TTS is fast ~2-5s). |
| **Generated script text (server-side)** | Streamed to client, stored only in user's localStorage. | Client-side storage (localStorage / IndexedDB). |
| **Rendered video files** | Generated on-device via FFmpeg.wasm. Never touches the server. | Client-side compositing → user saves to device. |
| **Full template asset copies in DB** | Binary blobs would fill 0.5GB NeonDB instantly. | R2 stores binaries, DB stores R2 URLs. |
| **User analytics/tracking PII** | No IP logging, no device fingerprinting. Activity logs use user IDs only. | Aggregated, anonymized metrics. |
| **Cached AI summaries** | Unlike BoardPortal, NewsForge scripts are one-shot (each is unique). No caching benefit. | Generate fresh each time. |
| **User session replays / heatmaps** | Privacy-invasive and storage-heavy. | Not implemented. |

### 13.3 Storage Budget Forecast

| Milestone | NeonDB Usage | R2 Usage | Status |
| :--- | :--- | :--- | :--- |
| Launch (100 templates, 100 users) | ~15MB | ~200MB | ✅ Comfortable |
| 6 months (200 templates, 1K users) | ~50MB | ~500MB | ✅ Comfortable |
| 12 months (500 templates, 5K users) | ~150MB | ~2GB | ✅ Within limits |
| 18 months (1K templates, 10K users) | ~400MB | ~5GB | ⚠️ Approaching NeonDB limit |
| **Scale trigger** | >400MB | >8GB | Upgrade NeonDB ($19/mo), R2 stays free |

### 13.4 Data Lifecycle Rules

| Data Type | Retention | Cleanup |
| :--- | :--- | :--- |
| User projects (saved) | Until user deletes or account deleted | Manual deletion by user |
| User projects (unsaved/abandoned) | 0 days — never persisted | Not stored server-side |
| Activity logs | **60 days** rolling | APScheduler cron job deletes old entries |
| AI usage logs | **60 days** rolling | Same cleanup job |
| Archived templates | Indefinite (hidden from users, admin can restore) | Admin manual delete |
| Deleted user accounts | **Immediate hard delete** — all projects, logs, subscriptions | GDPR compliance |

---

## 14. Security & Data Isolation

### 14.1 Authentication Strategy

**Authentication Architecture:**
- **Google OAuth flow:** Firebase Auth SDK (client-side only) handles Google OAuth popup → returns Firebase ID Token → client sends to `POST /auth/google` → backend verifies via `firebase-admin` SDK → backend issues its own custom JWT. Firebase tokens are **never** used for API authorization — only for the initial OAuth exchange.
- **Email/password flow:** Standard bcrypt registration → `POST /auth/email/login` → backend issues custom JWT.
- **Single token format:** All API routes verify the same custom JWT format. No Firebase tokens on the backend.

**Token Storage (XSS Protection):**
- **PWA (browser):** Access token stored as `HttpOnly; Secure; SameSite=Strict` cookie — JavaScript cannot read it.
- **Capacitor (Android app):** Access token stored via `@capacitor/preferences` (Android SharedPreferences with encryption). Attached as `Authorization: Bearer` header with `X-Client-Type: capacitor` header.
- **Access token:** 1-hour expiry (short-lived to limit XSS exposure window).
- **Refresh token:** 30-day expiry, one-time use (rotation on each refresh). Stored in HttpOnly cookie path `/auth/refresh` (PWA) or Preferences (Capacitor).
- No magic links for users — standard login for a consumer app.

**Admin Dashboard:**
- Email + password only (no OAuth — smaller attack surface)
- bcrypt password hashing, JWT with 1-hour expiry
- **Separate JWT signing secret** from user JWT (`ADMIN_JWT_SECRET` vs `USER_JWT_SECRET`) — admin token cannot authenticate user endpoints and vice versa
- IP allowlisting (enabled by default, configurable)
- No public registration — admin accounts created by superadmin only

### 14.2 Multi-Tenant Data Isolation
Every API query for user data includes a mandatory `user_id` filter:

```python
async def get_user_projects(user: User = Depends(get_current_user)):
    projects = await db.query(UserProject).filter(
        UserProject.user_id == user.id  # MANDATORY — never query without this
    ).all()
    return projects
```

- Users can NEVER access other users' projects or usage data
- Admin API is completely separate from user API (different auth, different middleware)
- Template data is public (read-only for all authenticated users) — no isolation needed

### 14.3 API Security

| Measure | Implementation |
| :--- | :--- |
| **Rate Limiting** | Per-user: Based on plan tier (see §10). Global: 100 req/min per IP. |
| **CORS** | Strict: app domain + admin subdomain only |
| **Input Validation** | Pydantic models on all API inputs |
| **SQL Injection** | SQLAlchemy ORM (parameterized queries) |
| **XSS** | CSP headers. Jinja2 auto-escaping for admin dashboard. |
| **File Upload** | Max 5MB per image. MIME type validation. No executable uploads. Image-only (JPEG, PNG, WebP). |
| **AI Abuse** | Hidden soft rate limits per tier (shown as "Unlimited"). Input sanitization (strip prompt injection attempts from AI script input). Max input/output token limits enforced per tier. |
| **Secret Management** | All secrets (Groq API key, DB URL, R2 credentials, JWT secret) in HuggingFace Space environment variables. Never in code. |

### 14.4 Client-Side Security (PWA)
- **No sensitive data in localStorage** — Only JWT token (short-lived) + user preferences + project drafts (non-sensitive)
- **User images never leave device** for image templates (client-side rendering)
- **No service worker caching of user data** — Only template assets and app shell cached
- **CSP headers** prevent inline script injection

---

## 15. MVP Scope (Must-Have Features)

| # | Feature | Priority | Why |
| :--- | :--- | :--- | :--- |
| 1 | Template browser with category filters | 🔴 P0 | Core discovery UX. Users must find templates fast. |
| 2 | Template fill screen (text + image input slots) | 🔴 P0 | The entire product experience. Without this, nothing works. |
| 3 | Client-side image rendering (Canvas API / Fabric.js) | 🔴 P0 | Core output. Users must get a downloadable image. |
| 4 | Admin dashboard with template manager (CRUD) | 🔴 P0 | Without templates, the app is empty. |
| 5 | Admin template editor (Fabric.js — image templates only) | 🔴 P0 | Admin must be able to create templates visually. |
| 6 | Input slot definition in editor (text, image, select, date) | 🔴 P0 | Templates must define what users fill in. |
| 7 | 20 launch templates (5 per category × 4 categories) | 🔴 P0 | Minimum content for a credible launch. |
| 8 | User auth (Google OAuth + email/password) | 🔴 P0 | Gated features (AI, projects, plan management). |
| 9 | Export to gallery / share sheet | 🔴 P0 | The final output action. Must work flawlessly. |
| 10 | Client-side error/crash reporting (`POST /api/errors/log`) | 🟠 P1 | Production visibility — know when things break before users complain via Play Store reviews. |
| 11 | AI Script Writer (Groq/Mistral API) | 🟠 P1 | Key differentiator. "Wow" feature. |
| 12 | AI Voice Generation (Edge TTS) | 🟠 P1 | Key differentiator. Massive appeal for news creators. |
| 13 | Video template support (scenes + client-side FFmpeg.wasm rendering) | 🟠 P1 | What makes NewsForge special. Zero server cost. |
| 14 | User project save/load | 🟠 P1 | "Edit & re-export" for similar news stories. |
| 15 | App version force-update check (`GET /api/app/config`) | 🟠 P1 | Ensure old app versions can be deprecated gracefully when breaking API changes ship. |
| 16 | Minimal offline graceful degradation (cached templates in IndexedDB + service worker app shell) | 🟠 P1 | Indian users have spotty connectivity. Show cached templates when offline. |
| 17 | Play Store listing (Capacitor Android build) | 🟠 P1 | Primary distribution channel. |
| 17b | OTA template sync (no Play Store update for new templates) | 🟠 P1 | Critical for content velocity. Admin publishes → app shows instantly. |
| 18 | Multiple output sizes per template | 🟡 P2 | Convenience feature. Single template → multiple formats. |
| 19 | Scene timeline in admin editor (video) | 🟡 P2 | Needed for video templates but can use JSON-first approach initially. |
| 20 | Admin analytics dashboard | 🟡 P2 | Important but not launch-blocking. |

### Features Explicitly CUT from MVP

| Feature | Reason | Target Version |
| :--- | :--- | :--- |
| **Payment integration** | v1 launches as completely free app. No Google Play Billing, Razorpay, or Stripe. Google Play Billing is mandatory for in-app digital purchases on Android; Razorpay/Stripe for PWA web payments only. Add once product-market fit is validated. | v1.1 |
| **Free/Premium template tiers** | No payment = no premium tier. All templates free in v1. Premium badges, gating, and pricing enforcement added with payments. | v1.1 |
| **Rate limiting per plan tier** | No tiers in v1 = no rate limiting needed. All AI features and exports are fully available with no restrictions. `daily_usage` table with atomic SQL upserts added with v1.1 payment tiers. | v1.1 |
| **Watermark on exports** | No free/premium distinction in v1. Template-level watermark system (admin-baked into Fabric.js canvas, removed client-side for paid users) added with v1.1 premium tiers. | v1.1 |
| iOS / App Store build | **Permanently deprioritized.** India = 95% Android. Apple Developer fee is $99/yr. Not worth it until significant revenue. | v3.0+ (if ever) |
| User-generated templates | Quality control nightmare. Admin-curated only. | v3.0 (if ever) |
| Real-time collaboration | Over-engineering for a solo creator tool. | Never |
| Video transitions/animations in admin editor | Extremely complex UI. Use JSON-defined presets first. | v1.1 |
| Custom fonts upload by users | Support burden + rendering complexity. Admin fonts only. | v2.0 |
| Offline mode (full) | Service worker complexity. Minimal offline (cached templates in IndexedDB, service worker for app shell) included in v1. Full offline with template pre-download and offline AI in v1.2. | v1.2 |
| Multi-language admin dashboard | Admin is us. English only. | v3.0 |
| AI image generation (text-to-image) | Requires GPU. Doesn't run on HF free CPU tier. | v2.0 (when revenue supports GPU) |
| Server-side video rendering | Video rendering moved to client-side (FFmpeg.wasm). No server rendering planned. | Never |

---

## 16. Post-MVP Roadmap

| # | Feature | Target Release | Revenue Impact |
| :--- | :--- | :--- | :--- |
| 1 | Payment integration (Razorpay for India, Stripe for global) | v1.1 (Week 6) | Enables monetization. |
| 2 | Video template animation editor (timeline + keyframes in admin) | v1.1 (Week 6) | Richer video templates = higher perceived value. |
| 3 | 50 additional templates (total: 70) | v1.1 (Week 6) | More content = more engagement. |
| 4 | Offline mode (cached templates + client-side rendering) | v1.2 (Week 8) | Critical for Indian users with spotty connectivity. |
| 6 | Multi-language UI (Hindi, Tamil, Telugu, Bengali) | v1.2 (Week 8) | 3× addressable market in India. |
| 7 | Background music library (royalty-free tracks) | v1.3 (Week 10) | Enhanced video templates. |
| 8 | AI voice cloning (user's voice model) | v2.0 (Month 3) | Premium "Newsroom" tier differentiator. Requires GPU. |
| 9 | AI image generation (background/photo from prompt) | v2.0 (Month 3) | Eliminate need for photo uploads. Requires GPU. |
| 10 | White-label / API for organizations | v3.0 (Month 6) | B2B revenue stream. |
| 11 | Template marketplace (designer-contributed templates) | v3.0 (Month 6) | Scale content without admin bottleneck. |
| 12 | Auto-subtitle generation | v2.0 (Month 3) | Accessibility + engagement boost. |

---

## 17. What to Strictly Avoid (Anti-Patterns)

| # | Anti-Pattern | Why |
| :--- | :--- | :--- |
| 1 | **Don't build a video editor.** | We are a template filler, not a timeline editor. Users should NEVER see a canvas, timeline, or layer panel. The moment they do, we've failed. |
| 2 | **Don't let users create templates.** | User-generated templates = quality collapse. Admin curation is our moat. |
| 3 | **Don't store user media on the server.** | Storage costs will explode. Client-side rendering for images. Ephemeral server processing for video. |
| 4 | **Don't add social features.** | No comments, no likes, no follows, no feeds. We're a tool, not a social network. |
| 5 | **Don't compete with Canva on breadth.** | We don't do resumes, presentations, or birthday cards. We do NEWS. That focus is our advantage. |
| 6 | **Don't make the admin editor user-facing.** | The complexity of Fabric.js editor is for admins only. Users see forms, not canvases. |
| 7 | **Don't cache generated media.** | Voice audio, rendered videos, exported images — all ephemeral. Generate → Stream → Delete. |
| 8 | **Don't build for iOS first.** | India = 95% Android. Ship Android (PWA + Capacitor), validate, then iOS. |
| 9 | **Don't add ads to free tier.** | Ads degrade the "premium" perception. Watermark + feature limits are sufficient monetization pressure. |
| 10 | **Don't persist user images in any database.** | Privacy concern + storage concern. User images are composited client-side and never uploaded (for image templates). For video, they're processed ephemerally and deleted within seconds. |

---

## 18. Success Metrics & Milestones

### 18.1 Launch Milestones

| Milestone | Target | Timeline |
| :--- | :--- | :--- |
| MVP complete (all P0 + P1 features) | Working app + admin dashboard | Week 4 |
| 20 launch templates designed | 5 per category × 4 categories | Week 4 |
| Play Store listing live | Published + indexed | Week 5 |
| First 100 installs | Organic (ASO + social) | Week 6 |
| Payment integration live | Razorpay + Stripe | Week 6 |
| First 500 installs | | Week 8 |
| First paying user | ₹299 Pro subscription | Week 7 |
| 1,000 installs | | Week 10 |
| ₹10,000 MRR (~$120) | ~33 Pro users | Month 3 |
| ₹50,000 MRR (~$600) | ~167 Pro users | Month 6 |

### 18.2 North Star Metric
**Daily exports (image + video combined).**

This metric captures real product usage. If users are exporting content, they're getting value. It correlates with retention, willingness to pay, and viral distribution (via watermarks).

### 18.3 Key Health Metrics

| Metric | Target | Why |
| :--- | :--- | :--- |
| Time to first export (onboarding) | < 90 seconds | Speed = activation. Users must feel the "aha" instantly. |
| Day 1 retention | > 40% | Measures if users come back after first use. |
| Day 7 retention | > 20% | Measures sticky engagement. |
| Daily exports per active user | > 2 | Power users create volume content. |
| Free → Pro conversion | > 3% | Healthy for mobile freemium. |
| AI Voice usage rate | > 30% of exports | Measures AI feature adoption. |
| AI Script usage rate | > 20% of exports | Measures AI feature adoption. |
| Play Store rating | > 4.2 stars | Drives organic installs via ASO. |
| Watermark-driven installs | > 15% of total | Viral loop is working. |

---

## 19. Risk Register & Mitigations

| # | Risk | Severity | Mitigation |
| :--- | :--- | :--- | :--- |
| 1 | **Edge TTS service disruption** (Microsoft blocks access) | 🔴 Critical | **Fallback 1:** Piper TTS (open-source, self-hosted on HF Space). **Fallback 2:** Google Cloud TTS free tier (4M chars/month). **Monitoring:** Daily automated test generation. Alert on failure. |
| 2 | **Client-side video rendering too slow on low-end devices** | 🟠 High | FFmpeg.wasm requires SharedArrayBuffer and 3GB+ RAM. Target Android 10+ (API 29+). If OOM, show graceful fallback: "Video export not supported on this device. Try image templates." Consider reducing FPS to 24 or resolution to 480p for low-end. |
| 3 | **Play Store rejection** | 🟠 High | Follow all Play Store policies. No misleading screenshots. Privacy policy URL. Content rating questionnaire. Test on multiple devices before submission. Budget 2 submission attempts. |
| 4 | **Template creation bottleneck** (admin = solo founder designing all templates) | 🟠 High | **Phase 1:** Founder designs 20 launch templates. **Phase 2:** Hire freelance designers on Fiverr ($5–$15/template). **Phase 3 (v3.0):** Open template marketplace for community designers. |
| 5 | **Low retention due to limited free templates** | 🟠 High | Launch with 20 diverse templates. Add 5 new templates/week via OTA sync. Rotate "template of the week" as free preview of premium templates. |
| 6 | **Fabric.js editor complexity** (building a Figma-like editor is hard) | 🟠 High | **MVP simplification:** Start with basic positioning, text editing, image placement. No animations in editor v1 — define animations as JSON presets. **Phase 2:** Add timeline and animation UI. |
| 7 | **Groq API rate limits** (14,400 RPD on free tier) | 🟡 Low | Very generous free tier. Hidden per-user rate limits keep usage well within global quota. At scale, upgrade to paid Groq ($0.24/1M tokens — very cheap). Monitor daily usage via ai_usage_log. |
| 8 | **Cloudflare R2 approaching 10GB** | 🟡 Medium | Monitor usage. Optimize template assets (WebP compression, font subsetting). R2 paid tier is extremely cheap ($0.015/GB/month) — upgrade when revenue supports it. |
| 9 | **NeonDB 0.5GB limit** | 🟡 Medium | Activity log cleanup (**60-day** rolling). Project cleanup for deleted users. Monitor with scheduled query. NeonDB paid tier is $19/mo — upgrade at ₹10K MRR. |
| 10 | **Feature creep / scope fatigue** | 🟡 Medium | Strict MVP scope list (§15). No user template creation. No social features. No video editor timeline for users. Review scope weekly: "Am I building what's on the list?" |
| 11 | **FFmpeg.wasm WASM binary size (~25MB)** | 🟡 Medium | Lazy-load only when user first attempts video export. Cache in service worker for subsequent uses. Show download progress bar on first load. |

---

## 20. App Store Requirements

### 20.1 Google Play Store (Primary & Only Distribution)

**App Listing:**
- **Title:** NewsForge — News Maker & Video Creator
- **Short Description:** Create professional news graphics & videos in 60 seconds. No editing skills needed. Unlimited AI voice & script.
- **Category:** Video Players & Editors (or News & Magazines)
- **Content Rating:** Everyone
- **Price:** Free (with in-app purchases)

**Technical Requirements:**
- compileSdkVersion / targetSdkVersion: 34 (Android 14 — required by Google Play for new apps since Aug 2024)
- minSdkVersion: 29 (Android 10 — required for SharedArrayBuffer / FFmpeg.wasm + COOP/COEP headers)
- Supported range: Android 10–14+ (API 29–34) — covers ~92% of Indian Android devices
- Testing targets: Budget (2GB RAM, Snapdragon 450), Mid-range (4GB, SD 680), Flagship (8GB, SD 8 Gen 2)
- Capacitor generates signed APK/AAB
- App size target: < 10MB (PWA shell + Capacitor). FFmpeg.wasm (~25MB) loaded lazily on first video export.
- Privacy policy URL: Required
- Data safety section: Declare data collection (email, usage analytics)

**Screenshots (5 required):**
1. Template browser with category pills
2. Fill screen with live preview (Breaking News template)
3. AI Voice generation screen with voice selector
4. AI Script writer with generated output
5. Export screen with format options

**In-App Purchase:**
- Subscription: Pro (₹299/mo), Newsroom (₹799/mo)
- Google Play Billing Library via Capacitor plugin
- 30% Google commission factored into pricing

**OTA Template Updates (No Play Store Update Required):**
- Templates are fetched from the API, not bundled in the APK
- When admin publishes/updates/archives a template, changes appear in-app within minutes
- Client calls `GET /api/templates/sync?since_timestamp=...` on app launch + every 30 min
- Template JSON + asset URLs cached in IndexedDB. Only delta changes downloaded.
- **Users never need a Play Store update to get new templates, categories, or template fixes.**
- Play Store updates are reserved for: app shell changes, new features, Capacitor plugin updates, FFmpeg.wasm version bumps.

### 20.2 iOS — Not Planned
- **No iOS build.** India is 95% Android. Apple Developer Program costs $99/year.
- Revisit only if revenue exceeds ₹50,000 MRR and there's organic iOS demand.

### 20.3 PWA (Web — Secondary)
- Available as a web fallback (no install needed)
- Same feature set as Play Store version
- Install prompt (Add to Home Screen) for returning users
- Service worker for app shell caching (templates cached on first load)

---

## 21. Compliance, Privacy & Data Retention

### 21.1 Data We Store vs. Data We Don't

| We Store | We Do NOT Store |
| :--- | :--- |
| User email + name | User photos/images (client-side only) |
| Plan/subscription status | Generated voice audio files |
| Template definitions (admin-created) | Rendered video files |
| User project metadata (template + slot values) | AI-generated scripts (client-side only) |
| AI usage counts (not content) | User browsing history or device fingerprint |
| Activity logs (event type + IDs, no PII) | IP addresses |
| Payment references (external IDs, no card data) | Credit card numbers |
| Encrypted API keys (R2, Groq — env vars) | Raw template canvas in user's browser |

### 21.2 GDPR / India DPDP Act Compliance

| Right | Implementation |
| :--- | :--- |
| Right to Access | "My Data" section in Profile — shows all stored data |
| Right to Deletion | "Delete My Account" button → immediate hard delete of ALL records |
| Right to Portability | `GET /api/account/export` — JSON dump of all user data |
| Right to Correction | Users can edit name/email in settings |
| Right to Withdraw Consent | Unsubscribe from any emails. Delete account at any time. |

### 21.3 Cookie & Tracking Policy
- **No third-party tracking.** No Google Analytics, no Facebook Pixel, no ad SDKs.
- **Essential storage only:** JWT in localStorage. Template cache in service worker cache.
- **First-party analytics only:** Custom event logging to our own `activity_log` table.
- **No cookie banner needed** (no cookies used — JWT in localStorage, not cookies).

### 21.4 Data Retention

| Scenario | Action | Timeline |
| :--- | :--- | :--- |
| Active user | Data retained | Indefinite |
| Inactive user (no login for 12 months) | Send reactivation email → if no response in 30 days, delete | 13 months total |
| User clicks "Delete My Account" | **Immediate hard delete** — all projects, logs, usage records | Instant |
| Cancelled subscription | Downgrade to free tier. Data retained. | Indefinite |
| Activity/usage logs | Rolling cleanup | **60 days** |

---

## 22. Changelog

| Version | Date | Changes |
| :--- | :--- | :--- |
| **v1** | 2026-06-23 | Initial PRD. Template-based news content creation app with admin dashboard, Fabric.js template editor, AI voice (Edge TTS), AI script (Gemini), client-side image rendering, server-side video rendering (FFmpeg), PWA + Capacitor architecture, Cloudflare R2 for assets, NeonDB for metadata. 22-section comprehensive specification. |
| **v2** | 2026-06-23 | **Major tweaks:** (1) Video rendering moved to 100% client-side via FFmpeg.wasm — server is now stress-free, no FFmpeg on backend. (2) AI Script Writer switched from Gemini to **Groq API (Mistral model)** with explicit input/output token limits per tier. (3) **OTA template sync** — new templates appear in-app without Play Store update via `/api/templates/sync` endpoint. (4) **Android-only** — iOS permanently deprioritized. (5) Log retention reduced from 90 to **60 days**. (6) **"Unlimited" pricing display** with hidden soft rate limits — improves Play Store conversion while catching power users for upsell. (7) Consolidated to **single HuggingFace Space** (API + Voice only, no media processing). |
| **v3** | 2026-06-24 | **Production audit fixes (22 issues resolved):** (1) **v1 launches completely free** — no payment integration, no premium tiers, no rate limiting, no watermarks; all deferred to v1.1. (2) **JWT security hardened** — HttpOnly cookies for PWA, `@capacitor/preferences` for Android, 1-hour access tokens with refresh token rotation. (3) **Firebase Auth clarified** — used only for Google OAuth handshake on client; backend uses single custom JWT format. (4) **Admin auth isolated** — separate JWT signing secret from user auth (`ADMIN_JWT_SECRET` vs `USER_JWT_SECRET`). (5) **SharedArrayBuffer COOP/COEP** — documented header requirements for FFmpeg.wasm in Capacitor WebView + Cloudflare R2 Transform Rules. (6) **Template schema versioned** — added `schema_version` and `fabric_version` fields to template JSON. (7) **`slot_values` fixed** — no base64 image data in DB; text/select/date values only; users re-upload images on re-edit. (8) **Template API optimized** — list endpoint returns metadata+thumbnails only (no `canvas_data`), detail endpoint lazy-loads full JSON; paginated 20/page. (9) **Error reporting added** — `POST /api/errors/log` for client-side JS errors and FFmpeg.wasm crash reporting. (10) **App version check** — `GET /api/app/config` for force-update dialog and maintenance mode. (11) **Minimal offline degradation** — service worker for app shell + cached templates in IndexedDB for spotty connectivity. (12) **Edge TTS health monitoring** — APScheduler hourly health check with auto-fallback to Piper TTS after 3 consecutive failures. (13) **`daily_metrics_snapshot` table** — aggregated metrics retained indefinitely, solving data loss from 60-day activity log cleanup. (14) **Target/Min SDK clarified** — targetSdkVersion=34, minSdkVersion=29 with testing device tiers documented. (15) **Google Play Billing** — clarified as mandatory for Android in-app digital purchases (v1.1+); Razorpay/Stripe for PWA web only. (16) **`daily_usage` table** (v1.1+) — date-keyed atomic rate limiting replacing fragile `exports_today` columns; no cron reset needed. (17) **Subscriptions table updated** — added `google_play` provider, `product_id`, `auto_renewing` fields. |

---

*This document is the single source of truth for NewsForge's product direction. All design, engineering, marketing, security, and compliance decisions should reference this PRD. Last updated: 2026-06-23 (v2).*
