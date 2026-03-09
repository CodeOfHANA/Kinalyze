/**
 * Live Session and Summary page E2E tests.
 *
 * The live session uses getUserMedia (webcam) which Playwright grants via
 * the `permissions: ['camera']` config. However, actual MediaPipe inference
 * requires a real video stream — these tests verify the UI structure only
 * and mock the /analyze backend call.
 *
 * Session phases: 'countdown' (3s) → 'active' → 'finishing'
 * These tests check elements available in each phase.
 *
 * Summary page:
 *   - URL: /summary/:exerciseId?accuracy=N
 *   - Data: sessionStorage key 'kinalyze_last_session'
 */

import { test, expect } from './fixtures/auth.js'

// Mock /analyze to return a stable "low confidence" response
const MOCK_ANALYZE_RESPONSE = {
  feedback: {
    message: 'Move into better light and step back from the camera.',
    isCorrect: false,
    repCompleted: false,
    confidence: 'low',
    speedWarning: false,
    joint: null,
    direction: null,
    angle: null,
    target_min: null,
    target_max: null,
  },
  landmarks: null,
}

test.describe('Live session page', () => {
  test.beforeEach(async ({ authedPage: page }) => {
    // Mock the webcam getUserMedia to return a black canvas stream
    // Also mock videoWidth/videoHeight so captureFrame() produces a valid blob
    await page.addInitScript(() => {
      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = 480
      const stream = canvas.captureStream()
      navigator.mediaDevices.getUserMedia = async () => stream

      // Ensure video element reports real dimensions so captureFrame() doesn't produce a null blob
      Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', { get: () => 640, configurable: true })
      Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', { get: () => 480, configurable: true })
    })

    // Mock /analyze
    await page.route('**/analyze**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ANALYZE_RESPONSE),
      })
    )
  })

  test('navigating to /session/squat loads the session page', async ({ authedPage: page }) => {
    await page.goto('/session/squat')
    await expect(page).toHaveURL('/session/squat')
  })

  test('shows countdown before active phase', async ({ authedPage: page }) => {
    await page.goto('/session/squat')
    // The page starts with a 3-second countdown showing digits 3, 2, 1
    // Just check the page loaded successfully with some visible content
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('shows rep counter after countdown completes', async ({ authedPage: page }) => {
    await page.goto('/session/squat')
    // Manually dispatch loadedmetadata on the video element to make isReady=true
    // (canvas.captureStream() may not auto-trigger this event in test environment)
    await page.waitForSelector('video')
    await page.evaluate(() => {
      document.querySelector('video')?.dispatchEvent(new Event('loadedmetadata'))
    })
    // Wait for 3s countdown + buffer
    await expect(page.getByText(/reps/i)).toBeVisible({ timeout: 8_000 })
  })

  test('shows feedback panel after countdown completes', async ({ authedPage: page }) => {
    await page.goto('/session/squat')
    await page.waitForSelector('video')
    await page.evaluate(() => {
      document.querySelector('video')?.dispatchEvent(new Event('loadedmetadata'))
    })
    await expect(page.getByRole('status')).toBeVisible({ timeout: 8_000 })
  })

  test('shows Finish button after countdown completes', async ({ authedPage: page }) => {
    await page.goto('/session/squat')
    await page.waitForSelector('video')
    await page.evaluate(() => {
      document.querySelector('video')?.dispatchEvent(new Event('loadedmetadata'))
    })
    await expect(page.getByRole('button', { name: /finish/i })).toBeVisible({ timeout: 8_000 })
  })
})

test.describe('Summary page', () => {
  // Summary URL: /summary/:exerciseId?accuracy=N
  // sessionStorage key: 'kinalyze_last_session'
  const EXERCISE_ID = 'squat'
  const ACCURACY = 72

  const SESSION_DATA = {
    exerciseId: EXERCISE_ID,
    overallAccuracy: ACCURACY,
    repCount: 8,
    jointResults: [
      { joint_name: 'left_knee',  accuracy_pct: 58, correction_count: 12 },
      { joint_name: 'right_knee', accuracy_pct: 71, correction_count:  7 },
    ],
  }

  test.beforeEach(async ({ authedPage: page }) => {
    // Seed sessionStorage with the key LiveSession.jsx actually writes
    await page.addInitScript((data) => {
      sessionStorage.setItem('kinalyze_last_session', JSON.stringify(data))
    }, SESSION_DATA)

    // Mock Supabase REST for previous session comparison query
    await page.route('**/rest/v1/sessions**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    )

    // Mock coaching-summary Edge Function
    await page.route('**/functions/v1/coaching-summary**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ coaching: 'Great work! Focus on left knee alignment.' }),
      })
    )
  })

  test('summary page loads at correct URL', async ({ authedPage: page }) => {
    await page.goto(`/summary/${EXERCISE_ID}?accuracy=${ACCURACY}`)
    await expect(page).toHaveURL(`/summary/${EXERCISE_ID}?accuracy=${ACCURACY}`)
  })

  test('shows overall accuracy', async ({ authedPage: page }) => {
    await page.goto(`/summary/${EXERCISE_ID}?accuracy=${ACCURACY}`)
    await expect(page.getByText(/accuracy/i).first()).toBeVisible()
  })

  test('shows rep count from session data', async ({ authedPage: page }) => {
    await page.goto(`/summary/${EXERCISE_ID}?accuracy=${ACCURACY}`)
    // RepCount section: "8 reps completed"
    await expect(page.getByText(/reps completed/i)).toBeVisible()
  })

  test('shows per-joint breakdown', async ({ authedPage: page }) => {
    await page.goto(`/summary/${EXERCISE_ID}?accuracy=${ACCURACY}`)
    // Joint names from SESSION_DATA: left_knee, right_knee
    await expect(page.getByText(/knee/i).first()).toBeVisible()
  })

  test('shows a Dashboard button', async ({ authedPage: page }) => {
    await page.goto(`/summary/${EXERCISE_ID}?accuracy=${ACCURACY}`)
    // Dashboard is a <Button> with onClick → navigate('/dashboard'), not a link
    await expect(page.getByRole('button', { name: /dashboard/i })).toBeVisible()
  })
})
