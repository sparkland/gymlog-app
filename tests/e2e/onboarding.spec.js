const { test, expect } = require('@playwright/test');
const { skipOnboarding, STORAGE_KEYS } = require('../helpers');

test.describe('Onboarding', () => {
  test('first-run shows onboarding screen', async ({ page }) => {
    // Fresh browser context — no localStorage seeded
    await page.goto('/');
    // Onboarding uses class 'active' and display:flex when shown
    await expect(page.locator('#view-onboarding')).toBeVisible();
    // Nav is hidden via opacity:0 + .hidden class (not display:none)
    await expect(page.locator('#bottom-nav')).toHaveClass(/hidden/);
  });

  test('completing onboarding saves name and navigates to home', async ({ page }) => {
    await page.goto('/');
    await page.locator('#onboarding-name').fill('TestUser');
    await page.locator('#btn-get-started').click();

    await expect(page.locator('#view-home')).toHaveClass(/view--active/);
    await expect(page.locator('#bottom-nav')).toBeVisible();

    const savedName = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.USER_NAME);
    expect(savedName).toBe('TestUser');
  });

  test('returning user skips onboarding and lands on home', async ({ page }) => {
    await skipOnboarding(page);
    await page.goto('/');

    await expect(page.locator('#view-home')).toHaveClass(/view--active/);
    await expect(page.locator('#view-onboarding')).not.toBeVisible();
  });
});
