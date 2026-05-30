import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', {outputFolder: 'playwright-report', open: 'never'}],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    trace: 'on',
  },
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
});
