/**
 * Workout Plans E2E Tests
 *
 * Covers:
 *  1. Plan assigned to a session subtype → auto-loads exercises on session start
 *  2. Global auto-load disabled in Settings → plan does NOT auto-load
 *  3. Session type has no plan assigned → no exercises appear automatically
 *  4. No plan on type, but user picks one from the Home dropdown → exercises load
 *
 * Plan used throughout: "Push Day" — Bench Press (ex-s-01) + Overhead Press (ex-s-06)
 * Type / subtype: Strength Training (default-1) → Chest (default-1-1)
 * No-plan type: CrossFit (default-10, no subtypes)
 */

const { test, expect } = require('@playwright/test');
const { skipOnboarding, STORAGE_KEYS, selectSessionType, navigateViaSidebar } = require('../helpers');

const PLANS_KEY    = 'gym_workout_plans';
const WS_KEY       = 'gym_workout_settings'; // workout settings

// ── Shared seed data ─────────────────────────────────────────────────────────

const TEST_PLAN = {
  id:    'plan-test-1',
  name:  'Push Day',
  emoji: '💪',
  exercises: [
    { exerciseId: 'ex-s-01', exerciseName: 'Bench Press',    exerciseType: 'strength' },
    { exerciseId: 'ex-s-06', exerciseName: 'Overhead Press', exerciseType: 'strength' },
  ],
};

/**
 * The default Strength Training type with the Chest subtype carrying a plan assignment.
 * All other default types are included unchanged so the home type grid renders correctly.
 */
const TYPES_WITH_PLAN_ON_SUBTYPE = [
  {
    id: 'default-1', name: 'Strength Training', emoji: '🏋️', color: '#6366f1', isDefault: true,
    subtypes: [
      { id: 'default-1-1', name: 'Chest',    isDefault: true, workoutPlanId: 'plan-test-1', workoutPlanAutoLoad: true },
      { id: 'default-1-2', name: 'Back',     isDefault: true },
      { id: 'default-1-3', name: 'Core',     isDefault: true },
      { id: 'default-1-4', name: 'Legs',     isDefault: true },
      { id: 'default-1-5', name: 'Deltoids', isDefault: true },
      { id: 'default-1-6', name: 'Biceps',   isDefault: true },
      { id: 'default-1-7', name: 'Triceps',  isDefault: true },
    ],
  },
  { id: 'default-2',  name: 'Cardio',         emoji: '🫀', color: '#ef4444', isDefault: true, subtypes: [{ id: 'default-2-1', name: 'Walking', isDefault: true }] },
  { id: 'default-3',  name: 'HIIT',           emoji: '⚡', color: '#f97316', isDefault: true, subtypes: [{ id: 'default-3-1', name: 'Circuits', isDefault: true }, { id: 'default-3-2', name: 'Hyrox', isDefault: true }] },
  { id: 'default-4',  name: 'Yoga',           emoji: '🧘', color: '#a855f7', isDefault: true, subtypes: [] },
  { id: 'default-5',  name: 'Pilates',        emoji: '🤸', color: '#ec4899', isDefault: true, subtypes: [] },
  { id: 'default-6',  name: 'Running',        emoji: '🏃', color: '#22c55e', isDefault: true, subtypes: [{ id: 'default-6-1', name: 'Outdoor', isDefault: true }, { id: 'default-6-2', name: 'Treadmill', isDefault: true }] },
  { id: 'default-7',  name: 'Cycling',        emoji: '🚴', color: '#eab308', isDefault: true, subtypes: [{ id: 'default-7-1', name: 'Outdoor', isDefault: true }, { id: 'default-7-2', name: 'Spin', isDefault: true }] },
  { id: 'default-8',  name: 'Swimming',       emoji: '🏊', color: '#06b6d4', isDefault: true, subtypes: [] },
  { id: 'default-9',  name: 'Boxing',         emoji: '🥊', color: '#f43f5e', isDefault: true, subtypes: [{ id: 'default-9-1', name: 'Training', isDefault: true }, { id: 'default-9-2', name: 'Boxercise', isDefault: true }] },
  { id: 'default-10', name: 'CrossFit',       emoji: '💪', color: '#10b981', isDefault: true, subtypes: [] },
  { id: 'default-11', name: 'Power Lifting',  emoji: '🏆', color: '#dc2626', isDefault: true, subtypes: [{ id: 'default-11-1', name: 'Bench', isDefault: true }, { id: 'default-11-2', name: 'Deadlift', isDefault: true }, { id: 'default-11-3', name: 'Squat', isDefault: true }] },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Seed gym_workout_plans with the given array before the page initialises. */
async function seedPlans(page, plans) {
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PLANS_KEY, value: plans });
}

/** Seed gym_session_types before the page initialises. */
async function seedTypes(page, types) {
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: STORAGE_KEYS.TYPES, value: types });
}

/** Seed gym_workout_settings before the page initialises. */
async function seedWorkoutSettings(page, settings) {
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: WS_KEY, value: settings });
}

/**
 * Start a session for a type that has subtype pills.
 * Clicks the type card, then the named subtype pill, then Start Session.
 */
async function startSessionWithSubtype(page, typeName, subtypeName) {
  await selectSessionType(page, typeName);
  await page.locator('#subtype-pills').waitFor({ state: 'visible' });
  await page.locator('.subtype-pill', { hasText: subtypeName }).click();
  await page.locator('#btn-start-session').click();
  await page.locator('#view-session.view--active').waitFor();
}

/**
 * Start a session for a type with no subtypes (e.g. CrossFit).
 */
