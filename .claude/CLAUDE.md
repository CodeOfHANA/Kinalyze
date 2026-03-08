# Kinalyze — Claude Code Project Context

## What is Kinalyze?
Kinalyze is a browser-based AI physiotherapy coach. It uses a standard webcam + MediaPipe pose estimation to guide users through preventive exercises (Arm Lift, Leg Raise, Squat) with real-time skeleton overlay and corrective feedback. Auth is via Supabase (Google OAuth + email). Session history is persisted in Supabase. No video is ever stored.

**Academic context:** VTU BAD685 | Team: 4 members | Version: 1.1 (Draft)

---

## Repository Structure

| Repo | Stack | Skill to Load |
|------|-------|---------------|
| `kinalyze-frontend` | React 18 + Vite + Tailwind + Framer Motion + Supabase JS | `skill-ui` |
| `kinalyze-backend` | Python + FastAPI + MediaPipe + OpenCV + NumPy | `skill-pose`, `skill-fastapi` |
| `kinalyze-data` | Jupyter + pandas + JSON threshold models | `skill-dataset` |
| `kinalyze-testing` | Playwright E2E + Vitest + pytest | `skill-testing` |
| `kinalyze-security` | gitleaks + trufflehog + npm/pip audit | `skill-security` |
| `kinalyze-design-review` | Stitch MCP + Playwright screenshots + Figma gates | `skill-design-review` |

All skill files live in `skills/skill-*/SKILL.md` at this root.

---

## Skills Reference

| Skill | Repo | Purpose |
|-------|------|---------|
| `skill-ui` | kinalyze-frontend | React component patterns, Stitch MCP prompts, Tailwind design system, Framer Motion, Canvas overlay |
| `skill-pose` | kinalyze-backend | MediaPipe setup, angle calculation, normalization logic |
| `skill-fastapi` | kinalyze-backend | API endpoint patterns, error handling, CORS setup |
| `skill-dataset` | kinalyze-data | Notebook patterns for landmark extraction, threshold derivation |
| `skill-testing` | kinalyze-testing | Playwright MCP E2E flows, Vitest unit test patterns, CI test strategy |
| `skill-security` | kinalyze-security | Secret scanning commands, gitleaks setup, audit workflows |
| `skill-design-review` | kinalyze-design-review | UX review checklist, Playwright screenshot comparison, Figma approval gate |
| `skill-research` | (all repos) | NotebookLM, YouTube MCP, Obsidian vault workflows |

---

## AI Architecture

- **Layer 1 (v1, real-time):** MediaPipe BlazePose → angle calculation → threshold comparison → rule-based feedback strings
- **Layer 2 (v2, post-session):** Groq API (Llama 3.3 70B) or Claude API (`claude-sonnet-4-6`) → natural language coaching summary from session JSON

---

## Security Rules (ENFORCE ALWAYS)

1. **API keys:** `GROQ_API_KEY`, `ANTHROPIC_API_KEY` → Supabase secrets ONLY. Never in any repo, never in `.env` files committed to git.
2. **Frontend env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → `.env.local` only (gitignored).
3. **All `.env*` files** must be in `.gitignore` across all 6 repos.
4. **gitleaks** pre-commit hook must be installed in every repo before first commit.
5. **MCP safety:** Never use `enableAllProjectMcpServers: true` in `.claude/settings.json`. Trust MCPs explicitly per repo.
6. **API keys masked:** All third-party API calls go through Supabase Edge Functions — never from the browser bundle directly.
7. **Never commit `.env` files** — if gitleaks blocks a commit, fix the secret leak; do not bypass with `--no-verify`.

---

## Key Constraints

- v1 exercises: Arm Lift, Leg Raise, Squat only
- No video storage — webcam frames processed in-memory only
- No medical claims anywhere in the app
- Landing page must show the medical disclaimer
- Mobile is v2 scope; v1 targets laptop/desktop browsers
- Partial sessions are not saved in v1
- Layer 2 LLM coaching is v2 only; v1 summary uses rule-based strings

---

## Supabase Schema (v1)

```sql
users: id, email, display_name, created_at
sessions: id, user_id, exercise_id, started_at, completed_at, overall_accuracy
joint_results: id, session_id, joint_name, accuracy_pct, correction_count
exercises: id, name, muscle_group, difficulty, description, reference_model_path
```

RLS enabled — users access only their own data.

---

## KPIs

| Metric | Target |
|--------|--------|
| Pose estimation accuracy | ≥ 90% |
| Feedback latency P95 | < 200ms |
| Feedback helpfulness | ≥ 4/5 |
| Auth success rate | ≥ 95% |
| Session completion rate | ≥ 70% |
