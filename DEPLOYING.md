# Kinalyze — Deployment Guide

Step-by-step reference for deploying and redeploying Kinalyze across all environments.

> For full local development setup, see `README.md`.
> For component-specific instructions, see `kinalyze-backend/README.md` and `kinalyze-frontend/README.md`.

---

## Architecture

```
kinalyze-backend (private repo) ──► Render  (Docker)  ── https://kinalyze-backend.onrender.com
kinalyze-frontend (private repo) ──► Vercel  (static)  ── https://kinalyze.vercel.app
supabase/ (this repo) ──────────► Supabase (Ireland)  ── Auth + DB + Edge Functions
```

Both Render and Vercel auto-deploy on every push to `main`.
Supabase config is pushed manually via the Supabase CLI.

---

## Scenario A — Routine Deployment (Normal Flow)

### Backend change → Render

```bash
cd kinalyze-backend
git add . && git commit -m "feat: ..." && git push origin main
# Render detects push → auto-redeploys → ~3 min
```

### Frontend change → Vercel

```bash
cd kinalyze-frontend
git add . && git commit -m "feat: ..." && git push origin main
# Vercel detects push → auto-redeploys → ~1 min
```

### Supabase config change (auth URLs, redirect URLs)

```bash
# 1. Edit supabase/config.toml
# 2. Push to Supabase
npx supabase config push --project-ref <your-project-ref>
# Confirm with Y when prompted
# 3. Commit the change
git add supabase/config.toml && git commit -m "chore: update supabase config" && git push origin master
```

---

## Scenario B — Redeploy (Same Account, Service Deleted)

### Backend — Render

1. Render dashboard → **New → Web Service**
2. Connect GitHub → `kinalyze-backend` repo
3. Render detects `render.yaml` → Docker, free plan, `main` branch
4. **Environment tab** → add manually:
   - `SUPABASE_JWT_SECRET` = Legacy JWT Secret *(see Finding Secrets below)*
   - `ALLOWED_ORIGINS` = `https://kinalyze.vercel.app` *(no trailing slash)*
5. Click **Create Web Service** — first build takes ~8–12 min

### Frontend — Vercel

1. Vercel dashboard → **New Project** → import `kinalyze-frontend` repo
2. Framework preset: **Vite** (auto-detected)
3. **Environment Variables** → add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = your Render URL
4. Deploy (~1 min)

---

## Scenario C — Full Redeploy (New Account)

### Step 1 — Repos

Transfer or fork `kinalyze-backend` and `kinalyze-frontend` to the new GitHub account.

### Step 2 — Supabase (reuse or create new)

**Reuse existing project:** just update OAuth redirect URLs (Step 5 below) and copy env var values to the new Render/Vercel services.

**New Supabase project:**
```bash
# Run all migrations in order
npx supabase db push --project-ref <new-ref>

# Deploy the AI coaching Edge Function
npx supabase functions deploy coaching-summary --project-ref <new-ref>

# Set the Groq API key (get one free at console.groq.com)
npx supabase secrets set GROQ_API_KEY=gsk_... --project-ref <new-ref>
```

### Step 3 — Backend (Render)

Follow Scenario B above. New env var values come from the new Supabase project.

### Step 4 — Frontend (Vercel)

Follow Scenario B above.
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from new Supabase.
`VITE_API_URL` from new Render service URL.

### Step 5 — Supabase OAuth redirect URLs

```bash
# Edit supabase/config.toml:
#   site_url = "https://<your-vercel-url>"
#   additional_redirect_urls = ["https://<your-vercel-url>", "http://localhost:5173"]

npx supabase config push --project-ref <new-ref>
```

Also: Supabase dashboard → Authentication → Providers → Google → update redirect URL.

### Step 6 — Verify

```bash
# Health
curl https://<render-url>/health
# Expected: {"status":"ok","version":"1.0.0"}

# CORS
curl -X OPTIONS https://<render-url>/exercises \
  -H "Origin: https://<vercel-url>" \
  -H "Access-Control-Request-Method: GET" -sv 2>&1 | grep access-control-allow-origin
# Expected: access-control-allow-origin: https://<vercel-url>

# JWT auth (must return 401, not 500)
curl -X POST https://<render-url>/analyze?exercise_id=squat \
  -H "Authorization: Bearer faketoken" --form "file=;type=image/jpeg"
# Expected: {"detail":"Invalid authentication token."}
# If you see "Server auth configuration error." → SUPABASE_JWT_SECRET is wrong or missing
```

---

## Scenario D — Domain / URL Change

When the Vercel URL changes (project rename or custom domain):

**Checklist — do all of these:**

- [ ] Render dashboard → `ALLOWED_ORIGINS` → new URL, no trailing slash → Save (triggers redeploy)
- [ ] `supabase/config.toml` → update `site_url` and `additional_redirect_urls`
- [ ] `npx supabase config push --project-ref <ref>`
- [ ] `kinalyze-backend/render.yaml` → update `ALLOWED_ORIGINS` value
- [ ] Update Live URLs in all three READMEs (`README.md`, `kinalyze-backend/README.md`, `kinalyze-frontend/README.md`)
- [ ] Commit and push all three repos

---

## Finding Secrets

### Supabase JWT Secret (for Render `SUPABASE_JWT_SECRET`)

1. Supabase dashboard → left sidebar → **Project Settings** (gear icon)
2. Left menu → **Data API**
3. Scroll to **JWT Settings**
4. Copy **Legacy JWT Secret** — plain ~64-char string
> Use **Legacy JWT Secret**, NOT the anon or service_role keys (those start with `eyJ` and are JWTs, not signing secrets)

### Supabase Project URL + Anon Key (for Vercel)

1. Supabase dashboard → **Project Settings** → **Data API**
2. **Project URL** → `VITE_SUPABASE_URL`
3. **Project API Keys → anon / public** → `VITE_SUPABASE_ANON_KEY`

---

## Known Gotchas

| Issue | Fix |
|---|---|
| CORS returning 400/403 | Check `ALLOWED_ORIGINS` — must be exact URL with no trailing slash |
| `render.yaml` env var not applying | `render.yaml` only sets vars when a service is first created. Update existing services manually in Render dashboard |
| JWT returning 500 instead of 401 | `SUPABASE_JWT_SECRET` is missing or set to the anon/service_role key instead of the Legacy JWT Secret |
| First Render build very slow | Normal — MediaPipe install is ~450MB. Subsequent builds are ~3 min |
| Render free tier cold start | Service sleeps after 15 min idle. First request can take 30–60s |
| Supabase config push not prompting | Pipe `Y`: `echo "Y" \| npx supabase config push --project-ref <ref>` |
