# PRD: Kinalyze — AI Physiotherapy Coach
**Version:** 1.1 | **Status:** Draft | **Team:** 4 members, VTU BAD685

---

## 📝 Abstract

Kinalyze is a browser-based AI application that uses computer vision and pose estimation to guide general users through preventive physiotherapy exercises at home. Using only a standard webcam, the system captures the user's body movements in real time, compares them against research-validated reference models, and delivers instant visual and text-based corrective feedback. Users authenticate via email or Google OAuth, and their session history is persisted in Supabase for progress tracking. The core differentiator is an aesthetically polished, interactive UI combined with body-type inclusive pose analysis — zero installation, no expensive hardware, no physiotherapist required.

---

## 🎯 Business Objectives

- Enable self-guided preventive exercise with real-time AI correction, reducing dependency on professional supervision
- Deliver a production-grade, visually compelling web app that demonstrates full-stack AI + CV capabilities for academic evaluation
- Establish USP around body-type inclusivity, browser accessibility, and premium UX — differentiating from subscription-based competitors (Kaia Health, Hinge Health)
- Build a reusable, modular codebase (3 repos + Claude Code skills) that can be extended post-submission
- Lay the foundation for telemedicine integration, mobile deployment, and LLM-powered coaching in v2

---

## 📊 KPI

| GOAL | METRIC | TARGET |
|------|--------|--------|
| Technical accuracy | Pose estimation accuracy | ≥ 90% correct joint classification across test scenarios |
| Real-time usability | Feedback latency | P50 < 100ms, P95 < 200ms on target hardware |
| User satisfaction | Feedback helpfulness rating | ≥ 4 out of 5 in user testing sessions |
| Onboarding | Auth success rate | ≥ 95% of test users complete signup without support |
| Engagement | Session completion rate | ≥ 70% of started sessions completed |

---

## 🏆 Success Criteria

- System correctly classifies correct/incorrect posture for all 3 exercises in ≥ 90% of test cases
- Real-time skeleton overlay and text feedback renders without perceptible lag on Intel i5 / 16GB RAM
- Auth flow (email + Google OAuth) works end-to-end in Chrome, Firefox, and Edge
- Session history is persisted per user in Supabase and visible on the dashboard
- At least 5 test users rate feedback helpfulness ≥ 4/5
- UI receives positive comments on visual design and interactivity from examiner demo
- Disclaimer visible on landing page; no medical claims made anywhere in the app

---

## 🚶 User Journeys

**Journey 1 — New User Onboarding**
Priya visits the app for the first time. She sees a polished landing page with an animated hero section. She signs up with Google in one click, lands on her personal dashboard, and immediately sees 3 exercise cards. She picks "Arm Lift," reads the quick tips overlay, and starts her first session.

**Journey 2 — Returning User Exercise Session**
Ravi opens the app, logs in, and goes straight to his dashboard. He sees his last session accuracy (78%) and a nudge to improve his elbow angle. He starts a Squat session. The system overlays his skeleton in real time, highlights his knee in red, and shows "Bend knee to at least 90°." After finishing, his new score (85%) is saved and his streak updates.

**Journey 3 — Edge Case — Poor Lighting**
Aisha starts a session in a dimly lit room. The system detects low MediaPipe confidence and shows a warm banner: "Lighting looks low — try facing a window for better tracking." She adjusts and the session proceeds normally.

---

## 📖 Scenarios

1. **Correct form:** All joints within threshold → green overlay, "Great form! Keep it up."
2. **Single joint error:** Elbow angle too low during arm lift → red highlight on elbow, "Raise your right arm higher — aim for 90°."
3. **Multiple joint errors:** System prioritizes the most critical joint; shows one correction at a time to avoid overwhelming the user.
4. **Too fast:** Movement velocity exceeds analysis threshold → "Slow down — move at a steady pace for accurate feedback."
5. **Low confidence:** MediaPipe confidence < 0.6 → feedback paused, lighting/distance warning shown.
6. **Session summary:** User sees per-joint accuracy, overall score, top 2 improvement tips, and comparison to previous session.
7. **First session (no history):** Dashboard shows onboarding tips instead of progress stats.
8. **Auth — Google OAuth:** One-click Google login, redirects to dashboard.
9. **Auth — Email:** Email + password signup with email verification.

---

## 🕹️ User Flow

**Happy Path — Authenticated Exercise Session**

