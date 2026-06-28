# NewsForge — Rules, Constraints & Anti-Patterns

**Agent Assignment:** 🛡️ **Rules / Quality Agent**
**Source:** Extracted from [newsforge_prd.md](file:///f:/newsapp/newsforge_prd.md) §14 (Security), §17 (Anti-Patterns), §19 (Risks), §21 (Compliance), §4 (Pricing — Rate Limiting)
**Scope:** Security rules, coding anti-patterns, compliance requirements, rate limiting, risk mitigations, and quality guardrails every agent must follow.
**Last Updated:** 2026-06-24

---

## 1. Security Rules

### 1.1 Authentication Architecture

**User Authentication:**
- **Google OAuth flow:** Firebase Auth SDK (client-side only) handles Google OAuth → returns Firebase ID Token → client sends to `POST /auth/google` → backend verifies via `firebase-admin` SDK → backend issues its own custom JWT. **Firebase tokens are NEVER used for API authorization — only for the initial OAuth exchange.**
- **Email/password flow:** Standard bcrypt registration → `POST /auth/email/login` → backend issues custom JWT.
- **Single token format:** All API routes verify the same custom JWT format. No Firebase tokens on the backend.

**Token Storage (XSS Protection):**
- **PWA (browser):** Access token stored as `HttpOnly; Secure; SameSite=Strict` cookie — JavaScript cannot read it.
- **Capacitor (Android app):** Access token stored via `@capacitor/preferences` (Android SharedPreferences with encryption). Attached as `Authorization: Bearer` header with `X-Client-Type: capacitor` header.
- **Access token:** 1-hour expiry (short-lived to limit XSS exposure window).
- **Refresh token:** 30-day expiry, one-time use (rotation on each refresh). Stored in HttpOnly cookie path `/auth/refresh` (PWA) or Preferences (Capacitor).
- No magic links for users — standard login for a consumer app.

**Admin Dashboard Authentication:**
- Email + password only (no OAuth — smaller attack surface)
- bcrypt password hashing, JWT with 1-hour expiry
- **Separate JWT signing secret** from user JWT (`ADMIN_JWT_SECRET` vs `USER_JWT_SECRET`) — admin token cannot authenticate user endpoints and vice versa
- IP allowlisting (enabled by default, configurable)
- No public registration — admin accounts created by superadmin only

### 1.2 Multi-Tenant Data Isolation

> **MANDATORY RULE:** Every API query for user data MUST include a `user_id` filter.

```python
async def get_user_projects(user: User = Depends(get_current_user)):
    projects = await db.query(UserProject).filter(
        UserProject.user_id == user.id  # MANDATORY — never query without this
    ).all()
    return projects
```

- Users can **NEVER** access other users' projects or usage data
- Admin API is completely separate from user API (different auth, different middleware)
- Template data is public (read-only for all authenticated users) — no isolation needed

### 1.3 API Security Measures

| Measure | Implementation |
| :--- | :--- |
| **Rate Limiting** | Per-user: Based on plan tier. Global: 100 req/min per IP. |
| **CORS** | Strict: app domain + admin subdomain only |
| **Input Validation** | Pydantic models on all API inputs |
| **SQL Injection** | SQLAlchemy ORM (parameterized queries) |
| **XSS** | CSP headers. Jinja2 auto-escaping for admin dashboard. |
| **File Upload** | Max 5MB per image. MIME type validation. No executable uploads. Image-only (JPEG, PNG, WebP). |
| **AI Abuse** | Hidden soft rate limits per tier. Input sanitization (strip prompt injection attempts). Max input/output token limits enforced per tier. |
| **Secret Management** | All secrets in HuggingFace Space environment variables. Never in code. |

### 1.4 Client-Side Security (PWA)
- **No sensitive data in localStorage** — Only JWT token (short-lived) + user preferences + project drafts (non-sensitive)
- **User images never leave device** for image templates (client-side rendering)
- **No service worker caching of user data** — Only template assets and app shell cached
- **CSP headers** prevent inline script injection

---

## 2. Strict Anti-Patterns (NEVER Do These)

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
| 10 | **Don't persist user images in any database.** | Privacy concern + storage concern. User images are composited client-side and never uploaded. |

---

## 3. Rate Limiting Rules

### 3.1 v1 Launch: No Rate Limiting
> **v1 launches as a completely free app** with no payment integration, no premium tiers, no rate limits, and no watermarks. All templates are free, all features fully available.

### 3.2 v1.1+ Rate Limiting (Hidden — UI Shows "Unlimited")

**Export Limits:**
| Tier | Actual Hidden Limit/Day | UI Display |
| :--- | :--- | :--- |
| Free | 10 exports/day | "Unlimited" |
| Pro | 100/day | "Unlimited" |
| Newsroom | Genuinely unlimited | "Unlimited" |

**AI Voice Limits:**
| Tier | Actual Hidden Limit/Day | Concurrent Requests |
| :--- | :--- | :--- |
| Free | 5 (shown as "Unlimited") | 1 |
| Pro | 50 | 3 |
| Newsroom | 200 | 5 |

**AI Script Limits:**
| Tier | Actual Hidden Limit/Day | Max Input Tokens | Max Output Tokens |
| :--- | :--- | :--- | :--- |
| Free | 5 (shown as "Unlimited") | 200 | 150 |
| Pro | 50 | 500 | 400 |
| Newsroom | 200 | 1000 | 1000 |

**When limits are hit:**
> User sees a friendly message: *"You're on fire today! 🔥 Upgrade to Pro for uninterrupted access."*

**Why "Unlimited" labeling:**
> Showing "Unlimited" on the Play Store listing dramatically improves install conversion rate vs showing "5/day". The soft limit catches only power users — exactly the ones most likely to convert.

---

## 4. Risk Register & Mitigations

| # | Risk | Severity | Mitigation |
| :--- | :--- | :--- | :--- |
| 1 | **Edge TTS service disruption** | 🔴 Critical | Fallback 1: Piper TTS. Fallback 2: Google Cloud TTS free tier. Monitoring: Daily automated test + APScheduler hourly health check. |
| 2 | **Client-side video too slow on low-end devices** | 🟠 High | Target Android 10+ (API 29+), 3GB+ RAM. Graceful fallback message. Consider 480p / 24fps for low-end. |
| 3 | **Play Store rejection** | 🟠 High | Follow all Play Store policies. Privacy policy URL. Test on multiple devices. Budget 2 submission attempts. |
| 4 | **Template creation bottleneck** (solo founder) | 🟠 High | Phase 1: 20 launch templates. Phase 2: Fiverr freelancers. Phase 3: Template marketplace (v3.0). |
| 5 | **Low retention due to limited free templates** | 🟠 High | 20 launch templates + 5 new/week via OTA. "Template of the week" previews. |
| 6 | **Fabric.js editor complexity** | 🟠 High | MVP: basic positioning, text, image placement. No animations in editor v1. |
| 7 | **Groq API rate limits** (14,400 RPD) | 🟡 Low | Very generous. Hidden per-user limits. Paid upgrade at scale ($0.24/1M tokens). |
| 8 | **Cloudflare R2 approaching 10GB** | 🟡 Medium | WebP compression, font subsetting. R2 paid tier is $0.015/GB/month. |
| 9 | **NeonDB 0.5GB limit** | 🟡 Medium | 60-day log cleanup. Monitor with scheduled query. Upgrade at ₹10K MRR ($19/mo). |
| 10 | **Feature creep / scope fatigue** | 🟡 Medium | Strict MVP scope. Weekly review: "Am I building what's on the list?" |
| 11 | **FFmpeg.wasm binary size (~25MB)** | 🟡 Medium | Lazy-load on first video export. Cache in service worker. Show download progress bar. |

---

## 5. Compliance & Privacy Rules

### 5.1 GDPR / India DPDP Act Compliance

| Right | Implementation |
| :--- | :--- |
| Right to Access | "My Data" section in Profile — shows all stored data |
| Right to Deletion | "Delete My Account" button → immediate hard delete of ALL records |
| Right to Portability | `GET /api/account/export` — JSON dump of all user data |
| Right to Correction | Users can edit name/email in settings |
| Right to Withdraw Consent | Unsubscribe from emails. Delete account at any time. |

### 5.2 Cookie & Tracking Policy
- **No third-party tracking.** No Google Analytics, no Facebook Pixel, no ad SDKs.
- **Essential storage only:** JWT in localStorage. Template cache in service worker cache.
- **First-party analytics only:** Custom event logging to `activity_log` table.
- **No cookie banner needed** (no cookies used — JWT in localStorage, not cookies).

### 5.3 Data Retention Rules

| Scenario | Action | Timeline |
| :--- | :--- | :--- |
| Active user | Data retained | Indefinite |
| Inactive user (no login 12 months) | Reactivation email → if no response in 30 days, delete | 13 months total |
| User clicks "Delete My Account" | **Immediate hard delete** — all projects, logs, subscriptions | Instant |
| Cancelled subscription | Downgrade to free tier. Data retained. | Indefinite |
| Activity/usage logs | Rolling cleanup | **60 days** |

### 5.4 Data We Store vs. Do NOT Store

| We Store | We Do NOT Store |
| :--- | :--- |
| User email + name | User photos/images (client-side only) |
| Plan/subscription status | Generated voice audio files |
| Template definitions (admin-created) | Rendered video files |
| User project metadata (template + slot values) | AI-generated scripts (client-side only) |
| AI usage counts (not content) | User browsing history or device fingerprint |
| Activity logs (event type + IDs, no PII) | IP addresses |
| Payment references (external IDs, no card data) | Credit card numbers |

---

## 6. Play Store Compliance Rules

### 6.1 Technical Requirements
- `compileSdkVersion` / `targetSdkVersion`: **34** (Android 14)
- `minSdkVersion`: **29** (Android 10) — required for SharedArrayBuffer / FFmpeg.wasm
- Supported range: Android 10–14+ (API 29–34) — ~92% of Indian Android devices
- Testing targets: Budget (2GB RAM, SD 450), Mid-range (4GB, SD 680), Flagship (8GB, SD 8 Gen 2)
- App size target: < 10MB (PWA shell + Capacitor). FFmpeg.wasm loaded lazily.
- Privacy policy URL: **Required**
- Data safety section: Declare email + usage analytics collection

### 6.2 In-App Purchase Rules (v1.1+)
- **Google Play Billing** is **mandatory** for in-app digital purchases on Android
- Razorpay/Stripe for PWA web payments only
- 30% Google commission factored into pricing

---

## 7. Coding Standards & Quality Gates

### 7.1 Backend (Python / FastAPI)
- All API inputs validated with **Pydantic models** — no raw dict access
- All database queries use **SQLAlchemy ORM** — no raw SQL strings
- All secrets via **environment variables** — never hardcoded
- All user-scoped queries **MUST include user_id filter**
- All file uploads: max 5MB, MIME type validation, image-only

### 7.2 Frontend (Vanilla JS / PWA)
- No sensitive data in localStorage (only short-lived JWT + preferences)
- CSP headers on all pages
- `crossorigin` attribute on all external resource links (fonts, scripts)
- COOP/COEP headers for SharedArrayBuffer support
- Graceful degradation for low-end devices

### 7.3 Budget Constraints
- **₹0 budget** — Every feature must run on free-tier infrastructure
- No paid API calls in v1
- Monitor storage: NeonDB < 0.5GB, R2 < 10GB
- Edge TTS is free; if it breaks, fallback to Piper TTS (self-hosted, free)

### 7.4 Repository Layout & Separation Constraints
- **Independent Directory Structure:** The repository codebase must be split into `/mobile`, `/admin`, `/backend`, and `/shared`.
- **No Cross-Folder Source Imports:** Code under `/mobile` and `/admin` must remain completely separate with no shared relative source imports or mixed assets.
- **Separate Builds & Runs:** The PWA mobile client and admin dashboard web app must run as distinct frontend concerns communicating only through backend endpoints.

---

## 8. Feature Scope Guardrails

### 8.1 v1 = Completely Free
- No payment integration
- No premium tiers
- No rate limiting
- No watermarks on exports
- All templates free
- All AI features fully available

### 8.2 Permanently Out of Scope
| Feature | Reason |
| :--- | :--- |
| iOS / App Store build | India = 95% Android. $99/yr fee not justified. |
| User-generated templates | Quality control nightmare. Admin-curated only. |
| Real-time collaboration | Over-engineering for a solo creator tool. |
| Server-side video rendering | 100% client-side via FFmpeg.wasm. Never going back. |
| Social features | We're a tool, not a social network. |
| Third-party ad SDKs | Degrades premium perception. |
| Multi-language admin dashboard | Admin is us. English only. |

---

*This document defines all rules, constraints, security requirements, and quality guardrails for NewsForge. Every agent must read and comply with these rules before writing any code or making design decisions.*
