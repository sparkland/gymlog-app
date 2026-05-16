const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 20000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:8787',
    // iPhone 14 viewport — this is a mobile-first app
    viewport: { width: 390, height: 844 },
    actionTimeout: 8000,
    // Capture traces on first retry in CI for debugging
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Automatically start the python HTTP server before running tests.
  // reuseExistingServer lets local dev reuse an already-running server.
  webServer: {
    command: 'python3 -m http.server 8787',
    url: 'http://localhost:8787',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