1. User lands on marketing/landing page
2. User clicks "Get Started" → Auth screen (Google OAuth or Email)
3. On success → Personal dashboard (exercise library + session history + streak)
4. User selects exercise card (Arm Lift / Leg Raise / Squat)
5. Exercise detail screen: instructions, tips, animated reference GIF
6. User clicks "Start Session" → webcam permission prompt
7. Live session screen: webcam feed + skeleton overlay + real-time feedback panel
8. System analyzes joint angles per frame → renders visual + text corrections
9. User completes rep set → session ends automatically or user clicks "Finish"
10. Summary screen: accuracy score, per-joint breakdown, improvement tips, save to Supabase
11. User returns to dashboard — history updated, streak incremented

**Key Alternative Flows**
- Webcam denied → friendly error screen with fix instructions, option to watch demo instead
- Low confidence → warning banner mid-session, feedback paused until resolved
- User exits mid-session → partial session not saved (v1 assumption); dashboard unchanged

---

## 🧰 Functional Requirements

| SECTION | SUB-SECTION | USER STORY & EXPECTED BEHAVIORS | SCREENS |
|---------|-------------|----------------------------------|---------|
| Auth | Google OAuth | As a user, I want one-click Google login so onboarding is frictionless. Supabase OAuth redirect; on success creates user profile row. | Auth screen |
| Auth | Email + Password | As a user, I want email signup so I don't need a Google account. Supabase email auth; email verification required before dashboard access. | Auth screen |
| Auth | Session persistence | As a user, I want to stay logged in across visits. Supabase JWT refresh token; auto-login on return visit. | All screens |
| Dashboard | Exercise Library | As a user, I want to see all available exercises so I can choose what to do. 3 exercise cards with name, muscle group, difficulty badge, and last score. | Dashboard |
| Dashboard | Session History | As a user, I want to see my past performance so I can track progress. Table/chart of last 5 sessions per exercise; accuracy trend line. | Dashboard |
| Exercise Detail | Instructions | As a user, I want to understand the exercise before starting. Animated reference GIF, key tips, target joint angles listed. | Exercise Detail |
| Live Session | Skeleton Overlay | As a user, I want to see my body tracked so I know the system is working. MediaPipe 17-point landmark overlay rendered on canvas over webcam feed. | Live Session |
| Live Session | Real-time Feedback | As a user, I want instant correction so I can adjust mid-exercise. Joint color coding (green/red); text feedback panel; single message at a time; latency < 200ms. | Live Session |
| Live Session | Speed Warning | As a user, I want a warning if I move too fast. Velocity check per frame; overlay banner if threshold exceeded. | Live Session |
| Live Session | Low Confidence Warning | As a user, I want to know if tracking is unreliable. If confidence < 0.6 → pause feedback, show lighting/distance banner. | Live Session |
| Session Summary | Accuracy Report | As a user, I want a post-session summary so I know how I did. Overall score %, per-joint accuracy, top 2 tips, save to Supabase. | Summary screen |
| Profile | User Profile | As a user, I want to see my profile and stats. Display name, email, total sessions, average accuracy, current streak. | Profile screen |

---

## 📐 Model Requirements

The AI layer is split into two distinct layers with different tools, latency profiles, and rollout phases.

### AI Architecture Overview

```
Webcam frames
    ↓
[Layer 1] MediaPipe BlazePose — real-time per-frame pose estimation
    → 33 3D joint landmarks + confidence scores
    ↓
Angle calculation + threshold comparison (NumPy / custom logic)
    → Feedback strings + per-joint accuracy scores
    ↓
Supabase — persist session results as structured JSON
    ↓
[Layer 2 — v2 only] Groq API (Llama 3.3 70B) or Claude API
    → Natural language coaching summary from session JSON
```

---

### Layer 1 — Pose Estimation (v1, Core)

| SPECIFICATION | REQUIREMENT | RATIONALE |
|---------------|-------------|-----------|
| Framework | MediaPipe Pose (BlazePose GHUM) | Pre-trained, real-time, 33 3D landmarks, Python + JS support, runs on CPU |
| Modality | Video frames (webcam) | Single input source; no audio or text needed for core CV function |
| Inference mode | Real-time, per-frame (detector-tracker pipeline) | Detector runs once on first frame; tracker handles subsequent frames — keeps latency low |
| Fine tuning | Not required | Angle threshold approach; no model training needed for v1 |
| Confidence threshold | ≥ 0.6 per keypoint | Below this, feedback suppressed to avoid false corrections |
| Latency target | P50 < 100ms, P95 < 200ms | Real-time feel on target hardware (Intel i5, 16GB RAM) |
| Body type generalization | Normalize by limb length ratios | Compute joint angles relative to body proportions — core USP |
| Reference model format | JSON threshold files per exercise | Lightweight, human-readable, version-controllable in `kinalyze-data` repo |
| Fallback option | MoveNet Lightning (TF.js) | If MediaPipe Python backend latency exceeds target, switch to client-side MoveNet — 17 keypoints, equally fast |

