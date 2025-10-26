import { defineConfig, devices } from '@playwright/test';
import EnvConfig from './env.config';

export default defineConfig({
  testDir: './tests',
  timeout: EnvConfig.BROWSER_TIMEOUT,
  retries: process.env.CI ? 2 : 0,
  
  // globalSetup: require.resolve('./global.setup'),

  // Run all tests in parallel.
  fullyParallel: true,

  // Reporter for test results
  reporter: 'html',

  use: {
    headless: EnvConfig.HEADLESS,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    baseURL: EnvConfig.BASE_URL,
    // Global timeout for all actions
    actionTimeout: 10000,
    // Global timeout for navigation
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
