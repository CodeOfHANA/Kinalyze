---
name: skill-security
description: >
  All security auditing, secret detection, dependency scanning, and hardening tasks
  for the Kinalyze project. Use this skill for: setting up gitleaks pre-commit hooks,
  running trufflehog history scans, checking for hardcoded API keys, auditing npm/pip
  dependencies for CVEs, reviewing .mcp.json and .claude/settings.json for unsafe
  configs, verifying Supabase edge function key masking, enforcing rate limiting,
  JWT authentication, and CORS policy. Trigger on: "scan for secrets", "check for
  leaked keys", "security audit", "run gitleaks", "check dependencies", "is this
  config safe", "review MCP settings", "rate limiting", "authentication", "CORS",
  or before any production deployment or PR merge to main.
---

# skill-security — Kinalyze Security Toolkit

## Reference Map

| Task | File |
|------|------|
| Secret detection — gitleaks + trufflehog | `references/secret-scanning.md` |
| Dependency auditing — npm + pip | `references/dependency-audit.md` |
| API hardening — rate limiting, auth, CORS | `references/api-hardening.md` |

---

## Security Checklist — Run Before Every PR to Main

```
Pre-commit (automated):
  [ ] gitleaks pre-commit hook passes (no secrets staged)

Per PR:
  [ ] npm audit --audit-level=high → 0 high/critical findings
  [ ] pip audit → 0 vulnerabilities (or all deferred items documented)
  [ ] No .env files added to git
  [ ] No API keys in source code or comments
  [ ] .mcp.json reviewed — no enableAllProjectMcpServers
  [ ] New environment variables added to .env.example (no values)

Before main merge:
  [ ] trufflehog full git history scan (on feature branch)
  [ ] GitHub Secret Scanning alerts reviewed in repo Security tab

Before production deploy:
  [ ] All API keys confirmed as Supabase secrets (not in repo)
  [ ] CORS origins locked to production domain only (ALLOWED_ORIGINS env var)
  [ ] SUPABASE_JWT_SECRET set on server (raw signing secret, not service_role key)
  [ ] Rate limits reviewed — ANALYZE_RATE_LIMIT, EXERCISES_RATE_LIMIT
  [ ] Supabase RLS policies reviewed
  [ ] ENVIRONMENT=production set (disables /docs endpoint)
```

---

## Three Critical API Vulnerabilities — Fixed in v1

See `references/api-hardening.md` for full implementation detail.

### 1. Rate Limiting (`slowapi` + IP-based)
- `POST /analyze`: 30 req/min (CPU-heavy, configurable via `ANALYZE_RATE_LIMIT`)
- `GET /exercises*`: 60 req/min (configurable via `EXERCISES_RATE_LIMIT`)
- Returns HTTP 429 + `Retry-After` on breach
- Key files: `app/limiter.py`, `app/config.py`, route decorators

### 2. JWT Authentication (`PyJWT` + Supabase HS256)
- `POST /analyze` requires valid Supabase JWT (`Authorization: Bearer <token>`)
- `GET /exercises*` and `GET /health` remain public
- Returns HTTP 401 if missing, expired, or signature invalid
- Key files: `app/dependencies.py`, `app/routers/analyze.py`
- **Critical**: `SUPABASE_JWT_SECRET` must be the raw signing secret from Supabase Dashboard → Settings → API → JWT Settings. NOT the service_role key.

### 3. CORS Policy (strict allowlist)
- No wildcard `*` in any environment
- `ALLOWED_ORIGINS` env var: default `http://localhost:5173,http://localhost:5174`
- Production: set `ALLOWED_ORIGINS=https://your-app.vercel.app`
- Key file: `app/main.py`

---

## Secret Priority — What Goes Where

| Secret | Storage | Never in |
|--------|---------|---------|
| `GROQ_API_KEY` | Supabase secrets (`supabase secrets set`) | Repo, .env, frontend |
| `SUPABASE_JWT_SECRET` | Backend .env (gitignored) | Repo, frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets | Repo, frontend |
| `VITE_SUPABASE_URL` | .env.local (gitignored, safe to expose) | Committed .env |
| `VITE_SUPABASE_ANON_KEY` | .env.local (gitignored, safe to expose) | Committed .env |
| GitHub Actions secrets | Repo Settings → Secrets | Workflow YAML values |

---

## Reference Files

- **`references/secret-scanning.md`** — gitleaks install, pre-commit setup, trufflehog scan, GitHub Secret Scanning
- **`references/dependency-audit.md`** — npm audit, pip audit, automated remediation patterns, current CVE status
- **`references/api-hardening.md`** — rate limiting, JWT auth, CORS — implementations, before/after, pre-deploy checklist