**Why not Groq Vision / GPT-4V for pose:** Vision LLM APIs process one image per API call with a network round-trip. At 30fps this would require 30 API calls/second — architecturally incompatible with < 200ms real-time feedback. Wrong tool for this layer.

---

### Layer 2 — AI Coaching Summaries (v2, Optional Enhancement)

Triggered once per session completion, not per frame. Input is structured session JSON (accuracy scores, joint corrections, session history) — not video.

| SPECIFICATION | REQUIREMENT | RATIONALE |
|---------------|-------------|-----------|
| Provider | Groq API (primary) or Claude API (alternative) | Groq offers sub-second inference on Llama 3.3 70B; generous free tier; familiar from IngredIQ stack |
| Model | Llama 3.3 70B (Groq) or claude-sonnet-4-6 (Claude) | Both handle structured JSON input → natural language output well |
| Trigger | Post-session, on summary screen load | Not real-time; one call per completed session |
| Input | Session JSON: `{exercise, overall_accuracy, joint_results[], history[]}` | Structured data only — no video, no PII |
| Output | 3–4 sentence coaching summary + top 2 improvement tips | Markdown-safe plain text; displayed on summary screen |
| Latency | < 3 seconds acceptable | Not real-time; user is on summary screen, slight delay is fine |
| Hallucination tolerance | Low — output is motivational/coaching, not medical | Add system prompt guardrail: "You are a fitness coach. Do not make medical claims." |
| Cost | ~$0.01–0.05 per session (Groq free tier initially) | Negligible for academic use; monitor if scaling |
| v1 fallback | Rule-based summary strings if Layer 2 not wired in | Ensures summary screen works without LLM dependency in v1 |

---

## 🧮 Data Requirements

### Pose Reference Dataset Pipeline

**Step 1 — Research (NotebookLM + Obsidian)**
- Ingest physiotherapy papers, exercise science literature, and clinical guidelines into NotebookLM
- Extract validated joint angle ranges for each exercise (e.g., correct squat: knee 80–100°, hip 85–100°)
- Document findings in Obsidian as structured notes per exercise
- Output: `research_angles.md` per exercise in `kinalyze-data` repo

**Step 2 — Public Dataset Augmentation (Kaggle)**
- Source: Yoga-82, fitness pose datasets, or closest exercise analogues available on Kaggle
- Extract MediaPipe landmarks from dataset images/videos using batch processing script
- Output: CSV of landmark coordinates + computed angle values per sample

**Step 3 — Threshold Derivation**
- Combine research angles (Step 1) with empirical data (Step 2)
- Define min/max acceptable angle per joint per exercise phase with ±5° tolerance band
- Encode as `{exercise}_model.json`:

```json
{
  "exercise": "arm_lift",
  "phases": [
    {
      "phase": "raised",
      "joints": [
        { "name": "right_elbow", "min_angle": 80, "max_angle": 100 },
        { "name": "right_shoulder", "min_angle": 85, "max_angle": 95 }
      ]
    }
  ]
}
```

**Step 4 — Validation**
- Team members perform exercises; MediaPipe extracts live angles
- Compare live angles to threshold JSON; adjust tolerances as needed
- Target: 20 correct-form + 10 incorrect-form samples per exercise for offline eval

### Supabase Schema (v1)

```sql
-- Users (managed by Supabase Auth)
users: id, email, display_name, created_at

-- Sessions
sessions: id, user_id, exercise_id, started_at, completed_at, overall_accuracy

-- Joint Results (per session)
joint_results: id, session_id, joint_name, accuracy_pct, correction_count

-- Exercises (static reference data)
exercises: id, name, muscle_group, difficulty, description, reference_model_path
```

- Supabase RLS enabled: users access only their own session data
- Webcam feed: processed in-memory only, never stored
- No biometric raw data persisted — only computed accuracy scores

---

## 💬 Feedback Requirements

*Core feedback is rule-based (angle threshold comparison), not LLM-generated in v1.*

- **Tone:** Warm, encouraging, instructional. "Raise your right arm a little higher — aim for 90°" not "ERROR: angle out of range."
- **Specificity:** Always name the joint and direction. No generic messages.
- **Priority:** When multiple joints are incorrect, surface the most critical one first.
- **Length:** ≤ 15 words per feedback string; single message visible at a time.
- **Positive reinforcement:** All joints in range → "Great form! Keep it up."
- **v2 — LLM Coaching (Groq/Claude):** After session completes, send structured JSON to Groq API (Llama 3.3 70B) or Claude API for a 3–4 sentence natural language coaching summary. System prompt guardrail: *"You are a fitness coach. Do not make medical claims or diagnoses."* Rule-based fallback strings used in v1 if LLM layer not yet wired in.

