# WORK BREAKDOWN STRUCTURE — BonVoye

**Basis:** `internal-technical-discussions-vi.md` §7 (roadmap/milestones) + `Technical Design.md`
(architecture/data model/offline/sync/GPS) + `app-core-text-diagram.md` /
`cms-text-diagram.md` (screen-level detail).
**Assumed kickoff:** 2026-08-03. All dates shift if kickoff, approvals, or content readiness
slip (see Assumption §9 in the internal discussion doc).

> This is a phase/deliverable/work-package breakdown of the *whole* BonVoye product
> (Flutter app + NestJS backend + CMS + Zalo Mini App), not just the code currently in this
> repo. **Current repo state = 2.5 (Flutter prototype, no backend)** — `lib/` contains the
> mock-data map/story prototype (`map_view.dart`, `npc_story_sheet.dart`,
> `data/mock_data.dart`, etc.) that M0.5 calls for.

---

## 1. Project Management & Governance *(cross-phase, ongoing)*

### 1.1 Program management
- 1.1.1 Client communication cadence, status reporting
- 1.1.2 Risk log & mitigation tracking (see Technical Design §17 risk table)
- 1.1.3 Delivery coordination across Flutter/Backend/CMS/Zalo/QA workstreams

### 1.2 Technical architecture oversight
- 1.2.1 Architecture review across phases
- 1.2.2 Decision authority on GPS/map/payment/platform tradeoffs

### 1.3 Approval gates
- 1.3.1 Track client sign-off at each milestone (M0.1–M0.6, phase completion criteria)
- 1.3.2 Maintain the open-decisions log (Technical Design §16: Q1–Q6)

### 1.4 Client-provided dependencies
- 1.4.1 Apple Developer / Google Play Console / Zalo developer account access
- 1.4.2 Story text, narration audio, webtoon artwork, music, historical research, licensing
- 1.4.3 Partner-code rules, activation definition, report fields
- 1.4.4 Sovereignty-sensitive assets: VN-compliant boundary GeoJSON, place-name/city-assignment wording

---

## 2. Phase 0 — Product Design, UX & Prototype Validation
**2026-08-03 → 2026-09-04 · ~5 weeks · PM, Tech Lead, UI/UX (full-time), 1 Flutter dev, Backend part-time**

### 2.1 Product flow alignment *(M0.1, 08-03–08-07)*
- 2.1.1 Confirm app flow, user roles, core modules
- 2.1.2 Confirm Zalo Mini App scope boundary

### 2.2 UX wireframes *(M0.2, 08-03–08-14)*
- 2.2.1 Onboarding, city, POI, Story flows
- 2.2.2 Trip, payment, profile, Zalo flows

### 2.3 Hi-fi UI & design system *(M0.3, 08-10–08-28)*
- 2.3.1 Visual style & component library
- 2.3.2 Map/Story UI direction
- 2.3.3 CMS admin UI direction

### 2.4 Clickable Figma prototype *(M0.4, 08-24–08-28)*
- 2.4.1 Click-through happy path
- 2.4.2 Client sign-off

### 2.5 Flutter prototype, no backend *(M0.5, 08-24–09-04)*
- 2.5.1 App shell + navigation + Material 3 theme
- 2.5.2 Map view with mock POIs/NPCs
- 2.5.3 Story sheet (audio + webtoon dialogue placeholder)
- 2.5.4 Mock data fixtures
- 2.5.5 Developer/location-simulation panel

### 2.6 Map Provider Approval Gate *(M0.6, 08-03–08-14)*
- 2.6.1 Present Mapbox (Pro scope) + Amap/Gaode (future China add-on) recommendation
- 2.6.2 Client approval of provider + sovereignty approach

---

## 3. Phase 1 (Build M1) — Technical Foundation, Architecture, CMS & Core Data Model
**2026-09-07 → 2026-09-18 · Build weeks 1–2**

### 3.1 Backend/API foundation
- 3.1.1 NestJS project setup
- 3.1.2 Auth skeleton
- 3.1.3 API structure

### 3.2 Core data model (PostgreSQL + PostGIS)
- 3.2.1 7-level content tree schema: Country → City → Topic → POI → NPC → Story → Hidden Thread
- 3.2.2 Base fields common to every content node
- 3.2.3 Content versioning fields (mandatory from day one — foundation of Sync DOWN)

### 3.3 Entitlement & progress schema
- 3.3.1 Per-user entitlement tables
- 3.3.2 Per-user progress tables

### 3.4 CMS foundation
- 3.4.1 CMS setup (NestJS + React), shared codebase/auth/model with backend
- 3.4.2 Initial content-tree scaffold

