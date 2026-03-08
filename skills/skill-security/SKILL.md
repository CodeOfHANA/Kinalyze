---
name: skill-security
description: >
  All security auditing, secret detection, dependency scanning, and hardening tasks
  for the Kinalyze project. Use this skill for: setting up gitleaks pre-commit hooks,
  running trufflehog history scans, checking for hardcoded API keys, auditing npm/pip
  dependencies for CVEs, reviewing .mcp.json and .claude/settings.json for unsafe
  configs, verifying Supabase edge function key masking, and generating security reports.
  Trigger on: "scan for secrets", "check for leaked keys", "security audit", "run gitleaks",
  "check dependencies", "is this config safe", "review MCP settings", or before any
  production deployment or PR merge to main.
---

# skill-security — Kinalyze Security Toolkit

## Reference Map

| Task | File |
|------|------|
| Secret detection — gitleaks + trufflehog | `references/secret-scanning.md` |
| Dependency auditing — npm + pip | `references/dependency-audit.md` |
| Claude Code / MCP hardening rules | `references/mcp-hardening.md` |

---

## Security Checklist — Run Before Every PR to Main

```
Pre-commit (automated):
  [ ] gitleaks pre-commit hook passes (no secrets staged)

Per PR:
  [ ] npm audit --audit-level=high → 0 high/critical findings
  [ ] pip audit → 0 vulnerabilities
  [ ] No .env files added to git
  [ ] No API keys in source code or comments
  [ ] .mcp.json reviewed — no enableAllProjectMcpServers
  [ ] New environment variables added to .env.example (no values)

Before main merge:
  [ ] trufflehog full git history scan (on feature branch)
  [ ] GitHub Secret Scanning alerts reviewed in repo Security tab

Before production deploy:
  [ ] All API keys confirmed as Supabase secrets (not in repo)
  [ ] CORS origins locked to production domain only
  [ ] Supabase RLS policies reviewed
  [ ] Rate limiting verified in Edge Function and FastAPI
```

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
- **`references/dependency-audit.md`** — npm audit, pip audit, automated remediation patterns
- **`references/mcp-hardening.md`** — Safe .mcp.json patterns, Claude Code CVE context, settings.json rules
