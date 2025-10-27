import { defineConfig, devices } from '@playwright/test';
import EnvConfig from './config/env.config';

// Generate timestamp for test run
const runTime = process.env.RUN_TIME || new Date().toISOString().replace(/:/g, '-').split('.')[0];
const outputDir = `test-results/${runTime}`;

export default defineConfig({
  testDir: './tests',
  timeout: EnvConfig.BROWSER_TIMEOUT,
  retries: process.env.CI ? 2 : 0,
  
  // globalSetup: require.resolve('./global.setup'),

  // Run all tests in parallel.
  fullyParallel: true,

  // Output directory for test artifacts
  outputDir: `${outputDir}/artifacts`,

  // Reporter for test results
  reporter: [
    ['html', { outputFolder: `${outputDir}/report.html`, open: 'never' }],
    ['json', { outputFile: `${outputDir}/results.json` }],
    ['junit', { outputFile: `${outputDir}/junit.xml` }],
    ['list']
  ],

  use: {
    headless: EnvConfig.HEADLESS,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on',
    screenshot: 'on',
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
