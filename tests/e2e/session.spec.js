const { test, expect } = require('@playwright/test');
const {
  skipOnboarding,
  getStorage,
  STORAGE_KEYS,
  selectSessionType,
  startSession,
  addExerciseToSession,
} = require('../helpers');

/** Wait for a modal to open (gains 'open' class). Modals use CSS transform, not display. */
async function waitForModalOpen(page, id) {
  await page.waitForFunction(
    (modalId) => document.getElementById(modalId).classList.contains('open'),
    id
  );
}

/** Wait for a modal to close (loses 'open' class). */
async function waitForModalClosed(page, id) {
  await page.waitForFunction(
    (modalId) => !document.getElementById(modalId).classList.contains('open'),
    id
  );
}

test.describe('Session flow', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
    await page.goto('/');
  });

  // ── Type selection ──────────────────────────────────────────────

  test('Start Session button is disabled until a type is selected', async ({ page }) => {
    await expect(page.locator('#btn-start-session')).toBeDisabled();
    await selectSessionType(page, 'CrossFit');
    await expect(page.locator('#btn-start-session')).toBeEnabled();
  });

  test('selecting a type with subtypes shows subtype pills', async ({ page }) => {
    await selectSessionType(page, 'Running');
    await expect(page.locator('#subtype-pills')).toBeVisible();
    await expect(page.locator('#subtype-pills')).toContainText('Outdoor');
    await expect(page.locator('#subtype-pills')).toContainText('Treadmill');
  });

  // ── Starting a session ─────────────────────────────────────────

  test('starting a session shows session view and hides nav', async ({ page }) => {
    await startSession(page, 'CrossFit');

    await expect(page.locator('#view-session')).toHaveClass(/view--active/);
    // Nav uses opacity:0 + pointer-events:none when .hidden — not display:none
    await expect(page.locator('#bottom-nav')).toHaveClass(/hidden/);
    await expect(page.locator('#timer-display')).toBeVisible();

    const active = await getStorage(page, STORAGE_KEYS.ACTIVE);
    expect(active).not.toBeNull();
    // Active session stores sessionTypeId (name is resolved at finish time)
    expect(active.sessionTypeId).toBe('default-10'); // CrossFit
  });

  // ── Exercise logging ───────────────────────────────────────────

  test('adding an exercise shows a card in the session', async ({ page }) => {
    await startSession(page);
    await addExerciseToSession(page, 'Pull-Up');

    await expect(page.locator('#session-exercises-list .active-exercise-card')).toBeVisible();
    await expect(page.locator('#session-exercises-list')).toContainText('Pull-Up');
  });

  test('Add Exercise modal filter pills show without clipping or scrollbars', async ({ page }) => {
    await startSession(page);
    await page.locator('#btn-add-exercise-to-session').click();
    await waitForModalOpen(page, 'modal-pick-exercise');

    const container = page.locator('#pick-exercise-filter-pills');
    const pills = container.locator('.filter-pill');

    // All three pills must be present and visible
    await expect(pills).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(pills.nth(i)).toBeVisible();
    }

    // Helper: assert no horizontal scrollbar and no vertical top-clipping
    async function assertNoBadOverflow() {
      const hasHScroll = await page.evaluate(() => {
        const el = document.getElementById('pick-exercise-filter-pills');
        return el.scrollWidth > el.clientWidth;
      });
      expect(hasHScroll, 'horizontal scrollbar should not be present').toBe(false);

      const topClipped = await page.evaluate(() => {
        const el  = document.getElementById('pick-exercise-filter-pills');
        const box = el.getBoundingClientRect();
        return Array.from(el.querySelectorAll('.filter-pill')).some(pill => {
          // Allow 2px for sub-pixel rounding
          return pill.getBoundingClientRect().top < box.top - 2;
        });
      });
      expect(topClipped, 'no pill should be clipped at the top of the container').toBe(false);
    }

    // Check initial (All) state
    await assertNoBadOverflow();

    // Cycle through each filter and re-check
    for (const filter of ['strength', 'cardio', 'all']) {
      await page.locator(`#pick-exercise-filter-pills [data-filter="${filter}"]`).click();
      await assertNoBadOverflow();
    }
  });

  test('logging a strength set saves and displays the set row', async ({ page }) => {
    await startSession(page);
    await addExerciseToSession(page, 'Pull-Up');

    await page.locator('.btn-add-set').click();
    await waitForModalOpen(page, 'modal-log-set');

    // Pull-Up is strength — reps field should be visible
    await expect(page.locator('#set-reps')).toBeVisible();
    await page.locator('#set-reps').fill('12');
    await page.locator('#btn-log-set').click();

    await waitForModalClosed(page, 'modal-log-set');
    await expect(page.locator('#session-exercises-list')).toContainText('12 reps');
  });

  test('log set validation shows toast when reps is empty', async ({ page }) => {
    await startSession(page);
    await addExerciseToSession(page, 'Pull-Up');

    await page.locator('.btn-add-set').click();
    await waitForModalOpen(page, 'modal-log-set');

    // Click Log Set without filling reps
    await page.locator('#btn-log-set').click();

    await expect(page.locator('#toast')).toBeVisible();
    await expect(page.locator('#toast')).toContainText('Please enter a reps value');

    // Modal should remain open
    const isOpen = await page.evaluate(() =>
      document.getElementById('modal-log-set').classList.contains('open')
    );
    expect(isOpen).toBe(true);
  });

  test('set survives a page reload mid-session', async ({ page }) => {
    await startSession(page);
    await addExerciseToSession(page, 'Pull-Up');

    await page.locator('.btn-add-set').click();
    await waitForModalOpen(page, 'modal-log-set');
    await page.locator('#set-reps').fill('8');
    await page.locator('#btn-log-set').click();
    await waitForModalClosed(page, 'modal-log-set');

    // Reload — app should restore from gym_active_session
    await page.reload();
    await expect(page.locator('#view-session')).toHaveClass(/view--active/);
    await expect(page.locator('#session-exercises-list')).toContainText('Pull-Up');
    await expect(page.locator('#session-exercises-list')).toContainText('8 reps');
  });

  // ── Finishing / cancelling ─────────────────────────────────────

  test('finishing a session saves the record and returns home', async ({ page }) => {
    await startSession(page);
    await page.locator('#btn-finish-session').click();

    await expect(page.locator('#view-home')).toHaveClass(/view--active/);
    await expect(page.locator('#bottom-nav')).not.toHaveClass(/hidden/);

    const active = await getStorage(page, STORAGE_KEYS.ACTIVE);
    expect(active).toBeNull();

    const sessions = await getStorage(page, STORAGE_KEYS.SESSIONS);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].sessionTypeName).toBe('CrossFit');
  });

  test('cancelling a session clears active and returns home', async ({ page }) => {
    await startSession(page);
    await page.locator('#btn-cancel-session').click();

    await expect(page.locator('#view-home')).toHaveClass(/view--active/);

    const active = await getStorage(page, STORAGE_KEYS.ACTIVE);
    expect(active).toBeNull();

    const sessions = await getStorage(page, STORAGE_KEYS.SESSIONS);
    expect(sessions).toBeNull(); // nothing saved
  });
});