---

## 🎨 UI/UX Requirements

**Design Philosophy:** Premium, interactive, fitness-app quality. Inspired by Apple Fitness+, Whoop, and modern health dashboards.

**Visual Requirements**
- Dark mode first with vibrant accents (electric blue / neon green for correct joints, warm red for incorrect)
- Smooth animated transitions between screens (Framer Motion)
- Skeleton overlay on HTML5 Canvas layered over webcam feed with pulse animation on joint corrections
- Exercise cards with hover animations and gradient backgrounds
- Dashboard with animated accuracy trend chart (Recharts)
- Responsive for laptop and tablet (mobile is v2)
- Loading states and skeleton screens for all async operations
- Session start countdown (3-2-1 animated overlay)
- Accessible: WCAG 2.1 contrast ratios, keyboard-navigable auth flow

---

### UI Design Toolchain

**Google Stitch** is used for rapid screen ideation, with the Stitch MCP server wired into Claude Code for a seamless design-to-code pipeline.

**Design Workflow:**
```
1. STITCH via MCP (ideation — integrated into Claude Code)
   Claude Code + stitch-mcp generates initial screen layouts
   from natural language prompts directly in the IDE.
   Exports Tailwind JSX as scaffolding baseline.
         ↓
2. FIGMA (refinement — ~2 days)
   Export Stitch output to Figma via paste-to-Figma.
   Apply dark mode, brand tokens, motion annotations.
   Team review and sign-off before build.
         ↓
3. CLAUDE CODE + kinalyze-frontend (build — weeks 3–6)
   skill-ui.md guides component patterns.
   Framer Motion + Tailwind for final polish.
   Canvas overlay and webcam integration built manually.
```

**Stitch MCP Setup** (`.mcp.json` in `kinalyze-frontend`):
```json
{
  "mcpServers": {
    "stitch": {
      "command": "npx",
      "args": ["-y", "stitch-mcp"],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

**Stitch MCP Capabilities Used:**
- Screen generation from natural language prompts per Kinalyze screen (Landing, Auth, Dashboard, Live Session, Summary)
- Design DNA extraction (fonts, colors, layouts) for cross-screen consistency
- Design token export as Tailwind config — feeds directly into `kinalyze-frontend`
- WCAG 2.1 accessibility compliance checks per generated screen
- Responsive variant generation for tablet layouts

**Why not Stitch alone:** The premium interactive elements — animated skeleton overlay, pulsing joint corrections, real-time Canvas rendering — require custom Framer Motion and HTML5 Canvas work that Stitch cannot generate. Stitch eliminates blank-canvas paralysis; Claude Code builds the real thing.

---

## 🏗️ Repository & Development Setup

### 6-Repo Structure

| Repo | Stack / Purpose | Claude Code Skills | Key MCPs |
|------|----------------|-------------------|----------|
| `kinalyze-frontend` | React + Vite + Tailwind + Framer Motion + Supabase JS | `skill-ui` | Stitch MCP |
| `kinalyze-backend` | Python + FastAPI + MediaPipe + OpenCV + NumPy | `skill-pose`, `skill-fastapi` | — |
| `kinalyze-data` | Jupyter + pandas + NotebookLM exports + JSON models | `skill-dataset` | — |
| `kinalyze-testing` | Playwright E2E + Vitest unit tests + test reports | `skill-testing` | Playwright MCP (`@playwright/mcp`) |
| `kinalyze-security` | Secret scanning, dependency audit, OWASP checks, pre-commit hooks | `skill-security` | GitHub Security Scanner MCP |
| `kinalyze-design-review` | UX review gates, Figma exports, Stitch screen approvals, visual regression | `skill-design-review` | Stitch MCP, Playwright MCP (screenshots) |

---

### Claude Code Skills Plan

| Skill File | Repo | Purpose |
|------------|------|---------|
| `skill-ui` | kinalyze-frontend | React component patterns, Stitch MCP prompts, Tailwind design system, Framer Motion, Canvas overlay |
| `skill-pose` | kinalyze-backend | MediaPipe setup, angle calculation, normalization logic |
| `skill-fastapi` | kinalyze-backend | API endpoint patterns, error handling, CORS setup |
| `skill-dataset` | kinalyze-data | Notebook patterns for landmark extraction, threshold derivation |
| `skill-testing` | kinalyze-testing | Playwright MCP E2E flows, Vitest unit test patterns, CI test strategy |
| `skill-security` | kinalyze-security | Secret scanning commands, gitleaks setup, audit workflows, edge function key masking |
| `skill-design-review` | kinalyze-design-review | UX review checklist, Playwright screenshot comparison, Figma approval gate process |
| `skill-research` | (all repos / second-brain) | NotebookLM, YouTube MCP, Obsidian vault workflows, research topic queue |

---

### 📁 Kinalyze Root Folder Structure

All repos and the Obsidian second brain live under a single `Kinalyze/` root on your machine. This keeps everything co-located and makes Claude Code project-level context aware of the full workspace.

```
Kinalyze/                          ← git root / Claude Code project root
│
├── .claude/                       ← Claude Code project config
│   ├── settings.json              ← MCP trust settings (never enableAllProjectMcpServers)
│   └── CLAUDE.md                  ← Project-level system prompt for Claude Code
│
├── .mcp.json                      ← Root-level MCP config (shared tools: GitHub, etc.)
│
├── skills/                        ← ALL Claude Code skill files live here
│   ├── skill-ui/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── skill-pose/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── skill-fastapi/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── skill-dataset/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── skill-testing/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── skill-security/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── skill-design-review/
│   │   ├── SKILL.md
│   │   └── references/
│   └── skill-research/
│       ├── SKILL.md
│       └── references/
│
├── second-brain/                  ← Obsidian vault (open this folder in Obsidian)
│   ├── .obsidian/                 ← Auto-generated by Obsidian on first open
│   ├── research/                  ← Notes from NotebookLM exports
│   ├── youtube/                   ← YouTube MCP capture notes
│   ├── decisions/                 ← Architecture Decision Records (ADRs)
│   └── weekly/                    ← Weekly knowledge review notes
│
├── kinalyze-frontend/             ← React + Vite app (GitHub repo)
├── kinalyze-backend/              ← FastAPI + MediaPipe (GitHub repo)
├── kinalyze-data/                 ← Jupyter notebooks + JSON models (GitHub repo)
├── kinalyze-testing/              ← Playwright E2E + Vitest (GitHub repo)
├── kinalyze-security/             ← Security audit scripts + configs (GitHub repo)
├── kinalyze-design-review/        ← UX gates + Figma exports (GitHub repo)
│
└── docs/                          ← Shared project docs (not a separate repo)
    ├── PRD.md                     ← This document
    └── branding/                  ← Logo, color tokens, slogan assets
