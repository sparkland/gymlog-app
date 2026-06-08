/**
 * Progression Targets E2E Tests
 *
 * Covers:
 *  - Double Progression: one qualifying session triggers the recommendation banner
 *  - 2-for-2 Rule: two consecutive qualifying sessions trigger the banner;
 *                  one qualifying session alone does NOT
 *  - Rep Range mode (useRepRange=true):
 *      • session with insufficient within-range sets does NOT trigger
 *      • session with enough within-range sets DOES trigger
 *
 * Exercise used throughout: Bench Press (ex-s-01, strength, trackWeight=true)
 * Target: 3 sets × 12 reps max @ 60 kg, +2.5 kg increase
 */

const { test, expect } = require('@playwright/test');
const { skipOnboarding, STORAGE_KEYS, startSession, addExerciseToSession } = require('../helpers');

const PROGRESSION_KEY = 'gym_progression_settings';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Wait for a modal to gain the 'open' class (CSS transform, not display). */
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

/** Seed gym_progression_settings before the page initialises. */
async function seedProgressionSettings(page, overrides = {}) {
  const defaults = {
    enabled:        true,
    method:         'double-progression',
    useRepRange:    false,
    targetRepsMin:  8,
    targetRepsMax:  12,
    targetSets:     3,
    increaseAmount: 2.5,
    increasePlates: false,
  };
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROGRESSION_KEY, value: { ...defaults, ...overrides } });
}

/**
 * Seed an array of completed sessions into gym_sessions.
 * Replaces any existing seeded sessions.
 */
async function seedSessions(page, sessions) {
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: STORAGE_KEYS.SESSIONS, value: sessions });
}

/**
 * Build a completed session object containing one Bench Press exercise.
 * @param {string} id     - unique session id
 * @param {string} date   - YYYY-MM-DD
 * @param {Array}  sets   - array of set objects, e.g. [{ reps:12, weight:60, weightUnit:'kg' }]
 */
function makeBenchSession(id, date, sets) {
  return {
    id,
    sessionTypeId:    'default-10',
    sessionTypeName:  'CrossFit',
    sessionTypeEmoji: '💪',
    sessionSubtypeId:   null,
    sessionSubtypeName: null,
    date,
    startTime:        '09:00',
    endTime:          '10:00',
    durationSeconds:  3600,
    notes:            '',
    exercises: [{
      exerciseId:   'ex-s-01',
      exerciseName: 'Bench Press',
      exerciseType: 'strength',
      sets,
    }],
  };
}

/** 3 sets that all hit or exceed targetRepsMax (12) — always qualifies in both modes. */
const QUALIFYING_SETS = [
  { reps: 12, weight: 60, weightUnit: 'kg' },
  { reps: 12, weight: 60, weightUnit: 'kg' },
  { reps: 12, weight: 60, weightUnit: 'kg' },
];

/**
 * Finish the active session, handling the confirm modal that appears when
 * exercises have been logged.
 */
async function finishSession(page) {
  await page.locator('#btn-finish-session').click();
  const confirmOpen = await page.evaluate(
    () => document.getElementById('modal-finish-confirm')?.classList.contains('open')
  );
  if (confirmOpen) {
    await page.locator('#btn-finish-confirm').click();
  }
  await page.locator('#view-home.view--active').waitFor();
}

/**
 * Open the Log Set modal for the first exercise card in the session.
 * Returns after the modal is confirmed open.
 */
