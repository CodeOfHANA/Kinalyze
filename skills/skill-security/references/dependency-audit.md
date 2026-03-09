# Dependency Audit — Kinalyze

## Frontend — npm audit

```bash
cd kinalyze-frontend

# Check for high/critical CVEs (use in CI)
npm audit --audit-level=high

# Auto-fix compatible updates
npm audit fix

# Force-fix (may include breaking changes — review carefully)
npm audit fix --force
```

### Known deferred issues
- `esbuild ≤0.24.2` via `vite ^5.x` — moderate, dev server only, not exploitable in production builds. Fix requires Vite 5→6 major upgrade (breaking). Deferred to v2.

---

## Backend — pip-audit

```bash
# Install
C:\venvs\kinalyze-backend\Scripts\pip install pip-audit

# Run
C:\venvs\kinalyze-backend\Scripts\pip-audit
```

### Current state (as of 2026-03-09)
| Package | Fixed version | Status |
|---------|--------------|--------|
| python-multipart 0.0.9 | 0.0.22 | ✅ Fixed |
| starlette 0.37.2 | 0.49.1 | ✅ Fixed (via FastAPI upgrade) |
| pip 24.2 | 26.x | ✅ Upgraded |
| protobuf 4.25.8 | 5.29.6 | ⚠️ Blocked — MediaPipe pins protobuf 4.x |

### Upgrading safely
- Always pin exact versions in `requirements.txt`
- Test import + backend startup after upgrades:
  ```bash
  python -c "from app.main import app; print('OK')"
  ```
- Re-run `pip-audit` after each fix to confirm resolution

---

## Automation (CI — future)

Add to GitHub Actions on PR to main:
```yaml
- name: npm audit
  run: npm audit --audit-level=high
  working-directory: kinalyze-frontend

- name: pip-audit
  run: pip-audit
  working-directory: kinalyze-backend
```