```

---

### 🤖 Skill File Setup — Let Claude Code Do It

**Short answer: let Claude Code scaffold the structure for you.**

After cloning or creating the `Kinalyze/` root folder, open it in Claude Code and paste this one-time setup prompt:

```
Set up the Kinalyze project structure exactly as specified in the PRD folder tree.
Create:
- skills/ with subdirectories for all 8 skills (skill-ui, skill-pose, skill-fastapi,
  skill-dataset, skill-testing, skill-security, skill-design-review, skill-research),
  each containing an empty SKILL.md and a references/ subfolder
- second-brain/ with subdirectories: research/, youtube/, decisions/, weekly/
- docs/ directory containing a copy of PRD.md
- .claude/CLAUDE.md summarising the Kinalyze project, listing all 8 skills with their
  target repos, and stating the security rules from the PRD

Do NOT create the kinalyze-* repo folders — those will be git-cloned separately.
After creating, print a full directory tree to confirm.
```

Claude Code will scaffold everything in one shot. You then copy the pre-built skill files from the handoff package into `skills/skill-*/`.

**Why not do it manually?**
Claude Code also creates `.claude/CLAUDE.md` — the project-level context file that primes every future Claude Code session with what Kinalyze is, which skill to load for which repo, and what the security rules are. This pays dividends across hundreds of future prompts.

**The only manual step:** Open `second-brain/` as an Obsidian vault (Obsidian → File → Open Folder as Vault). Obsidian creates `.obsidian/` automatically.

---

### Playwright MCP — Testing Strategy

The official `@playwright/mcp` server is used in two modes:

**Exploratory mode (in `kinalyze-testing` via Claude Code):**
Claude Code uses Playwright MCP to interact with the live app — navigate, click, fill forms, take screenshots — then auto-generates TypeScript test files from the session. Used for generating the initial test suite from real user flows.

**CLI mode (in CI/CD pipeline):**
Generated tests run via `npx playwright test` in GitHub Actions. Token-efficient, fast, no MCP overhead needed for regression runs.

`.mcp.json` for `kinalyze-testing`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--user-data-dir=./playwright-profile"]
    }
  }
}
```

---

