# NewsForge — Design System & UI/UX Specification

**Agent Assignment:** 🎨 **Design Agent**
**Source:** Extracted from [newsforge_prd.md](file:///f:/newsapp/newsforge_prd.md) §6 (UI/UX Strategy), §9.1 (Editor Layout), §3.2 (Unfair Advantages — UX)
**Scope:** All visual design, component specs, screen layouts, design tokens, and interaction patterns.
**Last Updated:** 2026-06-24

---

## 1. Design Philosophy

Strictly aligned with brand rules:

- **Premium, minimal, mobile-first.** Thumb-friendly interactions, generous touch targets, clean surfaces.
- **No neo-brutalism.** No high-contrast borders, no grainy noise, no glowing elements.
- **Speed over options.** Every screen should move the user toward export. Zero dead-ends, zero configuration overwhelm.
- **Dark-mode-first for mobile.** News creators work at all hours. Dark mode reduces eye strain and makes template previews pop.

### Key UX Principles
1. **Fill-in-the-blank UX** — Users never see a canvas, timeline, or layer panel. They see a form with labeled inputs (Headline, Photo, Source, Date) and a live preview.
2. **Zero-skill rendering** — Users never touch a timeline, never drag layers, never adjust keyframes. They type a headline, upload a photo, tap "Generate Voice", and export.
3. **India-first + Vernacular** — Multi-language support, Indian regional fonts, lightweight APK for budget devices.
4. **"Aha" Moment:** The instant a user picks a "Breaking News" template, types their headline, uploads one photo, taps "Generate Voice" and hears a professional AI anchor reading their story — and exports the whole thing in under 60 seconds.

---

## 2. Design System Tokens

| Element | Value |
| :--- | :--- |
| **Background (Dark)** | Deep Charcoal (`#0F0F12`) |
| **Background (Light)** | Cool White (`#F5F5F7`) |
| **Surface** | Elevated Dark (`#1A1A1F`) / Warm Gray (`#E8E8EC`) |
| **Primary Text** | Pure White (`#FFFFFF`) / Near Black (`#1D1D1F`) |
| **Accent** | Electric Blue (`#3B82F6`) |
| **Success** | Emerald (`#10B981`) |
| **Warning** | Amber (`#F59E0B`) |
| **Premium Badge** | Gold Gradient (`#F59E0B → #EF4444`) |
| **Headline Font** | Inter (sans-serif, tight tracking) — modern authority |
| **Body Font** | Inter (sans-serif) — clean readability |
| **Label/Data Font** | JetBrains Mono (monospace) — technical precision |
| **Border Radius** | `12px` (modern, rounded, mobile-native feel) |
| **Shadows** | Subtle elevation shadows (`0 2px 8px rgba(0,0,0,0.15)`) |

---

## 3. Mobile App — Key Screens

### 3.1 Home / Template Browser
- **Top:** Search bar + category pills (Breaking News, Sports, Weather, Politics, Entertainment, Business, Custom)
- **Grid:** Template thumbnails with badges (Free, Premium 👑, New ✨, Trending 🔥)
- **Each card shows:** Preview image, template name, format (Image/Video), size badge (Story/Post/Landscape)
- **Bottom nav:** Home, My Projects, AI Tools, Profile

### 3.2 Template Fill Screen (The Core Experience)
- Full-width live preview at top (shows template with user inputs in real-time)
- Below preview: Scrollable form with labeled input fields:
  - Each field defined by the template (e.g., "Headline" → text input, "Main Photo" → image picker, "Source" → text, "Date" → date picker)
  - Input constraints shown (e.g., "Max 60 characters", "Square crop recommended")
- Sticky bottom bar: "Preview" and "Export" buttons
- **No canvas. No layers. No timeline. Just a form and a preview.**

### 3.3 AI Tools Screen
- Two cards:
  - **AI Script Writer** — Input: topic/keywords + tone (Formal/Casual/Dramatic/Neutral) + length (30s/60s/90s) → Output: formatted news script
  - **AI Voice Generator** — Input: script text (paste or from AI Script) + voice selector (language, gender, style) → Output: audio preview + download
- Usage counters: "3 of 5 scripts remaining today" (free tier)

### 3.4 Export Screen
- Format selector: PNG / JPG / MP4 (video templates only)
- Quality selector: 720p (Free) / 1080p (Pro) / 4K (Newsroom)
- Add AI Voice toggle (for video templates) — select from generated voices
- Preview final output
- "Export" button → progress bar → save to gallery / share sheet
- Post-export: "Share to Instagram / WhatsApp / YouTube" quick actions

### 3.5 My Projects Screen
- List of recent exports with thumbnails
- "Edit & Re-export" option (re-opens fill screen with saved inputs)
- Cloud sync for Pro/Newsroom users (localStorage for free tier)

### 3.6 Profile & Settings
- Current plan + upgrade CTA
- Usage stats (exports today, AI credits remaining)
- Language preference
- Download quality preference
- Cache management (clear cached templates)

---

## 4. Admin Dashboard — Key Screens (Web)

### 4.1 Dashboard Home
- Metrics overview: Total templates, total users, exports today, AI usage, revenue
- Quick actions: "Create Template", "View Analytics", "Manage Users"

### 4.2 Template Manager
- Table/grid of all templates with: Thumbnail, Name, Category, Format, Pricing (Free/Premium), Status (Draft/Published/Archived), Downloads count, Last modified
- Filters: Category, Status, Pricing, Format
- Bulk actions: Publish, Archive, Change pricing

### 4.3 Template Editor Layout
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

### 4.4 Analytics Dashboard
- Template performance: Which templates get most downloads/exports
- User metrics: DAU, MAU, retention, conversion
- AI usage: Voice generations, script generations, cost tracking
- Revenue: Subscriptions, plan distribution

---

## 5. Editor Features (Admin Only)

### 5.1 Canvas Tools
- **Text tool** — Add text with Google Fonts, size, color, alignment, letter spacing, line height, shadow
- **Image tool** — Upload images from local or R2 asset library. Crop, mask, filters (brightness, contrast, grayscale)
- **Shape tool** — Rectangle, circle, triangle, polygon, star, custom SVG
- **Icon library** — Curated set of news-relevant icons (microphone, camera, globe, location pin, etc.)
- **Background** — Solid color, gradient, image, pattern
- **Line/Divider** — Horizontal, vertical, custom paths

### 5.2 Layer Management
- Drag-to-reorder layers
- Lock/unlock layers
- Show/hide layers
- Group/ungroup
- Duplicate layer
- Layer naming (for identifying target_object_id)

### 5.3 Properties Panel
- Position (X, Y), Size (W, H), Rotation, Opacity
- Fill color, Stroke color/width
- Font family, size, weight, style, alignment
- **Input Slot Definition** — Toggle "Is Input Slot" checkbox:
  - When enabled: Define slot label, type, constraints
  - The object becomes user-editable on mobile
  - Visual indicator (blue dashed border) shows which objects are input slots

### 5.4 Scene Management (Video Templates)
- Add/remove/reorder scenes
- Set duration per scene (seconds)
- Transition selector (fade, slide, zoom, cut)
- Per-object animations (typewriter, fade-in, slide-in, scale, bounce)
- Animation timing (delay, duration)
- Preview button plays all scenes in sequence

---

## 6. Template Card Component Spec

Each template card in the browser grid should display:

| Element | Details |
| :--- | :--- |
| **Preview Image** | Template thumbnail from R2 (`/templates/thumbs/`) |
| **Template Name** | e.g., "Breaking News — Red Alert" |
| **Format Badge** | `Image` or `Video` with distinct visual treatment |
| **Size Badge** | `Story` / `Post` / `Landscape` |
| **Pricing Badge** | `Free` (default in v1), `Premium 👑` (v1.1+) |
| **Freshness Badge** | `New ✨` (< 7 days), `Trending 🔥` (top 10 by downloads) |

---

## 7. Interaction Patterns

### 7.1 Micro-animations
- Template card hover/tap: subtle scale up (1.02×) + shadow deepening
- Input field focus: accent border glow transition (200ms ease)
- Export progress: smooth percentage bar with pulse animation
- Tab/pill selection: slide indicator with spring easing
- Live preview: 150ms debounce on input changes, smooth crossfade on image swap

### 7.2 Touch Targets
- Minimum: 44×44px (Apple HIG / Android Material guideline)
- Bottom nav icons: 48×48px
- Action buttons (Export, Generate): 56px height, full-width on mobile

### 7.3 Responsive Breakpoints
- **Mobile (default):** < 768px — single column, full-width cards
- **Tablet:** 768px–1024px — 2-column grid
- **Desktop (Admin only):** > 1024px — 3-panel editor layout

---

## 8. Play Store Visual Assets

**Screenshots (5 required):**
1. Template browser with category pills
2. Fill screen with live preview (Breaking News template)
3. AI Voice generation screen with voice selector
4. AI Script writer with generated output
5. Export screen with format options

**Short Demo Video:** 15-second workflow showing template selection → fill → AI voice → export.

---

## 9. What NOT to Design

| Anti-Pattern | Reason |
| :--- | :--- |
| Video editor timeline for users | We are a template filler, not an editor |
| Canvas/layer panel for users | Users see forms, not canvases |
| Social features (likes, follows, feeds) | We're a tool, not a social network |
| Complex settings/configuration screens | Speed over options |
| Neo-brutalist aesthetics | Against brand identity |

---

*This document defines the complete visual and interaction design spec for NewsForge. The Design Agent should reference this for all UI implementation decisions.*
