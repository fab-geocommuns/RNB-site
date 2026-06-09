import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import {
  APP_URL,
  API_BASE,
  GHOST_BASE,
  MOCK_HOST,
  MOCK_PORT,
} from './tests/config';

dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/mock-server/**'],
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

  webServer: [
    {
      command: 'node tests/mock-server/index.mjs',
      url: `http://${MOCK_HOST}:${MOCK_PORT}/__health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: 'pipe',
      stderr: 'pipe',
      env: {
        MOCK_SERVER_PORT: String(MOCK_PORT),
        MOCK_SERVER_HOST: MOCK_HOST,
      },
    },
    {
      command: 'pnpm dev',
      url: APP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      stdout: 'ignore',
      stderr: 'pipe',
      env: {
        NEXT_PUBLIC_API_BASE: API_BASE,
        NEXT_GHOST_API_URL: GHOST_BASE,
        NEXT_GHOST_API_KEY: '0'.repeat(26),
        NEXT_GHOST_API_VERSION: 'v5.0',
        NEXTAUTH_URL: APP_URL,
        // Deterministic secret so the JWT issued by next-auth is valid
        // across the test run. Not a real secret — only used in tests.
        NEXTAUTH_SECRET: 'test-secret-do-not-use-in-prod',
        NEXT_PUBLIC_ENABLE_EDITION_MODE: 'true',
        NEXT_PUBLIC_ENABLE_MAPGRAB: 'true',
      },
    },
  ],
});