### Supabase Edge Functions — API Key Masking

All third-party API keys (Groq, future Claude API) are masked behind Supabase Edge Functions. Keys never exist in the browser bundle or committed config files.

```
Frontend (React)
    ↓  POST /functions/v1/coaching-summary  (Supabase JWT auth)
Supabase Edge Function (Deno runtime)
    ↓  Groq API key stored as Supabase secret (never in repo)
Groq API  →  natural language coaching summary
    ↓
Frontend displays summary
```

**Key rules:**
- `GROQ_API_KEY`, `ANTHROPIC_API_KEY` → Supabase secrets only (`supabase secrets set`)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → `.env.local` (safe to expose; protected by RLS)
- Never commit any `.env` files — enforced by `gitleaks` pre-commit hook

---

### Rate Limiting Strategy

| Layer | Mechanism | Limit |
|-------|-----------|-------|
| Supabase Edge Function | Built-in rate limiting per JWT user | 10 coaching calls/hour/user |
| FastAPI backend | `slowapi` middleware per IP | 60 analyze requests/minute |
| Supabase DB | RLS policies | Users read/write only their own rows |
| Vercel frontend | No server-side rate limit needed | Static + edge functions |

---

## ✅ Prerequisites & Full Tech Stack

### Frontend (`kinalyze-frontend`)

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Runtime |
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Framer Motion | 11 | Animations and transitions |
| Supabase JS | 2 | Auth + DB client |
| Recharts | 2 | Progress/accuracy charts |
| HTML5 Canvas API | Native | Skeleton overlay rendering |

### Backend (`kinalyze-backend`)

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | 0.110+ | REST API framework |
| MediaPipe | 0.10+ | Pose estimation |
| OpenCV | 4.9+ | Frame capture and processing |
| NumPy | 1.26+ | Angle calculations and normalization |
| Uvicorn | Latest | ASGI server |
| python-dotenv | Latest | Environment variable management |
| pytest | Latest | Unit testing |

### Data & Research (`kinalyze-data`)

| Tool | Purpose |
|------|---------|
| Jupyter Notebook | Landmark extraction, threshold derivation |
| pandas | Dataset processing and analysis |
| NotebookLM | Literature research, angle range extraction |
| Obsidian | Structured research documentation |
| Kaggle CLI | Dataset download |

### Infrastructure & Services

| Service | Purpose | Cost |
|---------|---------|------|
| Supabase (free tier) | Auth + PostgreSQL + RLS | Free |
| Vercel (free tier) | Frontend hosting | Free |
| Render / Railway (free tier) | Python API hosting | Free |
| GitHub | Version control (3 repos) | Free |
| Claude Code | AI-assisted development | Existing subscription |

### Development Tools

| Tool | Repo | Purpose |
|------|------|---------|
| VS Code | All | Primary IDE |
| Claude Code | All | AI coding with skill files |
| Stitch MCP (`stitch-mcp`) | kinalyze-frontend, kinalyze-design-review | UI screen generation from Claude Code |
| Google Stitch (web) | kinalyze-design-review | Manual screen iteration and Figma export |
| Figma | kinalyze-design-review | Design refinement and UX approval gates |
| Playwright MCP (`@playwright/mcp`) | kinalyze-testing | E2E test generation from live browser sessions |
| Playwright CLI | kinalyze-testing | CI/CD test runner (token-efficient vs MCP) |
| Vitest | kinalyze-testing | Frontend unit tests |
| pytest | kinalyze-backend | Backend unit tests |
| GitHub Security Scanner MCP | kinalyze-security | Secret detection + AI fix suggestions in Claude Code |
| gitleaks | kinalyze-security | Pre-commit hook — blocks secret commits |
| trufflehog | kinalyze-security | Deep git history secret scanning |
| `npm audit` / `pip audit` | kinalyze-security | Dependency vulnerability checks |
| Postman / Thunder Client | kinalyze-backend | API endpoint testing |
| Chrome DevTools | kinalyze-frontend | Latency profiling, webcam debugging |
| ESLint + Prettier | kinalyze-frontend | Frontend code quality |
| Black + Ruff | kinalyze-backend | Python code quality |

---

## 🧪 Testing & Measurement

**Offline Evaluation**
- 30 test videos (10 per exercise): correct/incorrect form, varied body types and lighting
- Ground truth: manual joint annotation per video
- Pass threshold: ≥ 90% classification accuracy

**Backend Unit Tests**
- Angle calculation functions against known input/output pairs
- Threshold comparison at boundary conditions
- Normalization functions across simulated body proportion variations

**Integration Tests**
- Frontend → Backend `/analyze` endpoint: correct feedback for test frames
- Supabase: session data saves correctly post-completion

