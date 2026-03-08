---
name: skill-fastapi
description: >
  All FastAPI backend patterns for kinalyze-backend. Use this skill whenever building or
  editing any FastAPI route, middleware, CORS config, error handler, request validation,
  or Supabase JWT verification in the Python backend. Trigger on: "build the API",
  "add an endpoint", "set up CORS", "verify auth token", "add rate limiting",
  "handle errors", "structure the app", or any Python backend task in kinalyze-backend.
  Also use when wiring the /analyze, /exercises, or /coaching-summary endpoints.
---

# skill-fastapi — Kinalyze Backend

## Reference Map

| Task | File |
|------|------|
| App structure, CORS, middleware, startup | `references/app-structure.md` |
| Supabase JWT auth verification | `references/auth.md` |
| Rate limiting with slowapi | `references/rate-limiting.md` |

---

## Absolute Rules

1. **Never hardcode secrets** — always `os.getenv()` + `.env` file via `python-dotenv`
2. **Always validate input size** — check file uploads before processing
3. **Always return typed responses** — use Pydantic models for all endpoints
4. **CORS must be explicit** — list allowed origins, never use `*` in production
5. **All routes get error handling** — use `HTTPException` not bare `raise`
6. **Async where I/O bound** — `async def` for DB calls; sync ok for CPU-bound MediaPipe

---

## Pydantic Response Models

```python
# app/models/responses.py
from pydantic import BaseModel
from typing import Optional

class LandmarkData(BaseModel):
    x: float
    y: float
    visibility: float
    incorrect: bool = False
    angle: Optional[float] = None

class FeedbackData(BaseModel):
    message: str
    isCorrect: bool
    repCompleted: bool
    joint: Optional[str] = None
    angle: Optional[float] = None
    speedWarning: bool = False
    confidence: str = "high"   # high | low

class AnalyzeResponse(BaseModel):
    landmarks: Optional[list[LandmarkData]]
    feedback: FeedbackData

class ExerciseModel(BaseModel):
    id: str
    name: str
    muscle_group: str
    difficulty: str
    description: str

class HealthResponse(BaseModel):
    status: str
    version: str
```

---

## Environment Variables

```python
# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
PORT = int(os.getenv("PORT", "8000"))
```

```env
# .env (gitignored)
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
ALLOWED_ORIGINS=http://localhost:5173,https://vpa.vercel.app
ENVIRONMENT=development
```

---

## Reference Files

- **`references/app-structure.md`** — Full app layout, startup, CORS, routers, health check
- **`references/auth.md`** — Supabase JWT verification middleware, protected routes
- **`references/rate-limiting.md`** — `slowapi` setup, per-user and per-IP limits
