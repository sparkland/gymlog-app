/**
 * Shared Playwright helpers for GymLog E2E tests.
 * All storage keys match STORAGE_KEYS in app.js.
 */

const STORAGE_KEYS = {
  USER_NAME: 'gym_user_name',
  SESSIONS:  'gym_sessions',
  ACTIVE:    'gym_active_session',
  TYPES:     'gym_session_types',
  EXERCISES: 'gym_exercises',
  UNITS:     'gym_units',
};

/**
 * Seed localStorage before the page script runs so the app initialises
 * as a returning user (skips onboarding). Uses addInitScript which fires
 * before DOMContentLoaded — safer than goto + evaluate + reload.
 */
async function skipOnboarding(page, name = 'TestUser') {
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, value);
  }, { key: STORAGE_KEYS.USER_NAME, value: name });
}

/**
 * Seed one completed session into localStorage before the page loads.
 * Accepts overrides to customise any field.
 */
async function seedSession(page, overrides = {}) {
  const defaultSession = {
    id: 'test-session-1',
    sessionTypeId: 'default-10',
    sessionTypeName: 'CrossFit',
    sessionTypeEmoji: '💪',
    sessionSubtypeId: null,
    sessionSubtypeName: null,
    date: new Date().toISOString().slice(0, 10), // today
    startTime: '10:00',
    endTime: '10:30',
    durationSeconds: 1800,
    notes: '',
    exercises: [],
  };

  const session = { ...defaultSession, ...overrides };

  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify([value]));
  }, { key: STORAGE_KEYS.SESSIONS, value: session });
}

/**
 * Seed a session that includes one exercise with one logged set,
 * for testing the Reports exercise summary expansion.
 */
async function seedSessionWithExercise(page) {
  await seedSession(page, {
    id: 'test-session-ex',
    exercises: [{
      exerciseId: 'ex-s-04',
      exerciseName: 'Pull-Up',
      exerciseType: 'strength',
      sets: [{ reps: 10, weight: null, weightUnit: 'kg' }],
    }],
  });
}

/**
 * Read a localStorage value from the page.
 * Returns the parsed JSON, or null if not set.
 */
async function getStorage(page, key) {
  return page.evaluate((k) => {
    const val = localStorage.getItem(k);
    return val ? JSON.parse(val) : null;
  }, key);
}

/**
 * Helper: select a session type by name on the home screen.
 * Waits for the type grid to be visible first.
 */
async function selectSessionType(page, typeName) {
  await page.locator('#home-type-grid').waitFor({ state: 'visible' });
  await page.locator('.type-card', { hasText: typeName }).click();
}

/**
 * Helper: start a full session (select type + click Start).
 * Waits for the session view to be active before returning.
 */
async function startSession(page, typeName = 'CrossFit') {
  await selectSessionType(page, typeName);
  await page.locator('#btn-start-session').click();
  await page.locator('#view-session.view--active').waitFor();
}

/**
 * Helper: add an exercise to the active session by name.
 * Note: modals use CSS transform (not display:none) to show/hide,
 * so we check for the 'open' class rather than visibility state.
 */
async function addExerciseToSession(page, exerciseName = 'Pull-Up') {
  await page.locator('#btn-add-exercise-to-session').click();
  // Wait for modal to be open (has 'open' class)
  await page.waitForFunction(() =>
    document.getElementById('modal-pick-exercise').classList.contains('open')
  );
  await page.locator('.pick-exercise-row', { hasText: exerciseName }).click();
  // Wait for modal to close (loses 'open' class)
  await page.waitForFunction(() =>
    !document.getElementById('modal-pick-exercise').classList.contains('open')
  );
}

module.exports = {
  STORAGE_KEYS,
  skipOnboarding,
  seedSession,
  seedSessionWithExercise,
  getStorage,
  selectSessionType,
  startSession,
  addExerciseToSession,
};
