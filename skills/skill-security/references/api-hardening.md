# API Security Hardening — Kinalyze Backend

Three production-grade fixes implemented in `kinalyze-backend`.

---

## 1. Rate Limiting

### Why it matters
Without limits, any client can flood `/analyze` — each call runs MediaPipe on CPU,
making the backend trivially DDoS-able and expensive on paid hosting.

### Implementation
- Library: `slowapi` (FastAPI-native, wraps `limits`)
- Key function: client IP address (`get_remote_address`)
- Returns HTTP 429 with `Retry-After` header on breach

### Configured limits (env-overridable)
| Route | Default | Env var |
|-------|---------|---------|
| `POST /analyze` | 30/minute | `ANALYZE_RATE_LIMIT` |
| `GET /exercises*` | 60/minute | `EXERCISES_RATE_LIMIT` |
| `GET /health` | unlimited | — (monitoring probes) |

### Key files
- `app/limiter.py` — single shared `Limiter` instance
- `app/config.py` — `ANALYZE_RATE_LIMIT`, `EXERCISES_RATE_LIMIT`
- `app/routers/analyze.py` — `@limiter.limit(ANALYZE_RATE_LIMIT)`
- `app/routers/exercises.py` — `@limiter.limit(EXERCISES_RATE_LIMIT)`

### Before / After
```
Before: POST /analyze → no limit → abuse possible
After:  POST /analyze → 30/min per IP → 429 + Retry-After on breach
```

---

## 2. JWT Authentication

### Why it matters
Without auth, any internet user can call `/analyze` — processing arbitrary
images on your server and bypassing Supabase RLS entirely.

### Implementation
- Library: `PyJWT==2.9.0` (HS256 verification)
- Token source: Supabase session `access_token`, sent as `Authorization: Bearer <token>`
- Verification: signature + expiry; returns 401 if missing/expired/invalid

### Protected routes
| Route | Auth required |
|-------|--------------|
| `POST /analyze` | ✅ Yes — compute-intensive, user-specific |
| `GET /exercises*` | No — public catalogue data |
| `GET /health` | No — monitoring |

### Key files
- `app/dependencies.py` — `require_auth` FastAPI dependency
- `app/routers/analyze.py` — `Depends(require_auth)`

### Required env var
```
# .env (gitignored)
SUPABASE_JWT_SECRET=<raw signing secret>
```
Get from: Supabase Dashboard → Settings → API → JWT Settings → JWT Secret
This is a plain string (~64 chars), NOT the service_role key (which is itself a JWT).

### Before / After
```
Before: POST /analyze → no token check → open to anyone
After:  POST /analyze → verifies HS256 JWT → 401 if missing or invalid
```

---

## 3. CORS Configuration

### Why it matters
Wildcard CORS (`*`) lets any website make cross-origin requests to the API.
A malicious page can POST frames to `/analyze` using a victim's credentials
if the browser sends cookies or the page has stolen a JWT.

### Implementation
- No wildcard in any environment
- `ALLOWED_ORIGINS` env var controls the allowlist
- Default dev origins: `http://localhost:5173,http://localhost:5174`
- Production: set `ALLOWED_ORIGINS=https://your-app.vercel.app` in server env

### Correct settings
```python
CORSMiddleware(
    allow_origins=ALLOWED_ORIGINS,      # explicit list, never ["*"]
    allow_credentials=True,             # needed for future cookie-based auth
    allow_methods=["GET", "POST"],      # only what the API actually uses
    allow_headers=["Authorization", "Content-Type"],
)
```

### Required env var (production)
```
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Before / After
```
Before: allow_origins=["*"] in development — any origin accepted
After:  allow_origins=["http://localhost:5173", "http://localhost:5174"] — explicit list
```

---

## Pre-deploy Security Checklist

```
[ ] SUPABASE_JWT_SECRET set on server (raw signing secret, not service_role key)
[ ] ALLOWED_ORIGINS set to production frontend URL only
[ ] ANALYZE_RATE_LIMIT / EXERCISES_RATE_LIMIT reviewed for expected traffic
[ ] ENVIRONMENT=production (disables /docs endpoint)
[ ] .env file never committed (gitleaks pre-commit hook active)
[ ] pip-audit clean (or deferred issues documented)
[ ] Supabase RLS policies reviewed — users access only their own rows
```
