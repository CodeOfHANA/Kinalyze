# Kinalyze — AI Physiotherapy Coach

> Browser-based AI physiotherapy coach that uses computer vision and pose estimation to guide users through preventive exercises with real-time corrective feedback — no installation, no hardware, no physiotherapist required.

**Academic context:** VTU BAD685 | Team: 4 members | Version: 1.1

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | https://kinalyze-frontend.vercel.app |
| Backend API | https://kinalyze-backend.onrender.com/health |

---

## Table of Contents

1. [What is Kinalyze?](#what-is-kinalyze)
2. [System Architecture](#system-architecture)
3. [AI Architecture](#ai-architecture)
4. [Repository Structure](#repository-structure)
5. [Tech Stack](#tech-stack)
6. [Features](#features)
7. [Database Schema](#database-schema)
8. [Local Development](#local-development)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Security Design](#security-design)
12. [KPIs](#kpis)
13. [Medical Disclaimer](#medical-disclaimer)

---

## What is Kinalyze?

Kinalyze uses a standard webcam and MediaPipe BlazePose to:

1. Capture webcam frames at ~10fps in the browser
2. Send frames to a FastAPI backend that runs pose estimation
3. Extract 33 body landmarks and compute joint angles in 3D world space
4. Compare angles against per-exercise threshold models derived from physiotherapy research
5. Return structured corrective feedback (joint name, direction, angle gap, confidence)
6. Render a real-time skeleton overlay with joint arc gauges and direction arrows
7. Speak corrections via the Web Speech API (debounced to prevent repetition)
8. Save session results to Supabase and generate a personalised AI coaching summary via Groq

**Key constraints:**
- No video is ever stored — frames are processed in-memory and discarded
- Works in any modern browser on a laptop or desktop — zero installation
- No medical claims are made anywhere in the application

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (User)                          │
│                                                                 │
│  ┌──────────────┐   ┌───────────────────────────────────────┐  │
│  │   Supabase   │   │         React App (Vercel)            │  │
│  │   Auth SDK   │   │                                       │  │
│  │              │   │  Landing → Auth → Dashboard →         │  │
│  │ Google OAuth │   │  ExerciseDetail → LiveSession →       │  │
│  │ Email/Pass   │   │  Summary → Profile                    │  │
│  └──────┬───────┘   └──────────────┬────────────────────────┘  │
│         │                          │                            │
└─────────┼──────────────────────────┼────────────────────────────┘
          │                          │
          │ JWT (HS256)              │ JPEG frames (multipart/form-data)
          │ User session             │ Authorization: Bearer <token>
          ▼                          ▼
┌─────────────────┐        ┌─────────────────────────────────────┐
│    Supabase     │        │    FastAPI Backend (Render/Docker)  │
│  (Ireland)      │        │                                     │
│                 │        │  ┌────────────────────────────────┐ │
│  Auth service   │        │  │  POST /analyze                 │ │
│  PostgreSQL DB  │        │  │                                │ │
│  Edge Functions │        │  │  1. Verify JWT (PyJWT HS256)   │ │
│                 │        │  │  2. Rate limit (slowapi 30/min)│ │
│  Tables:        │        │  │  3. Decode JPEG (OpenCV)       │ │
│  • sessions     │        │  │  4. BlazePose inference        │ │
│  • joint_results│        │  │     (MediaPipe 0.10.14)        │ │
│  • exercises    │        │  │  5. compute_angle_3d (NumPy)   │ │
│  • profiles     │        │  │  6. evaluate_pose vs thresholds│ │
│                 │        │  │  7. Return feedback JSON       │ │
│  Edge Function: │        │  └────────────────────────────────┘ │
│  coaching-      │◄───────┤                                     │
│  summary        │  saved │  GET /exercises  (no auth, 60/min) │
│  (Groq API key  │  after │  GET /health     (no auth)         │
│   stored here,  │  session                                    │
│   never in      │        └─────────────────────────────────────┘
│   browser)      │
└─────────────────┘
         │
         │ Groq API (Llama 3.3 70B)
         ▼
  AI Coaching Summary
  (3-sentence personalised tip
   on Summary page)
```

### Request Flow: Live Session Frame

```
useWebcam.captureFrame()          — canvas.toBlob() → JPEG
        │
usePoseDetection (100ms interval)
        │
analyzeFrame(blob, exerciseId)    — POST /analyze with JWT
        │
FastAPI /analyze
        ├── require_auth()        — PyJWT.decode(HS256)
        ├── extract_landmarks()   — MediaPipe BlazePose
        │     └── 33 landmarks (x,y,z normalised + world coords)
        ├── evaluate_pose()       — per-joint angle vs JSON threshold
        │     ├── compute_angle_3d(world_landmarks)
        │     ├── direction hint (increase / decrease)
        │     └── speed warning (velocity between frames)
        └── AnalyzeResponse JSON
                │
        setFeedback(result.feedback)
                │
        FeedbackPanel             — message + angle gauge bar + direction badge
        SkeletonOverlay           — joint arcs + direction arrows on canvas
        useVoiceFeedback          — Web Speech API, debounced 3s
```

---

## AI Architecture

Kinalyze uses a two-layer AI architecture:

### Layer 1 — Real-time Rule-based Feedback (v1, live)

```
MediaPipe BlazePose
    → 3D world landmark coordinates
    → compute_angle_3d (NumPy dot product, dimension-agnostic)
    → compare vs JSON threshold model {min_angle, max_angle, joint_name}
    → FeedbackData {isCorrect, joint, direction, angle, target_min, target_max}
```

- Runs at ~10fps within the P95 < 200ms latency budget
- Confidence suppression: low-confidence frames are silently skipped, preventing false corrections
- 20 threshold models, one per exercise, derived from physiotherapy research

### Layer 2 — Post-session LLM Coaching (v1, via Edge Function)

```
Session JSON {exerciseId, overallAccuracy, repCount, jointResults[]}
    → Supabase Edge Function (coaching-summary)
    → Groq API (Llama 3.3 70B, llama-3.3-70b-versatile)
    → System prompt: physio coaching conventions, external cueing technique
    → 3-sentence personalised coaching summary
    → Displayed on Summary page
```

The Groq API key is stored exclusively as a Supabase Edge Function secret — it never appears in the browser bundle or any repository.

---

## Repository Structure

This is a monorepo containing all six project components:

```
Kinalyze/
├── kinalyze-frontend/      React 18 + Vite + Tailwind + Supabase JS
│                           Deployed: Vercel
│
├── kinalyze-backend/       Python + FastAPI + MediaPipe + OpenCV
│                           Deployed: Render (Docker)
│
├── kinalyze-testing/       Playwright E2E tests (36 tests)
│                           Tests the deployed frontend at localhost:5173
│
├── kinalyze-data/          Jupyter + pandas
│                           Landmark extraction and threshold model derivation
│
├── kinalyze-security/      gitleaks + npm/pip audit workflows
│                           Security scanning configuration
│
├── kinalyze-design-review/ Playwright screenshots + UX review checklists
│
├── supabase/
│   ├── config.toml         Supabase project configuration (auth, redirect URLs)
│   ├── migrations/         SQL migrations (run in order: 001 → 004)
│   └── functions/
│       └── coaching-summary/index.ts   Deno Edge Function (Groq proxy)
│
├── skills/                 Claude Code skill files (AI dev workflow)
│   ├── skill-ui/
│   ├── skill-fastapi/
│   ├── skill-pose/
│   ├── skill-testing/
│   └── skill-security/
│
├── docs/
│   └── PRD.md              Product Requirements Document
│
└── prd.md                  Root PRD copy
```

> **Note:** `kinalyze-backend` and `kinalyze-frontend` are private repos deployed independently. Their source code is tracked here as gitlinks. See their individual READMEs for full setup and deployment instructions.

---

## Tech Stack

### Frontend (`kinalyze-frontend`)

| Technology | Version | Role |
|---|---|---|
| React | 18.3 | UI framework |
| Vite | 5.2 | Build tool + HMR dev server |
| Tailwind CSS | 3.4 | Utility-first design system |
| Framer Motion | 11.2 | Animations, page transitions, skeleton overlay motion |
| React Router | 6.23 | Client-side routing (SPA) |
| Recharts | 2.12 | Accuracy trend charts on dashboard |
| Supabase JS | 2.43 | Auth, database queries, Edge Function invocation |
| Web Speech API | browser | Voice coaching feedback |
| Canvas API | browser | Real-time skeleton overlay rendering |
| Vitest | 4.0 | Unit test runner (happy-dom environment) |
| @testing-library/react | 16.3 | Component testing |

### Backend (`kinalyze-backend`)

| Technology | Version | Role |
|---|---|---|
| FastAPI | 0.135 | API framework |
| Uvicorn | 0.30 | ASGI server |
| MediaPipe | 0.10.14 | BlazePose landmark extraction |
| OpenCV (headless) | 4.9 | JPEG decode, image preprocessing |
| NumPy | 1.26 | 3D angle computation |
| PyJWT | 2.9 | Supabase JWT verification (HS256) |
| slowapi | 0.1.9 | Per-IP rate limiting |
| python-multipart | 0.0.22 | Multipart file upload parsing |
| Pydantic | 2.7 | Typed request/response models |
| pytest + httpx | 8.2 / 0.27 | Backend test suite |
| Docker | — | Containerised deployment on Render |

### Infrastructure

| Service | Purpose |
|---|---|
| Supabase (Ireland) | PostgreSQL DB, Auth (Google OAuth + email), Edge Functions |
| Render (free tier) | Backend hosting — Docker container |
| Vercel | Frontend hosting — static Vite build, CDN |
| Groq | LLM inference (Llama 3.3 70B) via Edge Function |
| GitHub | Source control, CI |
| gitleaks | Pre-commit secret scanning (all repos) |

---

## Features

### Live Session
- Webcam feed with real-time MediaPipe pose estimation at ~10fps
- Canvas skeleton overlay with 33 landmarks, colour-coded joint arcs (green = in range, red = out of range), and directional arrows (↑/↓) at failing joints
- Rep counter (circular SVG, target: 10 reps) with automatic session end
- FeedbackPanel: corrective message + angle gauge bar + direction badge
- Voice coaching via Web Speech API, debounced 3 seconds to prevent repetition
- Low-confidence suppression: shows "Adjusting…" when MediaPipe confidence is low, suppresses all corrections
- Speed warning if movement velocity exceeds analysis threshold
- Escape key shortcut to end session; manual Finish button

### Session Summary
- Animated accuracy count-up with delta vs previous session (▲/▼)
- Per-joint accuracy bars (colour-coded)
- AI coaching summary (Groq Llama 3.3 70B) — 3 personalised sentences referencing actual joint names, accuracy percentages, and physio external-cueing techniques
- Rule-based fallback tips if the Edge Function is unavailable

### Dashboard
- Personal greeting with user first name
- Streak badge (days in a row with a session)
- 20 exercise cards with animated SVG previews, difficulty badges, muscle group labels
- Session history table (last 10 sessions)
- Accuracy trend line chart (Recharts)

### Exercise Library — 20 Exercises

| Tier | Exercises |
|---|---|
| Core | Arm Lift, Lateral Raise, Shoulder Press, Leg Raise, Lunge, Squat |
| Tier 1 | Bicep Curl, Tricep Extension, High Knee March, Hip Abduction, Glute Bridge, Shoulder Rotation |
| Tier 2 | Calf Raise, Single Leg Stand, Torso Rotation, Dead Bug |
| Tier 3 | Incline Plank, Wall Sit, Standing Bird Dog, Chest Opener |

### Auth & Profile
- Google OAuth (one-click) and email/password via Supabase
- Authenticated route guard — unauthenticated users redirected to `/auth`
- Profile page: display name, streak, total sessions, lifetime average accuracy

---

## Database Schema

Hosted on Supabase (PostgreSQL). Row Level Security (RLS) enabled — users access only their own data.

```sql
-- Users managed by Supabase Auth (auth.users)
-- Application tables in public schema:

profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users,
  display_name text,
  current_streak int DEFAULT 0,
  updated_at   timestamptz
)

sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users,
  exercise_id      text NOT NULL,           -- e.g. "squat"
  started_at       timestamptz,
  completed_at     timestamptz,
  overall_accuracy int                       -- 0–100
)

joint_results (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid REFERENCES sessions,
  joint_name       text,                    -- e.g. "left_knee"
  accuracy_pct     int,
  correction_count int
)

exercises (
  id                   text PRIMARY KEY,    -- e.g. "squat"
  name                 text,
  muscle_group         text,
  difficulty           text,
  description          text,
  reference_model_path text
)
```

Migrations are in `supabase/migrations/` and must be run in order (001 → 004).

---

## Local Development

Running the full stack locally requires three terminals.

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| Python | 3.10 | https://python.org |
| npm | 10+ | Bundled with Node |
| pip | 24+ | Bundled with Python |

### Step 1 — Clone

```bash
git clone https://github.com/CodeOfHANA/Kinalyze.git
cd Kinalyze
```

### Step 2 — Backend

```bash
cd kinalyze-backend

# Create and activate virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env (see backend README for all variables)
# Minimum for local dev:
echo "SUPABASE_JWT_SECRET=your-legacy-jwt-secret" > .env
echo "ALLOWED_ORIGINS=http://localhost:5173" >> .env
echo "ENVIRONMENT=development" >> .env

# Start the API server
uvicorn app.main:app --reload --port 8001
```

Backend runs at `http://localhost:8001`. Interactive docs at `http://localhost:8001/docs`.

### Step 3 — Frontend

```bash
cd kinalyze-frontend

# Install dependencies
npm install

# Create .env.local (see frontend README for all variables)
cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=
EOF
# Leave VITE_API_URL empty — Vite proxy routes /analyze and /exercises to localhost:8001

# Start the dev server
npm run dev
```

Frontend runs at `http://localhost:5173`.

### Step 4 — E2E Tests (optional)

```bash
cd kinalyze-testing

# Install Playwright + browser
npm install
npx playwright install chromium

# Run tests (frontend must be running on :5173)
npx playwright test

# Run with browser visible
npx playwright test --headed

# View HTML report
npx playwright show-report
```

---

## Testing Strategy

Kinalyze has three test layers, covering the full stack:

### Backend — pytest (36 tests)

```
kinalyze-backend/tests/
├── conftest.py          FastAPI dependency override — bypasses JWT for tests
├── test_angles.py       angle_between (2D + 3D), compute_angle_3d, fallback
├── test_api.py          All HTTP endpoints: auth, exercises, health, analyze
└── test_evaluate_pose.py evaluate_pose: low confidence, correct form, incorrect form
```

```bash
cd kinalyze-backend && pytest -v
```

### Frontend — Vitest (42 tests)

```
kinalyze-frontend/src/
├── lib/api.test.js                       fetch wrappers, auth headers
├── components/session/FeedbackPanel.test.jsx  render states, ARIA, angle gauge
├── components/session/RepCounter.test.jsx     display, stroke colour
└── hooks/useVoiceFeedback.test.js            suppression, debounce, cleanup
```

```bash
cd kinalyze-frontend && npm run test
```

### E2E — Playwright (36 tests)

```
kinalyze-testing/tests/
├── fixtures/auth.js     Supabase auth mock — seeds localStorage, intercepts REST
├── landing.spec.js      7 tests: brand, hero, CTA, feature cards, disclaimer, navigation
├── auth.spec.js         10 tests: UI elements, mode toggle, redirect guards
├── dashboard.spec.js    9 tests: exercises, streak, history, card navigation
└── session.spec.js      10 tests: live session phases, webcam mock, summary page
```

Auth is fully mocked — no real Supabase credentials needed to run E2E tests. Webcam is mocked via `canvas.captureStream()` with `HTMLVideoElement.prototype.videoWidth/Height` stubbed to 640×480.

```bash
cd kinalyze-testing && npx playwright test
```

**Total: 114 tests across all layers.**

---

## Deployment

### Architecture

```
GitHub (CodeOfHANA/kinalyze-backend)  ──push──►  Render (Docker, free)
                                                   https://kinalyze-backend.onrender.com

GitHub (CodeOfHANA/kinalyze-frontend) ──push──►  Vercel (static, CDN)
                                                   https://kinalyze-frontend.vercel.app

supabase/ (this repo)  ──config push──►  Supabase (Ireland)
                                          yappwsmyykbbsmfuxdfw.supabase.co
```

Render auto-deploys on every push to `main` of the backend repo.
Vercel auto-deploys on every push to `main` of the frontend repo.

### Environment Variables Summary

**Render (backend):**

| Variable | Description |
|---|---|
| `SUPABASE_JWT_SECRET` | Legacy JWT Secret from Supabase → Project Settings → Data API → JWT Settings |
| `ALLOWED_ORIGINS` | Frontend URL, no trailing slash: `https://kinalyze-frontend.vercel.app` |
| `ENVIRONMENT` | `production` (set in render.yaml) |

**Vercel (frontend):**

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key (safe to expose) |
| `VITE_API_URL` | Backend URL: `https://kinalyze-backend.onrender.com` |

**Supabase Edge Function secret:**

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key — set via `supabase secrets set`, never in any repo |

### Re-deploying from scratch

Full step-by-step redeploy instructions are in the individual repo READMEs:
- Backend: `kinalyze-backend/README.md` → "Redeploying from a New Account"
- Frontend: `kinalyze-frontend/README.md` → "Redeploying from a New Account"

---

## Security Design

| Concern | Implementation |
|---|---|
| Secret scanning | gitleaks pre-commit hook in all repos; blocks commits containing API keys, JWTs, or credentials |
| API authentication | Every `/analyze` request verified with PyJWT (HS256, Supabase Legacy JWT Secret) |
| CORS | Explicit allowlist (`ALLOWED_ORIGINS`); wildcard `*` never used in production |
| Rate limiting | `/analyze` 30 req/min, `/exercises*` 60 req/min per IP (slowapi) |
| Groq API key | Stored as Supabase Edge Function secret; never in browser bundle or any repo |
| Supabase anon key | Safe to expose — Row Level Security enforces data access per user |
| No video storage | Webcam frames processed in-memory, never written to disk or database |
| Input validation | 2MB image cap on uploads; exercise ID validated against whitelist |
| Docs disabled in production | `/docs` and `/redoc` only available when `ENVIRONMENT=development` |
| Database RLS | All Supabase tables have Row Level Security — users read/write only their own rows |

---

## KPIs

| Metric | Target | Status |
|---|---|---|
| Pose estimation accuracy | ≥ 90% correct joint classification | Pending user testing |
| Feedback latency P95 | < 200ms | ~100ms measured locally |
| Feedback helpfulness | ≥ 4/5 user rating | Pending user testing |
| Auth success rate | ≥ 95% | Anecdotal: confirmed working |
| Session completion rate | ≥ 70% | Pending user testing |

---

## Medical Disclaimer

Kinalyze does not provide medical diagnosis or treatment. The feedback generated by this application is for general informational and exercise guidance purposes only. Consult a qualified physiotherapist for medical advice, diagnosis, or treatment of any injury or condition.