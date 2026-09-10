import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:3000'

// CI: build + start (produção). Local: dev server (hot reload)
const webServerCommand = process.env.CI
  ? 'npm run build && npm run start'
  : 'npm run dev'

// Use PostgreSQL database for E2E (not the SQLite test database)
const e2eEnv = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/portadeentrada',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'test-secret-min-32-chars-long-for-testing-only',
  NEXTAUTH_URL: 'http://localhost:3000',
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 60000,
  },
  timeout: 60000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: !process.env.CI, // Always reuse locally, fresh in CI
    timeout: process.env.CI ? 120000 : 300000,
    env: e2eEnv,
  },
})