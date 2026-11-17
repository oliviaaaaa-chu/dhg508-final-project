import { defineConfig, devices } from '@playwright/test'

// Local E2E runs against the production build served by `vite preview`.
// Run against the deployed site with:
//   E2E_BASE_URL=https://motif-atlas-jwp.pages.dev npx playwright test --project=deployed
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npx vite preview --port 4173 --strictPort',
        url: 'http://localhost:4173',
        reuseExistingServer: false,
        timeout: 120_000,
      },
  projects: [
    { name: 'local', use: { ...devices['Desktop Chrome'] } },
  ],
})
