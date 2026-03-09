/**
 * Auth page E2E tests.
 *
 * Covers:
 *   - Auth page UI (form fields, OAuth button)
 *   - Login/signup mode toggle
 *   - Unauthenticated redirect: /dashboard → /auth
 *   - Authenticated redirect: /auth → /dashboard (via authedPage fixture)
 */

import { test as base, expect } from '@playwright/test'
import { test as authedTest, FAKE_SESSION } from './fixtures/auth.js'

// ---------------------------------------------------------------------------
// Auth page UI — no session needed
// ---------------------------------------------------------------------------

base.describe('Auth page UI', () => {
  base.beforeEach(async ({ page }) => {
    await page.goto('/auth')
  })

  base.test('shows the login heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })

  base.test('shows Continue with Google button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })

  base.test('shows email input field', async ({ page }) => {
    await expect(page.getByPlaceholder(/email/i)).toBeVisible()
  })

  base.test('shows password input field', async ({ page }) => {
    await expect(page.getByPlaceholder(/password/i)).toBeVisible()
  })

  base.test('shows Sign In submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  base.test('toggles to signup mode', async ({ page }) => {
    // There should be a link/button to switch to signup
    const toggle = page.getByRole('button', { name: /sign up|create account/i })
      .or(page.getByText(/don.t have an account/i))
    await expect(toggle.first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Auth page signup mode
// ---------------------------------------------------------------------------

base.describe('Auth page — signup mode', () => {
  base.test('switches heading to Create account when signup mode is selected', async ({ page }) => {
    await page.goto('/auth')

    // Click the toggle to switch to signup
    const toggle = page.getByRole('button', { name: /sign up|create account/i })
      .or(page.getByText(/sign up/i).and(page.getByRole('button')))
    // Find the signup toggle link/button
    const signupLink = page.locator('button, a').filter({ hasText: /sign up/i }).last()
    await signupLink.click()

    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Auth redirect — unauthenticated
// ---------------------------------------------------------------------------

base.describe('Auth redirect — unauthenticated', () => {
  base.test('visiting /dashboard without session redirects to /auth', async ({ page }) => {
    // Must navigate to the app first — can't access localStorage on about:blank
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/auth')
  })

  base.test('visiting /profile without session redirects to /auth', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/profile')
    await expect(page).toHaveURL('/auth')
  })
})

// ---------------------------------------------------------------------------
// Auth redirect — already authenticated
// ---------------------------------------------------------------------------

authedTest.describe('Auth redirect — authenticated', () => {
  authedTest('visiting /auth when already logged in redirects to /dashboard', async ({ authedPage: page }) => {
    await page.goto('/auth')
    await expect(page).toHaveURL('/dashboard')
  })
})