**User Testing**
- 5 users, 2 exercises each, rate helpfulness 1–5
- Note false positives, missed corrections, UX confusion
- Target: average ≥ 4/5

**Performance**
- Measure latency via Chrome DevTools (target P95 < 200ms)
- Test on minimum spec hardware (Intel i5, 16GB RAM)

---

## ⚠️ Risks & Mitigations

| RISK | MITIGATION |
|------|------------|
| Low pose accuracy in poor home lighting | Confidence check on session start; warn user; suppress feedback below 0.6 threshold |
| Model fails for non-average body types | Normalize angles by limb length ratios; test across 5+ body types during validation |
| Kaggle dataset exercises don't match target poses | Cross-validate with NotebookLM literature; use research angles as primary source |
| Browser webcam API inconsistencies | Test Chrome/Firefox/Edge; use standard getUserMedia; graceful fallback messaging |
| FastAPI backend latency > 200ms | Profile and optimize; fallback to client-side MediaPipe JS if needed |
| Supabase free tier limits | Free tier supports 50,000 MAU — well within academic use; monitor dashboard |
| Auth edge cases (expired tokens, OAuth errors) | Supabase handles JWT refresh automatically; add error boundary on auth screens |

---

## 💰 Costs

**Development (v1 academic)**
- All infrastructure on free tiers — total cost: €0
- Claude Code: existing subscription

**Operational (v1)**
- Supabase free: 500MB DB, 50K MAU — sufficient
- Vercel + Render free tiers: sufficient for demo traffic

**Future (v2+)**
- LLM API for session summaries: ~$0.01–0.05/session
- Supabase Pro: $25/month
- Render paid (no cold starts): $7/month

---

## 🔗 Assumptions & Dependencies

- **(Assumption)** KPIs: ≥90% accuracy, <200ms latency, ≥4/5 helpfulness, ≥95% auth success, ≥70% session completion
- **(Assumption)** v1 covers exactly 3 exercises: Arm Lift, Leg Raise, Squat
- **(Assumption)** Feedback is visual overlay + text only; no audio in v1
- **(Assumption)** Body-type generalization via angle normalization, not additional model training
- **(Assumption)** Kaggle datasets provide usable exercise analogues; if not, team self-records validation samples
- **(Assumption)** Backend runs as Python FastAPI; fallback to client-side MoveNet Lightning (TF.js) if MediaPipe latency exceeds 200ms target
- **(Assumption)** Layer 2 LLM coaching (Groq API) is v2 only; v1 summary screen uses rule-based strings
- **(Assumption)** Groq free tier sufficient for academic use; Claude API is alternative if Groq unavailable
- **(Assumption)** Mobile is v2 scope; v1 targets laptop/desktop browsers only
- **(Assumption)** Partial sessions are not saved in v1
- **(Dependency)** Supabase free tier availability
- **(Dependency)** MediaPipe Pose Python + browser compatibility
- **(Dependency)** Kaggle dataset licensing allows academic use
- **(Dependency)** Modern browser with getUserMedia API (Chrome 60+, Firefox 55+)

---

## 🔒 Compliance / Privacy / Legal

- **No video storage:** Webcam feed processed in-memory only; no frames saved or transmitted
- **Minimal PII:** Only email, display name, and accuracy scores stored in Supabase
- **Supabase RLS:** Row Level Security enforced; users access only their own data
- **Medical disclaimer:** Landing page must show — *"This tool is for general wellness and educational purposes only. It does not provide medical diagnosis or treatment. Consult a qualified physiotherapist for medical advice."*
- **Kaggle data:** Verify license per dataset before use
- **GDPR:** Include privacy policy stub; no third-party data sharing in v1
- **Academic scope:** VTU BAD685 submission; no commercial deployment in v1

### API Security Hardening (Production-Grade — Implemented in v1)

The backend treats three vulnerabilities as non-negotiable for any publicly-accessible deployment.

#### Vulnerability 1 — Rate Limiting

**Risk:** Unlimited requests allow any client to flood `/analyze` — each call runs MediaPipe on CPU, making the backend trivially DDoS-able and creating unexpected infrastructure costs.

**Fix:** `slowapi` IP-based rate limiting on all public-facing routes.

| Route | Limit | Env var override |
|-------|-------|-----------------|
| `POST /analyze` | 30 req/min | `ANALYZE_RATE_LIMIT` |
| `GET /exercises*` | 60 req/min | `EXERCISES_RATE_LIMIT` |
| `GET /health` | unlimited | — |

Returns HTTP 429 + `Retry-After` header on breach. Limits are configurable via environment variables without code changes.