async function openLogSetModal(page) {
  await page.locator('.btn-add-set').first().click();
  await waitForModalOpen(page, 'modal-log-set');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Progression Targets', () => {

  // ── Double Progression ──────────────────────────────────────────────────────

  test.describe('Double Progression', () => {

    test('banner appears after one qualifying session', async ({ page }) => {
      // Seed: progression enabled (double-progression) + one qualifying session
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: 'double-progression' });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', QUALIFYING_SETS),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      // Banner must be visible
      const hint = page.locator('#set-progression-hint');
      await expect(hint).toBeVisible();

      // Must name the correct method
      await expect(hint).toContainText('Double Progression');

      // Must suggest the increased weight (60 + 2.5 = 62.5)
      await expect(hint).toContainText('62.5');

      // Weight field must be pre-filled with the recommendation
      await expect(page.locator('#set-weight')).toHaveValue('62.5');
    });

    test('banner does not appear when the last session did not meet the criteria', async ({ page }) => {
      // Only 2 qualifying sets (need 3) — should NOT trigger
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: 'double-progression' });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', [
          { reps: 12, weight: 60, weightUnit: 'kg' },
          { reps: 12, weight: 60, weightUnit: 'kg' },
          { reps: 10, weight: 60, weightUnit: 'kg' }, // only 10 reps — doesn't hit max
        ]),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      await expect(page.locator('#set-progression-hint')).not.toBeVisible();
    });

    test('ℹ️ info button opens the explanation popup', async ({ page }) => {
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: 'double-progression' });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', QUALIFYING_SETS),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      await expect(page.locator('#set-progression-hint')).toBeVisible();

      // Click the info button
      await page.locator('.set-progression-info-btn').click();
      await waitForModalOpen(page, 'modal-progression-info');

      // Info modal must mention Double Progression and the target reps
      const detail = page.locator('#progression-info-detail');
      await expect(detail).toContainText('Double Progression');
      await expect(detail).toContainText('12');

      // Dismiss
      await page.locator('#btn-close-progression-info').click();
      await waitForModalClosed(page, 'modal-progression-info');

      // Log-set modal should still be open behind it
      const logSetOpen = await page.evaluate(
        () => document.getElementById('modal-log-set').classList.contains('open')
      );
      expect(logSetOpen).toBe(true);
    });

  });

  // ── 2-for-2 Rule ────────────────────────────────────────────────────────────

  test.describe('2-for-2 Rule', () => {

    test('banner appears after two consecutive qualifying sessions', async ({ page }) => {
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: '2-for-2' });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-20', QUALIFYING_SETS), // older
        makeBenchSession('s2', '2026-05-22', QUALIFYING_SETS), // most recent
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      const hint = page.locator('#set-progression-hint');
      await expect(hint).toBeVisible();
      await expect(hint).toContainText('2-for-2');
      await expect(hint).toContainText('62.5');
      await expect(page.locator('#set-weight')).toHaveValue('62.5');
    });

    test('banner does NOT appear after only one qualifying session', async ({ page }) => {
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: '2-for-2' });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', QUALIFYING_SETS), // only one session
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      await expect(page.locator('#set-progression-hint')).not.toBeVisible();
    });

    test('banner does NOT appear when only the most recent session qualifies (older does not)', async ({ page }) => {
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: '2-for-2' });
      await seedSessions(page, [
        // Older session: only 2 of 3 sets meet criteria
        makeBenchSession('s1', '2026-05-20', [
          { reps: 12, weight: 60, weightUnit: 'kg' },
          { reps: 12, weight: 60, weightUnit: 'kg' },
          { reps: 8,  weight: 60, weightUnit: 'kg' }, // 8 < 12 — doesn't qualify
        ]),
        // Most recent session: all 3 sets qualify
        makeBenchSession('s2', '2026-05-22', QUALIFYING_SETS),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      await expect(page.locator('#set-progression-hint')).not.toBeVisible();
    });

  });

  // ── Rep Range mode ──────────────────────────────────────────────────────────

  test.describe('Double Progression — Use Rep Range', () => {

    test('banner does NOT appear when qualifying set count within range is below target', async ({ page }) => {
      // useRepRange=true, range 8–12
      // Session has 3 sets but only 2 fall within 8–12 (third is 15 reps, out of range)
      await skipOnboarding(page);
      await seedProgressionSettings(page, {
        method:      'double-progression',
        useRepRange: true,
        targetRepsMin: 8,
        targetRepsMax: 12,
        targetSets:  3,
      });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', [
          { reps: 10, weight: 60, weightUnit: 'kg' }, // in range ✓
          { reps: 11, weight: 60, weightUnit: 'kg' }, // in range ✓
          { reps: 15, weight: 60, weightUnit: 'kg' }, // above max — out of range ✗
        ]),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      await expect(page.locator('#set-progression-hint')).not.toBeVisible();
    });

    test('banner appears when enough sets fall within the min–max rep range', async ({ page }) => {
      // useRepRange=true, range 8–12
      // Session has 3 sets all within 8–12 → meets target of 3 qualifying sets
      await skipOnboarding(page);
      await seedProgressionSettings(page, {
        method:      'double-progression',
        useRepRange: true,
        targetRepsMin: 8,
        targetRepsMax: 12,
        targetSets:  3,
      });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', [
          { reps: 8,  weight: 60, weightUnit: 'kg' }, // min boundary ✓
          { reps: 10, weight: 60, weightUnit: 'kg' }, // mid range   ✓
          { reps: 12, weight: 60, weightUnit: 'kg' }, // max boundary ✓
        ]),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      const hint = page.locator('#set-progression-hint');
      await expect(hint).toBeVisible();
      await expect(hint).toContainText('Double Progression');
      await expect(hint).toContainText('62.5');
      await expect(page.locator('#set-weight')).toHaveValue('62.5');
    });

    test('info popup mentions the rep range when useRepRange is on', async ({ page }) => {
      await skipOnboarding(page);
      await seedProgressionSettings(page, {
        method:      'double-progression',
        useRepRange: true,
        targetRepsMin: 8,
        targetRepsMax: 12,
        targetSets:  3,
      });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', [
          { reps: 9,  weight: 60, weightUnit: 'kg' },
          { reps: 10, weight: 60, weightUnit: 'kg' },
          { reps: 11, weight: 60, weightUnit: 'kg' },
        ]),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      await expect(page.locator('#set-progression-hint')).toBeVisible();
      await page.locator('.set-progression-info-btn').click();
      await waitForModalOpen(page, 'modal-progression-info');

      // Should describe the range rather than just "12+ reps"
      await expect(page.locator('#progression-info-detail')).toContainText('8–12');
      await expect(page.locator('#progression-info-detail')).toContainText('rep range');
    });

  });

  // ── Plate Weight Progression ─────────────────────────────────────────────────

  test.describe('Plate Weight Progression', () => {

    /** 3 sets at 5 plates × 12 reps — qualifies under default rep/set targets. */
    const QUALIFYING_PLATES_SETS = [
      { reps: 12, weight: 5, weightUnit: 'plates' },
      { reps: 12, weight: 5, weightUnit: 'plates' },
      { reps: 12, weight: 5, weightUnit: 'plates' },
    ];

    test('banner appears with +1 plate recommendation (Double Progression)', async ({ page }) => {
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: 'double-progression', increasePlates: true });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', QUALIFYING_PLATES_SETS),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      const hint = page.locator('#set-progression-hint');
      await expect(hint).toBeVisible();
      await expect(hint).toContainText('Double Progression');
      // Reference was 5 plates → recommendation must be 5 + 1 = 6
      await expect(hint).toContainText('6');
      await expect(page.locator('#set-weight')).toHaveValue('6');
    });

    test('banner does NOT appear for plates exercises when increasePlates is disabled', async ({ page }) => {
      await skipOnboarding(page);
      // increasePlates defaults to false — plates exercises skipped entirely
      await seedProgressionSettings(page, { method: 'double-progression' });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', QUALIFYING_PLATES_SETS),
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      await expect(page.locator('#set-progression-hint')).not.toBeVisible();
    });

    test('banner appears with +1 plate after two consecutive qualifying sessions (2-for-2)', async ({ page }) => {
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: '2-for-2', increasePlates: true });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-20', QUALIFYING_PLATES_SETS), // older
        makeBenchSession('s2', '2026-05-22', QUALIFYING_PLATES_SETS), // most recent
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      const hint = page.locator('#set-progression-hint');
      await expect(hint).toBeVisible();
      await expect(hint).toContainText('2-for-2');
      await expect(hint).toContainText('6');
      await expect(page.locator('#set-weight')).toHaveValue('6');
    });

    test('kg exercises still receive their configured increase when increasePlates is enabled', async ({ page }) => {
      // Regression guard: enabling increasePlates must not affect kg recommendations
      await skipOnboarding(page);
      await seedProgressionSettings(page, { method: 'double-progression', increasePlates: true });
      await seedSessions(page, [
        makeBenchSession('s1', '2026-05-22', QUALIFYING_SETS), // kg sets from the shared constant
      ]);

      await page.goto('/');
      await startSession(page, 'CrossFit');
      await addExerciseToSession(page, 'Bench Press');
      await openLogSetModal(page);

      const hint = page.locator('#set-progression-hint');
      await expect(hint).toBeVisible();
      // 60 kg + 2.5 kg increase = 62.5
      await expect(hint).toContainText('62.5');
      await expect(page.locator('#set-weight')).toHaveValue('62.5');
    });

  });

  // ── Feature disabled ─────────────────────────────────────────────────────────

  test('banner is hidden when Progression Targets feature is disabled', async ({ page }) => {
    await skipOnboarding(page);
    await seedProgressionSettings(page, { enabled: false });
    await seedSessions(page, [
      makeBenchSession('s1', '2026-05-22', QUALIFYING_SETS),
    ]);

    await page.goto('/');
    await startSession(page, 'CrossFit');
    await addExerciseToSession(page, 'Bench Press');
    await openLogSetModal(page);

    await expect(page.locator('#set-progression-hint')).not.toBeVisible();
  });

});
