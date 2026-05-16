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
