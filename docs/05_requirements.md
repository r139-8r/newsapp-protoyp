# NewsForge — Product Requirements & Scope

**Agent Assignment:** 📋 **Requirements / Product Agent**
**Source:** Extracted from [newsforge_prd.md](file:///f:/newsapp/newsforge_prd.md) §1 (Vision), §2 (Audience), §3 (Competition), §4 (Pricing), §5 (Marketing), §15 (MVP Scope), §16 (Roadmap), §18 (Metrics), §20 (App Store), §22 (Changelog)
**Scope:** Product vision, audience, competitive positioning, pricing strategy, marketing, MVP feature list, roadmap, success metrics, and app store requirements.
**Last Updated:** 2026-06-24

---

## 1. Product Vision

**One-Liner:** NewsForge lets anyone create professional, broadcast-quality news graphics and videos in under 60 seconds — no editing skills, no design tools, just pick a template, fill in the blanks, and export.

**Emotional Pitch:**
> "You don't need a newsroom, a design team, or a video editor. You just need a story. NewsForge turns your headline into a broadcast-ready news graphic or video — complete with AI voiceover and a professional script — in the time it takes to write a tweet."

**What We Sell:** Speed, credibility, professional output, and the death of the learning curve.

**Product Category:** A **Template-Driven News Content Factory** — a two-sided system where admins design premium templates via a web-based editor, and end-users consume those templates on mobile to produce news content instantly.

### Why "NewsForge" and Not "Another Canva"
1. **News-specific** — Every template is purpose-built for news content. Canva has 10,000 templates; we have 50 that are *perfect* for news.
2. **Zero-skill rendering** — Users never touch a timeline or drag layers. They type a headline, upload a photo, tap "Generate Voice", and export.
3. **Admin-curated quality** — Templates are designed by the admin with strict input constraints. Not user-generated chaos.
4. **AI-native** — Voice generation and script writing are first-class features, not afterthoughts.
5. **OTA template delivery** — Admin publishes a new template → it appears in users' apps within minutes. No Play Store update needed.

---

## 2. Core Audience & Pain Points

### 2.1 Primary Personas

| Persona | Description | Size Estimate |
| :--- | :--- | :--- |
| **The YouTube/Instagram News Creator** | Runs a news channel. Needs 3–5 stories/day. Currently uses CapCut/InShot (20–40 min/video). | ~5M creators globally |
| **The WhatsApp News Channel Operator** | Runs a WhatsApp Channel broadcasting local news. Needs eye-catching graphics fast. | ~10M+ in India alone |
| **The Local/Citizen Journalist** | Covers hyperlocal news. Not tech-savvy. Needs professional output to build credibility. | ~2M in India, growing |
| **The Social Media News Page Admin** | Manages Facebook/Twitter/Instagram news page. Posts 10–20 items/day. Speed is everything. | ~3M globally |

### 2.2 Deprioritized Persona

| Persona | Why Deprioritized |
| :--- | :--- |
| **Professional News Organizations** | Won't switch to mobile-first. Different budget/workflow. Target in v3+ with white-label/API. |

### 2.3 Validated Pain Points

| Pain Point | Severity |
| :--- | :--- |
| **Design Skill Barrier** — Creating professional graphics requires Photoshop/After Effects/hours in Canva | 🔴 Critical |
| **Speed vs Quality Tradeoff** — 30 min editing a 15-second reel = missing the story window | 🔴 Critical |
| **Credibility Gap** — Poor graphics make creators look amateur | 🟠 High |
| **Voice & Script Burden** — Recording voiceovers requires quiet space, good mic, scripting skills | 🟠 High |
| **Template Fatigue** — Generic apps have thousands of templates, finding news-specific ones is needle-in-haystack | 🟡 Medium |
| **Vernacular Content Gap** — Most design tools default to English; Indian regional language support is afterthought | 🟡 Medium |

### 2.4 The "Aha" Moment
The instant a user picks a "Breaking News" template, types their headline, uploads one photo, taps "Generate Voice" and hears a professional AI anchor reading their story over an animated graphic — and exports the whole thing in under 60 seconds. **That's the moment they stop using CapCut.**

---

## 3. Competitive Positioning

### 3.1 Competitor Matrix

| Competitor | Price | News-Specific | AI Voice | AI Script | No Editing Skill | Admin Editor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Canva** | $0–$15/mo | ❌ Generic | ❌ | ❌ | ❌ Drag-and-drop | ❌ |
| **CapCut** | Free | ❌ Generic | ❌ | ❌ | ❌ Timeline | ❌ |
| **InVideo** | $15–$30/mo | ❌ Generic | ✅ | ✅ | ❌ Editor UI | ❌ |
| **FlexClip** | $0–$20/mo | ✅ Partial | ✅ | ✅ | ❌ Editor required | ❌ |
| **HeyGen** | $24–$60/mo | ❌ Generic | ✅ AI Avatar | ✅ | ✅ | ❌ |
| **News Maker Apps** | Free+Ads | ✅ | ❌ | ❌ | ✅ | ❌ |
| **NewsForge (Us)** | Freemium | ✅ Purpose-built | ✅ | ✅ | ✅ | ✅ |

### 3.2 Our Unfair Advantages
1. **News-specific template curation** — every template for a specific news format
2. **Admin-controlled template pipeline** — quality guaranteed by admin, not crowd-sourced
3. **AI voice + AI script as first-class features** — built into the core flow
4. **Fill-in-the-blank UX** — users never see a canvas, timeline, or layer panel
5. **India-first + Vernacular** — multi-language support, Indian regional fonts, lightweight APK
6. **₹0 operation** — Edge TTS, Groq free tier, Cloudflare R2. Generous free tier undercuts competitors.
7. **100% client-side rendering** — zero server GPU/CPU cost
8. **OTA template sync** — new templates appear in-app instantly

### 3.3 Commodity Features (Easy to Copy)
- Basic news graphic templates with text overlays
- Social media format presets (9:16, 16:9, 1:1)
- PNG/JPG export
- Basic text input forms

### 3.4 Features That Create Defensibility
- **Admin template editor** — Fabric.js visual editor with input-slot definitions
- **AI voice pipeline** — Edge TTS integration into the export flow
- **Template-to-video rendering pipeline** — client-side FFmpeg.wasm composition
- **Admin-designed template library** — growing library of premium templates

---

## 4. Pricing Strategy

### 4.1 v1 Launch: COMPLETELY FREE
> **v1 launches as a completely free app** with no payment integration, no premium tiers, no rate limits, and no watermarks. All templates are free, all features fully available with no restrictions.

### 4.2 Planned Tiers (v1.1+ — Post Product-Market Fit)

| | **Free** | **Pro** ★ Recommended | **Newsroom** |
| :--- | :--- | :--- | :--- |
| **Monthly** | ₹0 | ₹299/mo (~$3.50) | ₹799/mo (~$9.50) |
| **Annual** | ₹0 | ₹199/mo (billed ₹2,388/yr) | ₹549/mo (billed ₹6,588/yr) |
| Templates | Free templates only | All templates | All + early access |
| AI Voice | Standard voices | Standard + premium voices | All voices + SSML |
| Video Templates | ❌ Image only | ✅ Image + Video | ✅ Image + Video + Custom |
| Watermark | "Made with NewsForge" | No watermark | No watermark |
| Export Quality | 720p | 1080p | 1080p + 4K |
| Custom Branding | ❌ | ✅ Add your logo | ✅ Full white-label |
| Offline Mode | ❌ | ✅ Cached templates | ✅ Full offline |

### 4.3 Pricing Psychology
- ₹299 anchored against ₹799 — Pro feels like the obvious deal
- "Unlimited" labeling on free tier — removes download friction, catches power users
- India-first pricing — ₹299/mo affordable for Indian creators
- No free tier for video — video templates are the premium upsell
- Annual discount (~33%) — strong incentive for commitment

---

## 5. Marketing Strategy (₹0 Budget)

### 5.1 Play Store ASO (Primary Acquisition)
| Action | Expected Impact |
| :--- | :--- |
| Target keywords: "news maker", "breaking news creator", "news video maker" | 50% of early installs |
| 5 high-res screenshots showing the workflow | Conversion rate optimization |
| Short demo video (15s) | Install conversion +30% |
| Vernacular descriptions (Hindi, Tamil, Telugu, Bengali) | 3× addressable market |

### 5.2 Content & SEO (5 Bridge Articles)
1. "How to Create Professional News Graphics on Your Phone"
2. "Best Free AI Voice Generator for News Videos in 2026"
3. "How to Start a YouTube News Channel with Zero Budget"
4. "Breaking News Banner Maker: Free Templates for Instagram & WhatsApp"
5. "AI News Script Writer: Generate Broadcast-Ready Scripts in Seconds"

### 5.3 Social Media & Community
- YouTube Shorts/Instagram Reels: "Before vs After" content, 3 posts/week
- Twitter/X: Build-in-public, weekly milestones
- Reddit: r/journalism, r/ContentCreators, r/YouTubers
- WhatsApp Groups: Indian journalist/blogger groups

### 5.4 Watermark Virality Loop
```
User creates news graphic → Shares on Instagram/WhatsApp/YouTube
    → Viewers see "Made with NewsForge" watermark
    → Curious viewers search Play Store
    → New installs → New content with watermark
    → Viral loop continues
```

### 5.5 Template Trojan Horse
Exclusive, high-quality templates only available in NewsForge → drives installs via creator envy.

---

## 6. MVP Scope (Must-Have Features)

### 6.1 P0 — Launch Blockers

| # | Feature | Why |
| :--- | :--- | :--- |
| 1 | Template browser with category filters | Core discovery UX |
| 2 | Template fill screen (text + image input slots) | The entire product experience |
| 3 | Client-side image rendering (Canvas API / Fabric.js) | Core output |
| 4 | Admin dashboard with template manager (CRUD) | Without templates, app is empty |
| 5 | Admin template editor (Fabric.js — image templates only) | Admin must create templates visually |
| 6 | Input slot definition in editor (text, image, select, date) | Templates must define what users fill in |
| 7 | 20 launch templates (5 per category × 4 categories) | Minimum content for credible launch |
| 8 | User auth (Google OAuth + email/password) | Gated features |
| 9 | Export to gallery / share sheet | Final output action |

### 6.2 P1 — Important for Launch

| # | Feature | Why |
| :--- | :--- | :--- |
| 10 | Client-side error/crash reporting | Production visibility |
| 11 | AI Script Writer (Groq/Mistral) | Key differentiator |
| 12 | AI Voice Generation (Edge TTS) | Massive appeal for news creators |
| 13 | Video template support (scenes + FFmpeg.wasm) | What makes NewsForge special |
| 14 | User project save/load | "Edit & re-export" |
| 15 | App version force-update check | Deprecate old versions |
| 16 | Minimal offline (cached templates + service worker) | Indian users have spotty connectivity |
| 17 | Play Store listing (Capacitor Android build) | Primary distribution |
| 17b | OTA template sync | Critical for content velocity |

### 6.3 P2 — Nice to Have

| # | Feature | Why |
| :--- | :--- | :--- |
| 18 | Multiple output sizes per template | Convenience |
| 19 | Scene timeline in admin editor (video) | Needed for video but can use JSON-first initially |
| 20 | Admin analytics dashboard | Important but not launch-blocking |

### 6.4 Features Explicitly CUT from MVP

| Feature | Target Version |
| :--- | :--- |
| Payment integration | v1.1 |
| Free/Premium template tiers | v1.1 |
| Rate limiting per plan tier | v1.1 |
| Watermark on exports | v1.1 |
| iOS / App Store build | v3.0+ (if ever) |
| User-generated templates | v3.0 (if ever) |
| Real-time collaboration | Never |
| Video transitions/animations in admin editor | v1.1 |
| Custom fonts upload by users | v2.0 |
| Full offline mode | v1.2 |
| Multi-language admin dashboard | v3.0 |
| AI image generation (text-to-image) | v2.0 |
| Server-side video rendering | Never |

---

## 7. Post-MVP Roadmap

| # | Feature | Target Release | Revenue Impact |
| :--- | :--- | :--- | :--- |
| 1 | Payment integration (Razorpay + Stripe) | v1.1 (Week 6) | Enables monetization |
| 2 | Video animation editor (timeline + keyframes) | v1.1 (Week 6) | Richer video templates |
| 3 | 50 additional templates (total: 70) | v1.1 (Week 6) | More content = engagement |
| 4 | Offline mode (cached templates + client rendering) | v1.2 (Week 8) | Critical for Indian users |
| 6 | Multi-language UI (Hindi, Tamil, Telugu, Bengali) | v1.2 (Week 8) | 3× addressable market |
| 7 | Background music library | v1.3 (Week 10) | Enhanced video templates |
| 8 | AI voice cloning | v2.0 (Month 3) | Premium tier differentiator |
| 9 | AI image generation | v2.0 (Month 3) | Eliminate photo uploads |
| 10 | White-label / API for organizations | v3.0 (Month 6) | B2B revenue stream |
| 11 | Template marketplace (designer-contributed) | v3.0 (Month 6) | Scale content |
| 12 | Auto-subtitle generation | v2.0 (Month 3) | Accessibility boost |

---

## 8. Success Metrics

### 8.1 Launch Milestones

| Milestone | Target | Timeline |
| :--- | :--- | :--- |
| MVP complete (P0 + P1 features) | Working app + admin dashboard | Week 4 |
| 20 launch templates designed | 5 per category × 4 categories | Week 4 |
| Play Store listing live | Published + indexed | Week 5 |
| First 100 installs | Organic (ASO + social) | Week 6 |
| Payment integration live | Razorpay + Stripe | Week 6 |
| First 500 installs | | Week 8 |
| First paying user | ₹299 Pro subscription | Week 7 |
| 1,000 installs | | Week 10 |
| ₹10,000 MRR (~$120) | ~33 Pro users | Month 3 |
| ₹50,000 MRR (~$600) | ~167 Pro users | Month 6 |

### 8.2 North Star Metric
**Daily exports (image + video combined).** Captures real product usage, correlates with retention, willingness to pay, and viral distribution via watermarks.

### 8.3 Key Health Metrics

| Metric | Target | Why |
| :--- | :--- | :--- |
| Time to first export | < 90 seconds | Speed = activation |
| Day 1 retention | > 40% | Measures comeback after first use |
| Day 7 retention | > 20% | Measures sticky engagement |
| Daily exports per active user | > 2 | Power users create volume |
| Free → Pro conversion | > 3% | Healthy for mobile freemium |
| AI Voice usage rate | > 30% of exports | AI feature adoption |
| AI Script usage rate | > 20% of exports | AI feature adoption |
| Play Store rating | > 4.2 stars | Drives organic installs |
| Watermark-driven installs | > 15% of total | Viral loop working |

---

## 9. App Store Requirements

### 9.1 Google Play Store Listing

- **Title:** NewsForge — News Maker & Video Creator
- **Short Description:** Create professional news graphics & videos in 60 seconds. No editing skills needed. Unlimited AI voice & script.
- **Category:** Video Players & Editors (or News & Magazines)
- **Content Rating:** Everyone
- **Price:** Free (with in-app purchases in v1.1+)

### 9.2 Screenshots (5 Required)
1. Template browser with category pills
2. Fill screen with live preview (Breaking News template)
3. AI Voice generation screen with voice selector
4. AI Script writer with generated output
5. Export screen with format options

### 9.3 iOS — Not Planned
**No iOS build.** India is 95% Android. Apple Developer Program costs $99/year. Revisit only if revenue exceeds ₹50,000 MRR.

### 9.4 PWA (Web — Secondary)
- Available as web fallback (no install needed)
- Same feature set as Play Store version
- Install prompt (Add to Home Screen) for returning users

---

## 10. Changelog

| Version | Date | Key Changes |
| :--- | :--- | :--- |
| **v1** | 2026-06-23 | Initial PRD. Template-based news app + admin dashboard. Fabric.js editor. AI voice (Edge TTS) + AI script (Gemini). Client-side image rendering. |
| **v2** | 2026-06-23 | Video rendering → 100% client-side (FFmpeg.wasm). AI Script → Groq/Mistral. OTA template sync. Android-only. Single HuggingFace Space. |
| **v3** | 2026-06-24 | Production audit fixes (22 issues). v1 = completely free. JWT security hardened. Firebase Auth clarified. SharedArrayBuffer documented. Template schema versioned. |

---

*This document defines the product requirements, scope, and strategic direction for NewsForge. The Requirements/Product Agent should reference this for all feature prioritization, roadmap, and business decisions.*
