# Secret Scanning — Kinalyze

## gitleaks — Pre-commit Hook

Installed via WinGet: `winget install --id Gitleaks.Gitleaks`
Version in use: 8.30.0

### Hook location (all 6 repos)
`.git/hooks/pre-commit` — runs `gitleaks protect --staged --no-banner -v`

### Manual scan (staged files only)
```bash
gitleaks protect --staged --no-banner -v
```

### Full history scan
```bash
gitleaks git --no-banner -v .
```

### If a commit is blocked
1. Identify the secret: look at gitleaks output for file + line
2. Remove it from the staged file
3. If already committed: rotate the secret immediately, then purge from git history
4. Never use `--no-verify` to bypass the hook

---

## trufflehog — Deep History Scan

Run before any PR merge to main or before production deploy.

```bash
# Install
pip install trufflehog3

# Scan git history (verified secrets only — reduces false positives)
trufflehog git file://. --only-verified

# Or via Docker
docker run --rm -v "$(pwd):/repo" trufflesecurity/trufflehog:latest git file:///repo --only-verified
```

---

## Secret Priority — What Goes Where

| Secret | Storage | Never in |
|--------|---------|---------|
| `GROQ_API_KEY` | Supabase secrets (`supabase secrets set`) | Repo, .env, frontend bundle |
| `SUPABASE_JWT_SECRET` | Backend `.env` (gitignored) | Repo, frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secrets / backend `.env` only | Repo, frontend |
| `VITE_SUPABASE_URL` | `.env.local` (gitignored, safe to expose) | Committed `.env` |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` (gitignored, safe to expose) | Committed `.env` |
| GitHub Actions secrets | Repo Settings → Secrets | Workflow YAML values |

**`SUPABASE_JWT_SECRET`** = the raw signing secret from:
Supabase Dashboard → Settings → API → JWT Settings → JWT Secret
(a plain ~64-char string — NOT the service_role key, which is itself a JWT)

---

## GitHub Secret Scanning

Enable in each repo: Settings → Security → Secret Scanning → Enable
GitHub will alert on pushed secrets matching known patterns.
