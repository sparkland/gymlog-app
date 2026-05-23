/**
 * Copy Previous Set — E2E Tests
 *
 * Settings › Sessions › Set Logging › "Copy previous set values" toggle.
 *
 * When OFF (default):
 *   Opening the Log Set modal for a second set starts with blank fields —
 *   reps and weight are NOT pre-filled from the previous set.
 *
 * When ON:
 *   Opening the Log Set modal for a second set pre-fills reps and weight
 *   (or plates count + plates mode) from the most recently logged set for
 *   that exercise.
 *
 * Exercise: Bench Press (ex-s-01, strength, trackWeight=true)
 * Exercise: Pull-Up    (ex-s-04, strength, trackWeight=false) — reps-only variant
 */

const { test, expect } = require('@playwright/test');
const { skipOnboarding, STORAGE_KEYS, startSession, addExerciseToSession } = require('../helpers');

const SESSION_PREFS_KEY = 'gym_session_prefs';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Seed gym_session_prefs before the page initialises. */
async function seedSessionPrefs(page, overrides = {}) {
  const defaults = { exerciseHistory: ['last'], copyPreviousSet: false };
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: SESSION_PREFS_KEY, value: { ...defaults, ...overrides } });
}

/** Wait for a modal to gain the 'open' class. */
async function waitForModalOpen(page, id) {
  await page.waitForFunction(
    (modalId) => document.getElementById(modalId)?.classList.contains('open'),
    id
  );
}

/** Wait for a modal to lose the 'open' class. */
async function waitForModalClosed(page, id) {
  await page.waitForFunction(
    (modalId) => !document.getElementById(modalId)?.classList.contains('open'),
    id
  );
}

/**
 * Log one set for the first exercise card in the session.
 * Fills reps and (optionally) weight before submitting.
 */
