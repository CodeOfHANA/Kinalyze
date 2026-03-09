// @ts-check
import { defineConfig, devices } from '@playwright/test'

/**
 * Kinalyze Playwright E2E configuration.
 *
 * Prerequisites before running:
 *   cd kinalyze-frontend && npm run dev          (frontend on :5173)
 *   cd kinalyze-backend  && uvicorn ... --port 8001  (optional — mocked in most tests)
 *
 * Run: npx playwright test
 * Run headed: npx playwright test --headed
 * Run single file: npx playwright test tests/landing.spec.js
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Suppress webcam permission dialogs — not relevant in E2E
    permissions: ['camera', 'microphone'],
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
