import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Hosted Linux runners render this 3D scene in software; allow the full
  // multi-interaction scenario to finish without relaxing its assertions.
  timeout: process.env.CI ? 180_000 : 60_000,
  workers: 1,
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1440, height: 960 },
    reducedMotion: 'reduce',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