#### Vulnerability 2 — Authentication & Authorization

**Risk:** Without token verification, any internet user can call `/analyze` — processing arbitrary images on the server, bypassing Supabase RLS, and consuming backend resources.

**Fix:** Every `POST /analyze` request requires a valid Supabase JWT in `Authorization: Bearer <token>`. Verification uses `PyJWT` with HS256 and the `SUPABASE_JWT_SECRET` signing secret. Returns HTTP 401 for missing, expired, or invalid tokens.

- `/exercises*` and `/health` remain public — they expose no user data
- `SUPABASE_JWT_SECRET` = raw signing secret from Supabase Dashboard → Settings → API → JWT Settings (NOT the service_role key)
- Frontend already sends the token via `supabase.auth.getSession().access_token`

#### Vulnerability 3 — CORS Policy

**Risk:** Wildcard `*` origins allow any website to make cross-origin requests to the API. A malicious page can call `/analyze` using a victim's credentials via the browser.

**Fix:** Explicit origin allowlist in all environments — no wildcard ever.

```
Development:  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
Production:   ALLOWED_ORIGINS=https://your-app.vercel.app
```

Configured via `ALLOWED_ORIGINS` env var. `allow_methods` restricted to `["GET", "POST"]` only.

---

### Secret Management Rules

- `GROQ_API_KEY`, `ANTHROPIC_API_KEY` → Supabase secrets only, never in any repo
- `SUPABASE_JWT_SECRET` → Backend `.env` (gitignored); the raw signing secret, never a JWT token
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → `.env.local` (gitignored, safe to expose due to RLS)
- All `.env*` files in `.gitignore` across all 6 repos — enforced by `gitleaks` pre-commit hook
- Never use `enableAllProjectMcpServers: true` in `.claude/settings.json` — require explicit trust per repo

**Pre-commit Security Gate (`kinalyze-security`):**
```bash
# Install gitleaks pre-commit hook (run once per repo)
gitleaks protect --staged --config=.gitleaks.toml
# Run full history scan
trufflehog git file://. --only-verified
# Dependency audit
npm audit --audit-level=high
pip audit
```

**Claude Code MCP Safety Rules (apply across all repos):**
- Never auto-approve MCP servers via `enableAllProjectMcpServers`
- Version-pin all MCP packages in `package.json` (e.g., `"@playwright/mcp": "1.2.3"`)
- Review `.mcp.json` and `.claude/settings.json` changes in PRs with same scrutiny as executable code
- Keep `ANTHROPIC_BASE_URL` unset in all repo configs — never override it

**Note:** CVE-2025-59536 and CVE-2026-21852 (RCE and API key exfiltration via Claude Code project config files) are patched in Claude Code v1.0.87+. Ensure all team members run the latest version.

---

## 📣 GTM / Rollout Plan

| Phase | Weeks | Deliverables |
|-------|-------|-------------|
| 1 — Research & Data | 1–2 | NotebookLM angle research, Kaggle dataset processing, 3 validated JSON threshold files. Set up all 6 repos with `.gitignore`, `gitleaks` pre-commit hooks, and branch protection rules. |
| 2 — Backend | 2–4 | FastAPI scaffold, MediaPipe integration, angle logic, `pytest` unit tests, REST endpoints live. `pip audit` clean. |
| 3 — Frontend | 3–6 | Stitch MCP screen ideation → Figma design review gate (`kinalyze-design-review` sign-off) → React build with auth, dashboard, live session, summary, Supabase integration. Groq key masked behind Supabase Edge Function. |
| 4 — Integration & Polish | 6–8 | E2E test generation via Playwright MCP (`kinalyze-testing`). `trufflehog` full history scan. Framer Motion animations, Canvas overlay polish, performance optimization. Rate limiting configured. |
| 5 — Security & UX Review | 8–9 | Full security audit via `kinalyze-security` (gitleaks, npm audit, pip audit, GitHub secret scanning). UX review via `kinalyze-design-review` (Playwright screenshot comparison vs Figma). WCAG 2.1 accessibility check via Stitch MCP. |
| 6 — User Testing & Submission | 9–10 | 5-user test, feedback fixes, demo video, project report, VTU BAD685 submission. v2 roadmap documented. |

**v2 Roadmap (post-submission)**
- Mobile app (React Native)
- LLM-powered session summaries (Groq API — Llama 3.3 70B, or Claude API)
- Progress tracking with streak system
- Additional exercise library (10+ exercises)
- Telemedicine platform integration

---

*Generated via PM Discovery Session v1.1 | Items marked Assumption can be revised.*
