---
name: skill-testing
description: >
  All testing work for the Kinalyze project across kinalyze-testing repo. Use this skill for:
  generating Playwright E2E tests via MCP, writing Vitest frontend unit tests, writing
  pytest backend unit tests, setting up CI/CD test pipelines, and generating test reports.
  Trigger on: "write a test", "generate E2E test", "set up Playwright", "test the auth flow",
  "test the live session", "write unit tests for angles", "set up CI", "run tests",
  "check test coverage", or any quality assurance task across any Kinalyze repo.
---

# skill-testing — Kinalyze Test Suite

## Reference Map

| Task | File |
|------|------|
| Playwright MCP E2E test generation | `references/playwright-e2e.md` |
| Vitest frontend unit tests | `references/vitest.md` |
| pytest backend unit tests | `references/pytest.md` |
| GitHub Actions CI pipeline | `references/ci.md` |

---

## Testing Pyramid for Kinalyze

```
         E2E (Playwright)
         ─────────────
         ~10 key flows
        /              \
    Integration          Visual
    (API tests)       (Screenshot diff)
   ────────────       ──────────────────
      ~20 tests           ~5 screens
      /
  Unit Tests (Vitest + pytest)
  ────────────────────────────
          ~50 tests
```

## Key Test Scenarios (must all pass before submission)

**Auth flows**
- [ ] Email signup → verification → login
- [ ] Google OAuth redirect and dashboard load
- [ ] Invalid credentials shows error
- [ ] Session persists on refresh

**Exercise session**
- [ ] Webcam permission denied → shows WebcamError component
- [ ] Exercise card click → navigates to detail page
- [ ] Session start → countdown appears → session active
- [ ] Feedback panel updates on pose change
- [ ] Speed warning banner appears and dismisses
- [ ] Session finish → summary screen with score

**Data persistence**
- [ ] Session saves to Supabase after completion
- [ ] Dashboard shows updated history after session
- [ ] Accuracy score displayed correctly

**Backend**
- [ ] `/health` returns 200
- [ ] `/analyze` rejects files > 2MB
- [ ] `/analyze` returns feedback for valid frame
- [ ] Angle calculation correct for known inputs
- [ ] Rate limit triggers after threshold

---

## Reference Files

- **`references/playwright-e2e.md`** — Playwright MCP setup, slash commands, E2E test patterns
- **`references/vitest.md`** — Vitest config, component tests, hook tests
- **`references/pytest.md`** — pytest patterns for FastAPI, pose logic unit tests
- **`references/ci.md`** — GitHub Actions workflow for all test types
