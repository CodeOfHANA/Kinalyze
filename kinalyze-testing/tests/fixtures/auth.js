/**
 * Shared auth fixture for Playwright E2E tests.
 *
 * Mocks Supabase auth and REST API calls so tests run without real credentials.
 * This covers the full auth lifecycle the app uses:
 *   1. supabase.auth.getSession()  — App.jsx on mount
 *   2. supabase.auth.getUser()     — Dashboard.jsx on mount
 *   3. supabase.auth.onAuthStateChange — App.jsx subscription
 *   4. REST: sessions + profiles   — Dashboard.jsx data fetch
 */

import { test as base } from '@playwright/test'

// ---------------------------------------------------------------------------
// Fake data
// ---------------------------------------------------------------------------

export const FAKE_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'test@kinalyze.com',
  user_metadata: { full_name: 'Test User' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00Z',
}

export const FAKE_SESSION = {
  access_token: 'fake-access-token',
  refresh_token: 'fake-refresh-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: FAKE_USER,
}

export const MOCK_EXERCISES = [
  { id: 'squat',    name: 'Squat',    muscle_group: 'Quadriceps, Glutes & Hamstrings', difficulty: 'Intermediate' },
  { id: 'arm_lift', name: 'Arm Lift', muscle_group: 'Shoulders & Upper Back',          difficulty: 'Beginner' },
  { id: 'lunge',    name: 'Lunge',    muscle_group: 'Quadriceps, Glutes & Hamstrings', difficulty: 'Intermediate' },
]

// Supabase project ref → localStorage key
const SUPABASE_STORAGE_KEY = 'sb-yappwsmyykbbsmfuxdfw-auth-token'

// ---------------------------------------------------------------------------
// Fixture: authedPage
// Extends the base `page` fixture with all mocks pre-configured.
// ---------------------------------------------------------------------------

export const test = base.extend({
  /**
   * `authedPage` — a page with:
   *   - Supabase localStorage session pre-seeded
   *   - All Supabase auth/REST API calls intercepted and mocked
   *   - /exercises intercepted to return MOCK_EXERCISES
   */
  authedPage: async ({ page }, use) => {
    // 1. Seed session into localStorage BEFORE the page JS runs
    await page.addInitScript(
      ({ key, session }) => localStorage.setItem(key, JSON.stringify(session)),
      { key: SUPABASE_STORAGE_KEY, session: FAKE_SESSION }
    )

    // 2. Mock Supabase auth token refresh
    await page.route('**/auth/v1/token**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FAKE_SESSION),
      })
    )

    // 3. Mock Supabase auth user endpoint
    await page.route('**/auth/v1/user**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FAKE_USER),
      })
    )

    // 4. Mock Supabase REST: sessions table (empty history)
    await page.route('**/rest/v1/sessions**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    )

    // 5. Mock Supabase REST: profiles table
    await page.route('**/rest/v1/profiles**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: FAKE_USER.id, current_streak: 3, longest_streak: 7 }),
      })
    )

    // 6. Mock backend exercises endpoint
    await page.route('**/exercises', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_EXERCISES),
      })
    )

    // 7. Mock individual exercise endpoints
    await page.route('**/exercises/**', route => {
      const url = route.request().url()
      const id = url.split('/exercises/')[1]?.split('?')[0]
      const exercise = MOCK_EXERCISES.find(e => e.id === id)
        ?? MOCK_EXERCISES[0]
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(exercise),
      })
    })

    await use(page)
  },
})

export { expect } from '@playwright/test'