### 3.5 Visual Map Editor — technical design
- 3.5.1 POI/NPC placement UX (dual coordinate systems: GPS ↔ artwork pixel space)
- 3.5.2 Calibration approach (affine transform via control points, RMSE validation, per-POI manual override)
- 3.5.3 Isometric-artwork placement constraints

### 3.6 Map provider integration
- 3.6.1 Mapbox SDK integration
- 3.6.2 Offline map-tile packaging mechanism
- 3.6.3 Custom raster source for illustrated artwork overlay

### 3.7 Map sovereignty compliance (ML1–ML5)
- 3.7.1 ML1 — audit Mapbox default style
- 3.7.2 ML2 — custom style hiding political boundaries
- 3.7.3 ML3 — VN-compliant GeoJSON boundary layer
- 3.7.4 ML4 — boundary override/replacement mechanism
- 3.7.5 ML5 — provider abstraction layer (for future Amap/Gaode expansion)

### 3.8 Mobile app shell
- 3.8.1 Flutter navigation
- 3.8.2 Initial auth wiring

### 3.9 Attribution model
- 3.9.1 UTM/referrer/partner attribution schema

### 3.10 DevOps
- 3.10.1 Deployment environments
- 3.10.2 CI/CD
- 3.10.3 Logging & baseline monitoring

**Exit criteria:** core architecture runs end-to-end · CMS represents the main content objects
· iOS/Android app connects to backend · first internal build exists.

---

## 4. Phase 2 (Build M2) — Core App Experience on iOS/Android
**2026-09-21 → 2026-10-09 · Build weeks 3–5**

### 4.1 City map
- 4.1.1 City map + POI markers
- 4.1.2 Map/list content browsing
- 4.1.3 BonVoye content search

### 4.2 Story map
- 4.2.1 POI detail view
- 4.2.2 NPC placement on map
- 4.2.3 NPC state (locked/unlocked/completed) — hysteresis state machine to prevent flicker

### 4.3 GPS interaction
- 4.3.1 Configurable NPC/Story interaction radius
- 4.3.2 Tap-to-start flow
- 4.3.3 Fake-GPS drag limit (300m) for dev/testing
- 4.3.4 Auto-reset-to-real-GPS state machine (4 trigger conditions incl. 60s buffer + confirmation popup)

### 4.4 Story experience
- 4.4.1 Audio-only mode
- 4.4.2 Webtoon mode (dialogue bubbles + background music)
- 4.4.3 Resume in-progress audio/webtoon

### 4.5 Hidden Threads
- 4.5.1 Related-content surfacing
- 4.5.2 Locked/unlocked state
- 4.5.3 Multi-POI series completion

### 4.6 CMS content management
- 4.6.1 Country/City/Topic CRUD
- 4.6.2 POI/NPC CRUD
- 4.6.3 Story/Hidden Thread CRUD

### 4.7 Map sovereignty audit (ML6)
- 4.7.1 Place-label audit
- 4.7.2 Country list & city-assignment review in CMS

**Exit criteria:** users browse city/POI/story content · users interact with NPCs on
iOS/Android · CMS manages enough content for testing · GPS behavior is field-test-ready.

---

## 5. Phase 3 (Build M3) — Monetization, Offline, Journey & History Layer
**2026-10-12 → 2026-10-30 · Build weeks 6–8**

### 5.1 Trip Planner
- 5.1.1 POI selection
- 5.1.2 Simple duration input
- 5.1.3 Simple journey generation with manual edit

### 5.2 Payments
- 5.2.1 Apple IAP integration
- 5.2.2 Google Play Billing integration
- 5.2.3 Receipt validation (backend)

### 5.3 Content entitlement
- 5.3.1 Free first POI (user-selected)
- 5.3.2 Single-POI purchase
- 5.3.3 Route package / city package
- 5.3.4 Subscription/membership

### 5.4 Purchase restore
- 5.4.1 Restore entitlement on reinstall/device change

### 5.5 Offline
- 5.5.1 Download Manager (POI = atomic download unit: map tile + media + content nodes)
- 5.5.2 Per-asset checksum verification, resume-on-failure
- 5.5.3 Download purchased content + free first POI

### 5.6 Sync engine
- 5.6.1 Sync UP — progress → server (outbox pattern)
- 5.6.2 Sync DOWN — content updates → local (version-check based)
- 5.6.3 Conflict resolution — completion is monotonic/one-way ("done is done")

### 5.7 History Layer
- 5.7.1 Then & Now field content
- 5.7.2 Archival media
- 5.7.3 Unlock rules

### 5.8 Progress tracking
- 5.8.1 POI/NPC/Story progress state machine
- 5.8.2 Badges/achievements (if low-cost)

### 5.9 Journal/share
- 5.9.1 Completed POI/journey cards
- 5.9.2 Personal travel journal baseline

**Exit criteria:** native payment + entitlement flow works in sandbox · offline content works
on iOS/Android · History Layer configurable from CMS · Trip Planner supports the agreed
simple-journey flow.

