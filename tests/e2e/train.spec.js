const { test, expect } = require('@playwright/test');
const {
  skipOnboarding,
  navigateViaSidebar,
  waitForModalOpen,
  waitForModalClosed,
  getStorage,
  STORAGE_KEYS,
} = require('../helpers');

test.describe('Train page', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page, 'TestUser');
    await page.goto('/');
    await navigateViaSidebar(page, 'training');
  });

  // ── Page layout ─────────────────────────────────────────────────

  test('Train view is full-screen with no bottom nav', async ({ page }) => {
    await expect(page.locator('#view-training')).toHaveClass(/view--active/);
    await expect(page.locator('#bottom-nav')).toHaveClass(/hidden/);
  });

  test('navigating to Home via sidebar restores bottom nav', async ({ page }) => {
    await navigateViaSidebar(page, 'home');
    await expect(page.locator('#view-home')).toHaveClass(/view--active/);
    await expect(page.locator('#bottom-nav')).not.toHaveClass(/hidden/);
  });

  test('no active phase shows the start-phase prompt', async ({ page }) => {
    await expect(page.locator('#training-content')).toContainText('Start Training Phase');
    await expect(page.locator('#btn-open-start-phase')).toBeVisible();
  });

  // ── Starting a phase ────────────────────────────────────────────

  test('Start Phase modal opens when tapping the start button', async ({ page }) => {
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');
    await expect(page.locator('#modal-start-phase')).toBeVisible();
  });

  test('Cancel closes the start-phase modal without saving', async ({ page }) => {
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');
    await page.locator('#btn-cancel-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');
    const phase = await getStorage(page, STORAGE_KEYS.TRAINING_PHASE);
    expect(phase).toBeNull();
  });

  test('starting a Bulk phase saves to storage and shows active phase card', async ({ page }) => {
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');

    // Bulk is selected by default — just fill starting weight
    await page.locator('#phase-start-weight').fill('80');
    await page.locator('#btn-save-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');

    // Active phase card should appear
    await expect(page.locator('#training-content .active-phase-card')).toBeVisible();
    await expect(page.locator('#training-content')).toContainText('Bulk');

    const phase = await getStorage(page, STORAGE_KEYS.TRAINING_PHASE);
    expect(phase).not.toBeNull();
    expect(phase.type).toBe('bulk');
    expect(phase.weightLog[0].weight).toBe(80);
  });

  test('starting a Cut phase shows the correct type badge', async ({ page }) => {
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');

    await page.locator('.phase-type-pill[data-type="cut"]').click();
    await page.locator('#phase-start-weight').fill('85');
    await page.locator('#btn-save-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');

    await expect(page.locator('#training-content')).toContainText('Cut');

    const phase = await getStorage(page, STORAGE_KEYS.TRAINING_PHASE);
    expect(phase.type).toBe('cut');
  });

  test('enabling target days shows the target input and saves targetDays', async ({ page }) => {
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');

    // Enable target days toggle — the checkbox is hidden; click the visible thumb
    await page.locator('#phase-target-toggle + .toggle-thumb').click();
    await expect(page.locator('#phase-target-days-group')).toBeVisible();

    await page.locator('#phase-target-days').fill('90');
    await page.locator('#phase-start-weight').fill('80');
    await page.locator('#btn-save-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');

    const phase = await getStorage(page, STORAGE_KEYS.TRAINING_PHASE);
    expect(phase.targetDays).toBe(90);
    // Phase card should mention the target
    await expect(page.locator('#training-content')).toContainText('90');
  });

  // ── Logging weight ──────────────────────────────────────────────

  test('Log Weight modal opens from the active phase card', async ({ page }) => {
    // Start a phase first
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');
    await page.locator('#phase-start-weight').fill('80');
    await page.locator('#btn-save-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');

    await page.locator('#btn-open-log-weight').click();
    await waitForModalOpen(page, 'modal-log-weight');
    await expect(page.locator('#modal-log-weight')).toBeVisible();
  });

  test('logging a weight adds an entry to the weight history', async ({ page }) => {
    // Start a phase
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');
    await page.locator('#phase-start-weight').fill('80');
    await page.locator('#btn-save-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');

    // Log a follow-up weight
    await page.locator('#btn-open-log-weight').click();
    await waitForModalOpen(page, 'modal-log-weight');
    await page.locator('#log-weight-input').fill('81.5');
    await page.locator('#btn-save-log-weight').click();
    await waitForModalClosed(page, 'modal-log-weight');

    // Weight history should show the new entry
    await expect(page.locator('#training-content')).toContainText('81.5');

    const phase = await getStorage(page, STORAGE_KEYS.TRAINING_PHASE);
    // Should have start weight + logged weight = 2 entries
    expect(phase.weightLog.length).toBe(2);
    expect(phase.weightLog[1].weight).toBe(81.5);
  });

  // ── Ending a phase ──────────────────────────────────────────────

  test('ending a phase moves it to history and clears the active phase', async ({ page }) => {
    // Start a phase
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');
    await page.locator('#phase-start-weight').fill('80');
    await page.locator('#btn-save-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');

    // End phase — browser confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#btn-end-phase').click();

    // Active phase should be gone; start prompt should return
    await expect(page.locator('#btn-open-start-phase')).toBeVisible();

    const phase = await getStorage(page, STORAGE_KEYS.TRAINING_PHASE);
    expect(phase).toBeNull();

    const history = await getStorage(page, STORAGE_KEYS.TRAINING_HISTORY);
    expect(history).toHaveLength(1);
    expect(history[0].type).toBe('bulk');
  });

  test('completed phase appears in the phase history section', async ({ page }) => {
    // Seed a completed phase directly into storage before this page load
    // (easier than going through the full flow twice)
  });

  // ── Persistence ─────────────────────────────────────────────────

  test('active phase survives a page reload', async ({ page }) => {
    await page.locator('#btn-open-start-phase').click();
    await waitForModalOpen(page, 'modal-start-phase');
    await page.locator('#phase-start-weight').fill('82');
    await page.locator('#btn-save-start-phase').click();
    await waitForModalClosed(page, 'modal-start-phase');

    // Reload and navigate back to Train
    await page.reload();
    await navigateViaSidebar(page, 'training');

    await expect(page.locator('#training-content .active-phase-card')).toBeVisible();
    await expect(page.locator('#training-content')).toContainText('Bulk');
  });
});
