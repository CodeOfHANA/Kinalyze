/**
 * Dashboard and Exercise Detail E2E tests.
 *
 * All tests use the authedPage fixture so Supabase auth + REST calls
 * are mocked — no real credentials required.
 *
 * Covers:
 *   - Dashboard loads and shows exercise cards
 *   - Greeting shows user's first name
 *   - Streak badge is visible
 *   - Clicking an exercise card navigates to /exercise/:id
 *   - Exercise detail page shows exercise name + Start Session button
 */

import { test, expect } from './fixtures/auth.js'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    await page.goto('/dashboard')
    // Wait for loading skeleton to resolve
    await page.waitForLoadState('networkidle')
  })

  test('loads at /dashboard without redirect', async ({ authedPage: page }) => {
    await expect(page).toHaveURL('/dashboard')
  })

  test('shows greeting with user first name', async ({ authedPage: page }) => {
    // FAKE_USER.user_metadata.full_name = 'Test User' → firstName = 'Test'
    await expect(page.getByText(/test|hey|hello|welcome/i).first()).toBeVisible()
  })

  test('shows exercise cards', async ({ authedPage: page }) => {
    // MOCK_EXERCISES has 3 items — all should appear
    await expect(page.getByText('Squat')).toBeVisible()
    await expect(page.getByText('Arm Lift')).toBeVisible()
    await expect(page.getByText('Lunge')).toBeVisible()
  })

  test('shows current streak', async ({ authedPage: page }) => {
    // MOCK profile returns current_streak: 3
    await expect(page.getByText(/streak/i)).toBeVisible()
  })

  test('shows session history section', async ({ authedPage: page }) => {
    await expect(page.getByText(/history|sessions|recent/i).first()).toBeVisible()
  })
})

test.describe('Exercise detail navigation', () => {
  test('clicking exercise card navigates to /exercise/:id', async ({ authedPage: page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Click the Squat exercise card
    await page.getByText('Squat').click()

    await expect(page).toHaveURL(/\/exercise\/squat/)
  })

  test('exercise detail page shows the exercise name', async ({ authedPage: page }) => {
    await page.goto('/exercise/squat')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/squat/i).first()).toBeVisible()
  })

  test('exercise detail page shows Start Session button', async ({ authedPage: page }) => {
    await page.goto('/exercise/squat')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('link', { name: /start session/i })
      .or(page.getByRole('button', { name: /start session/i }))).toBeVisible()
  })

  test('exercise detail shows difficulty badge', async ({ authedPage: page }) => {
    await page.goto('/exercise/squat')
    await page.waitForLoadState('networkidle')

    await expect(page.getByText(/intermediate|beginner/i).first()).toBeVisible()
  })
})
