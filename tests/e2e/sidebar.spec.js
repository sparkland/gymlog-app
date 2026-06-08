const { test, expect } = require('@playwright/test');
const {
  skipOnboarding,
  startSession,
  openSidebar,
  closeSidebarViaScrim,
  navigateViaSidebar,
} = require('../helpers');

test.describe('Sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page, 'TestUser');
    await page.goto('/');
  });

  // ── Hamburger visibility ────────────────────────────────────────

  test('hamburger button is visible on Home', async ({ page }) => {
    await expect(page.locator('#btn-hamburger')).not.toHaveClass(/hamburger-hidden/);
    await expect(page.locator('#btn-hamburger')).toBeVisible();
  });

  test('hamburger button is visible on Exercises view', async ({ page }) => {
    await page.locator('#bottom-nav button[data-nav="exercises"]').click();
    await expect(page.locator('#btn-hamburger')).not.toHaveClass(/hamburger-hidden/);
  });

  test('hamburger button is hidden during an active session', async ({ page }) => {
    await startSession(page, 'CrossFit');
    await expect(page.locator('#btn-hamburger')).toHaveClass(/hamburger-hidden/);
  });

  // ── Open / close ────────────────────────────────────────────────

  test('tapping ☰ opens the sidebar drawer and scrim', async ({ page }) => {
    await openSidebar(page);
    await expect(page.locator('#sidebar-drawer')).toHaveClass(/open/);
    await expect(page.locator('#sidebar-scrim')).toHaveClass(/open/);
  });

  test('tapping the scrim closes the sidebar drawer', async ({ page }) => {
    await openSidebar(page);
    await closeSidebarViaScrim(page);
    await expect(page.locator('#sidebar-drawer')).not.toHaveClass(/open/);
    await expect(page.locator('#sidebar-scrim')).not.toHaveClass(/open/);
  });

  // ── Sidebar header ──────────────────────────────────────────────

  test('sidebar header shows the current user name', async ({ page }) => {
    await openSidebar(page);
    await expect(page.locator('#sidebar-name')).toContainText('TestUser');
  });

  // ── Navigation items ────────────────────────────────────────────

  test('Exercise item navigates to Home and closes the drawer', async ({ page }) => {
    // First go to Exercises so we can come back Home via the sidebar
    await page.locator('#bottom-nav button[data-nav="exercises"]').click();
    await openSidebar(page);
    await page.locator('.sidebar-item[data-view="home"]').click();
    await expect(page.locator('#view-home')).toHaveClass(/view--active/);
    await expect(page.locator('#sidebar-drawer')).not.toHaveClass(/open/);
  });

  test('Train item navigates to training view and hides bottom nav', async ({ page }) => {
    await navigateViaSidebar(page, 'training');
    await expect(page.locator('#bottom-nav')).toHaveClass(/hidden/);
  });

  test('Profile item navigates to profile view and hides bottom nav', async ({ page }) => {
    await navigateViaSidebar(page, 'profile');
    await expect(page.locator('#bottom-nav')).toHaveClass(/hidden/);
  });

  test('Nutrition and Insight sidebar items are marked disabled', async ({ page }) => {
    await openSidebar(page);
    await expect(page.locator('.sidebar-item[data-view="nutrition"]')).toHaveClass(/sidebar-item--disabled/);
    await expect(page.locator('.sidebar-item[data-view="insight"]')).toHaveClass(/sidebar-item--disabled/);
  });

  test('clicking a disabled sidebar item does not navigate away', async ({ page }) => {
    await openSidebar(page);
    await page.locator('.sidebar-item[data-view="nutrition"]').click();
    // Drawer stays open; still on home
    await expect(page.locator('#sidebar-drawer')).toHaveClass(/open/);
    await expect(page.locator('#view-home')).toHaveClass(/view--active/);
  });

  // ── Active highlight ─────────────────────────────────────────────

  test('reopening sidebar highlights the active view item', async ({ page }) => {
    await navigateViaSidebar(page, 'training');
    await openSidebar(page);
    await expect(page.locator('.sidebar-item[data-view="training"]')).toHaveClass(/sidebar-item--active/);
    // Other items are not active
    await expect(page.locator('.sidebar-item[data-view="home"]')).not.toHaveClass(/sidebar-item--active/);
  });

  // ── Page logo ───────────────────────────────────────────────────

  test('page logo is hidden on Home', async ({ page }) => {
    await expect(page.locator('#page-logo')).toHaveClass(/page-logo--hidden/);
  });

  test('page logo is visible on the Exercises view', async ({ page }) => {
    await page.locator('#bottom-nav button[data-nav="exercises"]').click();
    await expect(page.locator('#page-logo')).not.toHaveClass(/page-logo--hidden/);
    await expect(page.locator('#page-logo')).toBeVisible();
  });

  test('page logo is visible on the Train view', async ({ page }) => {
    await navigateViaSidebar(page, 'training');
    await expect(page.locator('#page-logo')).not.toHaveClass(/page-logo--hidden/);
  });

  test('page logo is visible on the Profile view', async ({ page }) => {
    await navigateViaSidebar(page, 'profile');
    await expect(page.locator('#page-logo')).not.toHaveClass(/page-logo--hidden/);
  });
});
