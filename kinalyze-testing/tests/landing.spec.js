/**
 * Landing page E2E tests — no auth required.
 *
 * Tests that the public landing page loads correctly and key
 * content/navigation elements are present.
 */

import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('loads successfully (no redirect)', async ({ page }) => {
    await expect(page).toHaveURL('/')
  })

  test('shows the Kinalyze brand name', async ({ page }) => {
    await expect(page.getByText(/kinalyze/i).first()).toBeVisible()
  })

  test('shows the hero heading', async ({ page }) => {
    // The hero has large display text describing the product
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('shows a Get Started or Sign In call-to-action', async ({ page }) => {
    const cta = page.getByRole('link', { name: /get started|sign in|start/i }).first()
    await expect(cta).toBeVisible()
  })

  test('shows the three feature cards', async ({ page }) => {
    // Feature cards show: Real-time, 20 Exercises, AI Coaching
    // Use .first() to avoid matching duplicate text elsewhere on the page
    await expect(page.getByText('Real-time').first()).toBeVisible()
    await expect(page.getByText('20 Exercises').first()).toBeVisible()
    await expect(page.getByText('AI Coaching').first()).toBeVisible()
  })

  test('shows the medical disclaimer', async ({ page }) => {
    // Actual text: "does not provide medical diagnosis or treatment. Consult a qualified physiotherapist for medical advice."
    await expect(page.getByText(/qualified physiotherapist/i)).toBeVisible()
  })

  test('CTA navigates to /auth', async ({ page }) => {
    const cta = page.getByRole('link', { name: /get started|sign in|start/i }).first()
    await cta.click()
    await expect(page).toHaveURL('/auth')
  })
})
