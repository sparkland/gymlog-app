const { test, expect } = require('@playwright/test');
const {
  skipOnboarding,
  seedSession,
  seedSessionWithExercise,
} = require('../helpers');

async function waitForModalOpen(page, id) {
  await page.waitForFunction(
    (modalId) => document.getElementById(modalId).classList.contains('open'),
    id
  );
}

async function waitForModalClosed(page, id) {
  await page.waitForFunction(
    (modalId) => !document.getElementById(modalId).classList.contains('open'),
    id
  );
}

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
    await seedSession(page);
    await page.goto('/');
    await page.locator('[data-nav="reports"]').click();
    await expect(page.locator('#view-reports')).toHaveClass(/view--active/);
  });

  test('stat cards reflect the seeded session', async ({ page }) => {
    await expect(page.locator('#stat-total')).toContainText('1');
  });

  test('session card appears in history list', async ({ page }) => {
    await expect(page.locator('#sessions-list')).toContainText('CrossFit');
  });

  test('filter dropdown shows all session types', async ({ page }) => {
    await expect(page.locator('#report-filter')).toBeVisible();
    const count = await page.locator('#report-filter option').count();
    expect(count).toBeGreaterThan(1); // more than just "All Session Types"
  });

  test('export modal opens and closes', async ({ page }) => {
    await page.locator('#btn-open-export').click();
    await waitForModalOpen(page, 'modal-export');

    await page.locator('#btn-cancel-export').click();
    await waitForModalClosed(page, 'modal-export');
  });

  test('export modal shows both export options', async ({ page }) => {
    await page.locator('#btn-open-export').click();
    await waitForModalOpen(page, 'modal-export');

    await expect(page.locator('#btn-export-pdf')).toBeVisible();
    await expect(page.locator('#btn-export-json')).toBeVisible();
  });
});

test.describe('Reports — Edit Session modal', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
    await seedSession(page);
    await page.goto('/');
    await page.locator('[data-nav="reports"]').click();
    await expect(page.locator('#view-reports')).toHaveClass(/view--active/);
  });

  test('edit button opens modal pre-populated with session data', async ({ page }) => {
    await page.locator('.session-edit-btn').first().click();
    await waitForModalOpen(page, 'modal-edit-session');

    // Date and type fields should be populated
    await expect(page.locator('#edit-session-date')).not.toHaveValue('');
    await expect(page.locator('#edit-session-type')).toBeVisible();
  });

  test('Add Exercise picker opens above edit modal and rows are interactable', async ({ page }) => {
    await page.locator('.session-edit-btn').first().click();
    await waitForModalOpen(page, 'modal-edit-session');

    await page.locator('#btn-edit-add-exercise').click();
    await waitForModalOpen(page, 'modal-pick-exercise');

    // Picker rows must be visible and clickable — not obscured by the edit modal behind them
    const firstRow = page.locator('.pick-exercise-row').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow).toBeEnabled();
  });

  test('selecting exercise from picker adds it to edit session and closes picker', async ({ page }) => {
    await page.locator('.session-edit-btn').first().click();
    await waitForModalOpen(page, 'modal-edit-session');

    await page.locator('#btn-edit-add-exercise').click();
    await waitForModalOpen(page, 'modal-pick-exercise');

    await page.locator('.pick-exercise-row', { hasText: 'Bench Press' }).click();
    await waitForModalClosed(page, 'modal-pick-exercise');

    // Edit modal stays open; exercise appears in the list
    await waitForModalOpen(page, 'modal-edit-session');
    await expect(page.locator('#edit-exercises-list')).toContainText('Bench Press');
  });

  test('cancelling edit session also closes an open exercise picker', async ({ page }) => {
    await page.locator('.session-edit-btn').first().click();
    await waitForModalOpen(page, 'modal-edit-session');

    // Open the picker without selecting anything
    await page.locator('#btn-edit-add-exercise').click();
    await waitForModalOpen(page, 'modal-pick-exercise');

    // Cancel the edit session — both modals must close.
    // force:true is required because #modal-pick-exercise (higher DOM order,
    // same z-index) visually covers the cancel button. We are intentionally
    // testing the JS closeEditSessionModal() handler, not button accessibility.
    await page.locator('#btn-cancel-edit-session').click({ force: true });
    await waitForModalClosed(page, 'modal-edit-session');
    await waitForModalClosed(page, 'modal-pick-exercise');

    // Backdrop must also be gone
    await page.waitForFunction(() =>
      !document.getElementById('modal-backdrop').classList.contains('open')
    );
  });
});

test.describe('Reports — exercise summary', () => {
  test('session with exercises shows expandable summary', async ({ page }) => {
    await skipOnboarding(page);
    await seedSessionWithExercise(page);
    await page.goto('/');
    await page.locator('[data-nav="reports"]').click();

    // Toggle should show exercise count
    const toggle = page.locator('.session-exercise-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toContainText('exercise');

    // Expand
    await toggle.click();
    await expect(page.locator('.session-exercise-detail')).toBeVisible();
    await expect(page.locator('.session-exercise-detail')).toContainText('Pull-Up');
    await expect(page.locator('.session-exercise-detail')).toContainText('10 reps');
  });
});
