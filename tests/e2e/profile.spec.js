const { test, expect } = require('@playwright/test');
const {
  skipOnboarding,
  seedSession,
  navigateViaSidebar,
  getStorage,
  STORAGE_KEYS,
} = require('../helpers');

test.describe('Profile page', () => {
  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page, 'TestUser');
    await page.goto('/');
    await navigateViaSidebar(page, 'profile');
  });

  // ── Page layout ─────────────────────────────────────────────────

  test('Profile view is full-screen with no bottom nav', async ({ page }) => {
    await expect(page.locator('#view-profile')).toHaveClass(/view--active/);
    await expect(page.locator('#bottom-nav')).toHaveClass(/hidden/);
  });

  test('← Home button returns to Home view and restores bottom nav', async ({ page }) => {
    await page.locator('#btn-back-profile').click();
    await expect(page.locator('#view-home')).toHaveClass(/view--active/);
    await expect(page.locator('#bottom-nav')).not.toHaveClass(/hidden/);
  });

  // ── Name field ──────────────────────────────────────────────────

  test('profile name field is pre-populated with the user name', async ({ page }) => {
    await expect(page.locator('#profile-name')).toHaveValue('TestUser');
  });

  test('editing and blurring the name field saves to localStorage', async ({ page }) => {
    await page.locator('#profile-name').triple_click?.() ?? await page.locator('#profile-name').click({ clickCount: 3 });
    await page.locator('#profile-name').fill('UpdatedUser');
    await page.locator('#profile-name').blur();

    const saved = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.USER_NAME);
    expect(saved).toBe('UpdatedUser');
  });

  // ── Stats ───────────────────────────────────────────────────────

  test('stats cards are rendered with numeric values', async ({ page }) => {
    await expect(page.locator('#stat-total-workouts')).toBeVisible();
    await expect(page.locator('#stat-streak')).toBeVisible();
    await expect(page.locator('#stat-prs')).toBeVisible();
  });

  test('Total Workouts stat is 0 when there are no sessions', async ({ page }) => {
    await expect(page.locator('#stat-total-workouts')).toHaveText('0');
  });

  test('Total Workouts stat reflects seeded sessions', async ({ page, context }) => {
    // Need a fresh page with a seeded session
    const newPage = await context.newPage();
    await skipOnboarding(newPage, 'TestUser');
    await seedSession(newPage);
    await newPage.goto('/');
    await navigateViaSidebar(newPage, 'profile');

    await expect(newPage.locator('#stat-total-workouts')).toHaveText('1');
    await newPage.close();
  });

  test('Week Streak is 0 when there are no sessions', async ({ page }) => {
    await expect(page.locator('#stat-streak')).toHaveText('0');
  });

  // ── Goals ───────────────────────────────────────────────────────

  test('goals grid renders goal chips', async ({ page }) => {
    const chips = page.locator('#goals-grid .goal-chip');
    await expect(chips).toHaveCount(12);
  });

  test('tapping a goal chip selects it', async ({ page }) => {
    const chip = page.locator('#goals-grid .goal-chip').first();
    await chip.click();
    await expect(chip).toHaveClass(/goal-chip--selected/);
  });

  test('tapping a selected goal chip deselects it', async ({ page }) => {
    const chip = page.locator('#goals-grid .goal-chip').first();
    await chip.click(); // select
    await chip.click(); // deselect
    await expect(chip).not.toHaveClass(/goal-chip--selected/);
  });

  test('selected goals persist to localStorage', async ({ page }) => {
    const chip = page.locator('#goals-grid .goal-chip').first();
    const goalId = await chip.getAttribute('data-goal-id');
    await chip.click();

    const profile = await getStorage(page, STORAGE_KEYS.PROFILE);
    expect(profile.goals).toContain(goalId);
  });

  test('multiple goals can be selected simultaneously', async ({ page }) => {
    const chips = page.locator('#goals-grid .goal-chip');
    await chips.nth(0).click();
    await chips.nth(2).click();
    await chips.nth(4).click();

    await expect(chips.nth(0)).toHaveClass(/goal-chip--selected/);
    await expect(chips.nth(2)).toHaveClass(/goal-chip--selected/);
    await expect(chips.nth(4)).toHaveClass(/goal-chip--selected/);

    const profile = await getStorage(page, STORAGE_KEYS.PROFILE);
    expect(profile.goals).toHaveLength(3);
  });

  test('goal selections survive a page reload', async ({ page }) => {
    const chip = page.locator('#goals-grid .goal-chip').nth(1);
    const goalId = await chip.getAttribute('data-goal-id');
    await chip.click();

    await page.reload();
    await navigateViaSidebar(page, 'profile');

    const reloadedChip = page.locator(`#goals-grid .goal-chip[data-goal-id="${goalId}"]`);
    await expect(reloadedChip).toHaveClass(/goal-chip--selected/);
  });

  // ── Height field ────────────────────────────────────────────────

  test('height input is present and accepts a value', async ({ page }) => {
    await page.locator('#profile-height').fill('180');
    await page.locator('#profile-height').blur();

    const profile = await getStorage(page, STORAGE_KEYS.PROFILE);
    expect(profile.height).toBe(180);
  });

  // ── Avatar initials ─────────────────────────────────────────────

  test('avatar displays initials derived from user name', async ({ page }) => {
    // TestUser → TU
    const avatar = page.locator('#profile-avatar-lg');
    const text = await avatar.textContent();
    expect(text?.trim()).toMatch(/^[A-Z]{1,2}$/);
  });
});
