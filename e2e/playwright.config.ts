import {defineConfig, devices} from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', {outputFolder: 'playwright-report', open: 'never'}],
  ],
  use: {
    baseURL,
    trace: 'on',
  },
  outputDir: 'test-results',
  // Launch the app on the host (no Docker). `cwd` defaults to this config's
  // directory, so `--dir ..` runs the root app. Locally an already-running
  // dev server is reused; in CI a fresh one is started.
  webServer: {
    command: 'pnpm --dir .. dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
});
