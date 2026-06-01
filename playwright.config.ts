import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

const API_BASE = 'http://api.test/api/alpha';
const APP_URL = 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  snapshotPathTemplate: '{testDir}/visual-comparison/{testFilePath}/{arg}{ext}',
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'webgl.disabled': false,
            'webgl.enable-webgl2': true,
          },
        },
      },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      NEXT_PUBLIC_API_BASE: API_BASE,
      NEXTAUTH_URL: APP_URL,
      // Deterministic secret so JWT issued by next-auth is valid across the
      // test run. Not a real secret — only used in the test webServer.
      NEXTAUTH_SECRET: 'test-secret-do-not-use-in-prod',
      NEXT_PUBLIC_ENABLE_EDITION_MODE: 'true',
      NEXT_PUBLIC_ENABLE_MAPGRAB: 'true',
    },
  },
});