async function logSet(page, { reps, weight, plates } = {}) {
  await page.locator('.btn-add-set').first().click();
  await waitForModalOpen(page, 'modal-log-set');

  if (reps !== undefined) {
    await page.locator('#set-reps').fill(String(reps));
  }

  if (plates !== undefined) {
    // Switch to plates mode (uncheck the weight toggle)
    await page.locator('#set-weight-mode-toggle + .toggle-thumb').click();
    await page.locator('#set-weight').fill(String(plates));
  } else if (weight !== undefined) {
    await page.locator('#set-weight').fill(String(weight));
  }

  await page.locator('#btn-log-set').click();
  await waitForModalClosed(page, 'modal-log-set');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Copy Previous Set', () => {

  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  // ── Setting OFF ─────────────────────────────────────────────────────────────

  test.describe('Setting OFF (default)', () => {

    test('weight and reps fields are blank when opening a second set', async ({ page }) => {
      await seedSessionPrefs(page, { copyPreviousSet: false });
      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');

      // Log first set: 10 reps @ 60 kg
      await logSet(page, { reps: 10, weight: 60 });

      // Open second set modal
      await page.locator('.btn-add-set').first().click();
      await waitForModalOpen(page, 'modal-log-set');

      // Both fields must be empty — previous values must NOT be copied
      await expect(page.locator('#set-reps')).toHaveValue('');
      await expect(page.locator('#set-weight')).toHaveValue('');
    });

    test('reps field is blank for a second set on a bodyweight exercise', async ({ page }) => {
      await seedSessionPrefs(page, { copyPreviousSet: false });
      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Pull-Up'); // no weight tracking

      // Log first set: 8 reps
      await logSet(page, { reps: 8 });

      // Open second set modal
      await page.locator('.btn-add-set').first().click();
      await waitForModalOpen(page, 'modal-log-set');

      // Reps must be blank
      await expect(page.locator('#set-reps')).toHaveValue('');
      // Weight group should be hidden for bodyweight exercises
      await expect(page.locator('#set-weight-group')).not.toBeVisible();
    });

  });

  // ── Setting ON ──────────────────────────────────────────────────────────────

  test.describe('Setting ON', () => {

    test('weight and reps are pre-filled from the previous set', async ({ page }) => {
      await seedSessionPrefs(page, { copyPreviousSet: true });
      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');

      // Log first set: 10 reps @ 60 kg
      await logSet(page, { reps: 10, weight: 60 });

      // Open second set modal
      await page.locator('.btn-add-set').first().click();
      await waitForModalOpen(page, 'modal-log-set');

      // Both fields must be pre-filled with previous set's values
      await expect(page.locator('#set-reps')).toHaveValue('10');
      await expect(page.locator('#set-weight')).toHaveValue('60');

      // Weight mode toggle must still be in weight mode (not plates)
      await expect(page.locator('#set-weight-mode-toggle')).toBeChecked();
    });

    test('plates count and plates mode are pre-filled from the previous set', async ({ page }) => {
      await seedSessionPrefs(page, { copyPreviousSet: true });
      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');

      // Log first set in plates mode: 8 reps @ 5 plates
      await logSet(page, { reps: 8, plates: 5 });

      // Open second set modal
      await page.locator('.btn-add-set').first().click();
      await waitForModalOpen(page, 'modal-log-set');

      // Toggle must be unchecked (plates mode active)
      await expect(page.locator('#set-weight-mode-toggle')).not.toBeChecked();

      // Reps and plates count must be pre-filled
      await expect(page.locator('#set-reps')).toHaveValue('8');
      await expect(page.locator('#set-weight')).toHaveValue('5');
    });

    test('reps are pre-filled for a bodyweight exercise', async ({ page }) => {
      await seedSessionPrefs(page, { copyPreviousSet: true });
      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Pull-Up');

      // Log first set: 12 reps
      await logSet(page, { reps: 12 });

      // Open second set modal
      await page.locator('.btn-add-set').first().click();
      await waitForModalOpen(page, 'modal-log-set');

      // Reps must be pre-filled; weight group remains hidden
      await expect(page.locator('#set-reps')).toHaveValue('12');
      await expect(page.locator('#set-weight-group')).not.toBeVisible();
    });

    test('third set copies from the second set, not the first', async ({ page }) => {
      await seedSessionPrefs(page, { copyPreviousSet: true });
      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');

      // First set: 10 reps @ 60 kg
      await logSet(page, { reps: 10, weight: 60 });

      // Second set: 8 reps @ 70 kg (different values)
      await logSet(page, { reps: 8, weight: 70 });

      // Open third set modal — should copy from the second set
      await page.locator('.btn-add-set').first().click();
      await waitForModalOpen(page, 'modal-log-set');

      await expect(page.locator('#set-reps')).toHaveValue('8');
      await expect(page.locator('#set-weight')).toHaveValue('70');
    });

    test('pre-fill does not carry over to a different exercise in the same session', async ({ page }) => {
      await seedSessionPrefs(page, { copyPreviousSet: true });
      await page.goto('/');
      await startSession(page, 'CrossFit');

      // Add two exercises
      await addExerciseToSession(page, 'Bench Press');
      await addExerciseToSession(page, 'Squat');

      // Log a set on Bench Press: 10 reps @ 80 kg
      await page.locator('.active-exercise-card', { hasText: 'Bench Press' })
        .locator('.btn-add-set').click();
      await waitForModalOpen(page, 'modal-log-set');
      await page.locator('#set-reps').fill('10');
      await page.locator('#set-weight').fill('80');
      await page.locator('#btn-log-set').click();
      await waitForModalClosed(page, 'modal-log-set');

      // Open the first set modal for Squat (a different exercise — no previous set)
      await page.locator('.active-exercise-card', { hasText: 'Squat' })
        .locator('.btn-add-set').click();
      await waitForModalOpen(page, 'modal-log-set');

      // Squat has no sets yet — fields must be blank
      await expect(page.locator('#set-reps')).toHaveValue('');
      await expect(page.locator('#set-weight')).toHaveValue('');
    });

  });

  // ── UI toggle in Settings ────────────────────────────────────────────────────

  test('toggling the setting on in Settings › Sessions takes effect immediately', async ({ page }) => {
    // Start with the setting OFF
    await seedSessionPrefs(page, { copyPreviousSet: false });
    await page.goto('/');

    // Enable Copy Previous Set via the Settings UI
    await page.locator('[data-nav="settings"]').click();
    await page.locator('.settings-row[data-nav="sessions-settings"]').click();
    await page.locator('#view-sessions-settings.view--active').waitFor();
    // Click the visible toggle thumb (native checkbox is display:none)
    await page.locator('#sl-copy-prev-set + .toggle-thumb').click();
    await expect(page.locator('#sl-copy-prev-set')).toBeChecked();

    // Go back to home and run a session
    await page.locator('[data-nav="home"]').click();
    await startSession(page, 'CrossFit');
    await addExerciseToSession(page, 'Bench Press');

    // Log a set
    await logSet(page, { reps: 6, weight: 100 });

    // Open second set modal — should now be pre-filled
    await page.locator('.btn-add-set').first().click();
    await waitForModalOpen(page, 'modal-log-set');

    await expect(page.locator('#set-reps')).toHaveValue('6');
    await expect(page.locator('#set-weight')).toHaveValue('100');
  });

});