---

## 6. Phase 4 (Build M4) — Partner Access, Attribution, Reports & Zalo Mini App
**2026-10-19 → 2026-11-13 · Build weeks 7–10 · overlaps Phase 3**

### 6.1 Partner entitlement
- 6.1.1 Partner-code generation
- 6.1.2 Activation tracking
- 6.1.3 Partner ownership recording

### 6.2 Attribution
- 6.2.1 UTM capture
- 6.2.2 QR/deep-link tracking
- 6.2.3 Referrer/campaign recording

### 6.3 Reporting
- 6.3.1 Activation/usage reports
- 6.3.2 Entitlement/purchase event reports
- 6.3.3 Early-stage partner reconciliation (not a full commission engine)

### 6.4 Zalo Mini App shell
- 6.4.1 Zalo shell setup
- 6.4.2 Login/account linking
- 6.4.3 Content browsing (map/list, within Zalo platform support)

### 6.5 Zalo entitlement display
- 6.5.1 Purchased-content + entitlement status display only (no payment, no purchase handoff)

### 6.6 Zalo campaign entry
- 6.6.1 Open POI/Story/campaign from Zalo QR/deep link

**Exit criteria:** partner campaign testable end-to-end · Zalo Mini App browses supported
content · Zalo Mini App shows purchased/entitlement status · Zalo Mini App has no
payment/purchase handoff.

---

## 7. Phase 5 (Build M5) — QA, Field Testing, Platform Submission & Stabilization
**2026-11-16 → 2026-12-11 · Build weeks 11–14**

### 7.1 Functional QA
- 7.1.1 Core app, CMS, payment, entitlement, offline, partner flows

### 7.2 Device QA
- 7.2.1 iOS/Android device matrix

### 7.3 GPS field testing
- 7.3.1 Validate 20–30m geofence target in the field
- 7.3.2 Weak-GPS fallback behavior
- 7.3.3 QR/admin override verification

### 7.4 Payment testing
- 7.4.1 Apple/Google sandbox
- 7.4.2 Restore-purchases flow
- 7.4.3 Entitlement sync verification

### 7.5 Zalo testing
- 7.5.1 Zalo platform behavior, account linking
- 7.5.2 Map/list behavior, media compatibility

### 7.6 Security/hardening baseline
- 7.6.1 Auth review
- 7.6.2 Permission checks, admin rights
- 7.6.3 Secrets review

### 7.7 Submission support
- 7.7.1 App Store submission package
- 7.7.2 Google Play submission package
- 7.7.3 Zalo Mini App submission package

### 7.8 Map sovereignty legal review (ML7)
- 7.8.1 VN legal/submission review of map rendering before submit

### 7.9 Map Legal Acceptance Pack
- 7.9.1 Screenshots + style-layer evidence
- 7.9.2 Boundary-layer configuration record
- 7.9.3 Sovereignty-handling notes for client/legal sign-off

### 7.10 Map sovereignty documentation (ML8)
- 7.10.1 Document sovereignty policy and client responsibilities

### 7.11 Stabilization
- 7.11.1 Bug fixing
- 7.11.2 Regression testing
- 7.11.3 Closed-testing build

**Exit criteria:** TestFlight-ready build · Google Play internal/closed-testing-ready build ·
Zalo Mini App submission-ready package · Map Legal Acceptance Pack approved by client/legal
before public submit · known platform limitations documented.

---

## Explicitly out of scope (not broken down here)

Per `internal-technical-discussions-vi.md` §10: China add-on (Amap/Gaode, GCJ-02, China infra,
ICP filing, China payment channels), WeChat Mini App, "Max" features (AR, AI guide, B2B
white-label portal, creator tools, BLE beacons, smart recommendations, advanced
gifting/referral, kids mode), full partner portal/automated commission settlement, ZaloPay or
in-Zalo payment, Advanced Route Optimization, Quiz, Country Completion, and content
production itself (writing, translation, illustration, narration, licensing).

---

## Summary timeline

| WBS | Phase | Dates | Headline output |
|---|---|---|---|
| 2 | Phase 0 | 08-03 → 09-04 | UX, Figma prototype, no-backend Flutter prototype |
| 3 | Build M1 | 09-07 → 09-18 | Technical foundation, CMS skeleton, data model, architecture |
| 4 | Build M2 | 09-21 → 10-09 | Core app experience: map, story, GPS, Hidden Threads |
| 5 | Build M3 | 10-12 → 10-30 | Payments, offline, Journey, History Layer |
| 6 | Build M4 | 10-19 → 11-13 | Partner access, attribution, reports, Zalo Mini App |
| 7 | Build M5 | 11-16 → 12-11 | QA, GPS field testing, platform submission, stabilization |