async function startSessionNoSubtype(page, typeName) {
  await selectSessionType(page, typeName);
  await page.locator('#btn-start-session').click();
  await page.locator('#view-session.view--active').waitFor();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Workout Plans', () => {

  test.beforeEach(async ({ page }) => {
    await skipOnboarding(page);
  });

  // ── Test 1: Plan assigned to subtype auto-loads ──────────────────────────────

  test('plan assigned to subtype auto-loads exercises when that subtype is started', async ({ page }) => {
    await seedPlans(page, [TEST_PLAN]);
    await seedTypes(page, TYPES_WITH_PLAN_ON_SUBTYPE);

    await page.goto('/');
    await startSessionWithSubtype(page, 'Strength Training', 'Chest');

    // Both plan exercises must appear as cards in the session
    const exerciseList = page.locator('#session-exercises-list');
    await expect(exerciseList).toContainText('Bench Press');
    await expect(exerciseList).toContainText('Overhead Press');

    // There should be exactly two exercise cards
    await expect(exerciseList.locator('.active-exercise-card')).toHaveCount(2);
  });

  test('plan exercises do NOT appear when a different subtype (no plan) is started', async ({ page }) => {
    // Chest has the plan, Back does not
    await seedPlans(page, [TEST_PLAN]);
    await seedTypes(page, TYPES_WITH_PLAN_ON_SUBTYPE);

    await page.goto('/');
    await startSessionWithSubtype(page, 'Strength Training', 'Back');

    // Session should start with no exercise cards
    await expect(page.locator('#session-exercises-list .active-exercise-card')).toHaveCount(0);
  });

  // ── Test 2: Global auto-load disabled ────────────────────────────────────────

  test('plan does NOT auto-load when global auto-load is disabled in Settings', async ({ page }) => {
    await seedPlans(page, [TEST_PLAN]);
    await seedTypes(page, TYPES_WITH_PLAN_ON_SUBTYPE);
    await seedWorkoutSettings(page, { autoLoadEnabled: false });

    await page.goto('/');
    await startSessionWithSubtype(page, 'Strength Training', 'Chest');

    // No exercise cards despite the plan being assigned
    await expect(page.locator('#session-exercises-list .active-exercise-card')).toHaveCount(0);
  });

  test('global auto-load toggle in Settings persists and prevents auto-load', async ({ page }) => {
    await seedPlans(page, [TEST_PLAN]);
    await seedTypes(page, TYPES_WITH_PLAN_ON_SUBTYPE);

    await page.goto('/');

    // Navigate to Settings → Workout Plans and disable auto-load
    await navigateViaSidebar(page, 'settings');
    await page.locator('.settings-row[data-nav="workout-settings"]').click();
    await page.locator('#view-workout-settings.view--active').waitFor();

    const toggle = page.locator('#workout-autoload-toggle');
    await expect(toggle).toBeChecked(); // on by default
    // The native checkbox is hidden (display:none) — click the visible thumb span instead
    await page.locator('#workout-autoload-toggle + .toggle-thumb').click();
    await expect(toggle).not.toBeChecked();

    // Navigate back to home and start the Chest session (Settings is now sidebar-only)
    await navigateViaSidebar(page, 'home');
    await startSessionWithSubtype(page, 'Strength Training', 'Chest');

    // Plan should not have loaded
    await expect(page.locator('#session-exercises-list .active-exercise-card')).toHaveCount(0);
  });

  // ── Test 3: Session type has no plan → nothing auto-loads ───────────────────

  test('no exercises appear when the session type has no plan assigned', async ({ page }) => {
    // Plan exists but is not assigned to CrossFit
    await seedPlans(page, [TEST_PLAN]);
    // Use default types (no plan assignments)

    await page.goto('/');
    await startSessionNoSubtype(page, 'CrossFit');

    await expect(page.locator('#session-exercises-list .active-exercise-card')).toHaveCount(0);
  });

  // ── Test 4: Home dropdown selection loads plan on session start ──────────────

  test('selecting a plan from the Home dropdown loads its exercises when the session starts', async ({ page }) => {
    // Plan exists but is NOT assigned to any type
    await seedPlans(page, [TEST_PLAN]);

    await page.goto('/');

    // The plan selector row should be visible (plans exist)
    await expect(page.locator('#home-plan-section')).toBeVisible();

    // Select CrossFit (no plan assigned to it)
    await selectSessionType(page, 'CrossFit');

    // Pick the plan from the dropdown
    await page.locator('#home-plan-select').selectOption({ label: '💪 Push Day' });

    // Start the session
    await page.locator('#btn-start-session').click();
    await page.locator('#view-session.view--active').waitFor();

    // Both plan exercises must appear
    const exerciseList = page.locator('#session-exercises-list');
    await expect(exerciseList).toContainText('Bench Press');
    await expect(exerciseList).toContainText('Overhead Press');
    await expect(exerciseList.locator('.active-exercise-card')).toHaveCount(2);
  });

  test('selecting None in the Home dropdown starts the session with no exercises', async ({ page }) => {
    // Plan exists but user explicitly leaves dropdown at "None"
    await seedPlans(page, [TEST_PLAN]);

    await page.goto('/');
    await selectSessionType(page, 'CrossFit');

    // Ensure the dropdown is on "None" (default)
    await expect(page.locator('#home-plan-select')).toHaveValue('');

    await page.locator('#btn-start-session').click();
    await page.locator('#view-session.view--active').waitFor();

    await expect(page.locator('#session-exercises-list .active-exercise-card')).toHaveCount(0);
  });

  test('Home plan dropdown is hidden when no plans exist', async ({ page }) => {
    // No plans seeded at all
    await page.goto('/');
    await expect(page.locator('#home-plan-section')).not.toBeVisible();
  });

});
