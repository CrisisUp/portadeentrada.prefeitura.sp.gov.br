import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Pages that load fast (no heavy DB queries)
const FAST_PAGES = [
  { name: 'Login', path: '/auth/login' },
  { name: 'Register', path: '/auth/register' },
  { name: 'Forgot Password', path: '/auth/forgot-password' },
]

for (const { name, path } of FAST_PAGES) {
  test(`${name} page has no critical accessibility violations`, async ({ page }) => {
    await page.goto(path, { timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    // Only fail on serious/critical violations, ignore minor ones
    const seriousViolations = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    )

    expect(
      seriousViolations,
      `Serious accessibility violations on ${name}:\n${seriousViolations.map(v => `  - [${v.impact}] ${v.id}: ${v.description}`).join('\n')}`
    ).toHaveLength(0)
  })
}

test('Login page has proper form labels', async ({ page }) => {
  await page.goto('/auth/login', { timeout: 60000 })

  // Check that inputs have labels (via htmlFor or wrapping label)
  const emailInput = page.locator('input[type="email"]')
  const emailId = await emailInput.getAttribute('id')
  const hasEmailLabel = emailId ? (await page.locator(`label[for="${emailId}"]`).count()) > 0 : false
  const hasEmailAriaLabel = (await emailInput.getAttribute('aria-label')) !== null
  expect(hasEmailLabel || hasEmailAriaLabel).toBeTruthy()

  const passwordInput = page.locator('input[type="password"]')
  const passwordId = await passwordInput.getAttribute('id')
  const hasPasswordLabel = passwordId ? (await page.locator(`label[for="${passwordId}"]`).count()) > 0 : false
  const hasPasswordAriaLabel = (await passwordInput.getAttribute('aria-label')) !== null
  expect(hasPasswordLabel || hasPasswordAriaLabel).toBeTruthy()
})

test('Register page has proper form labels', async ({ page }) => {
  await page.goto('/auth/register', { timeout: 60000 })

  const nameInput = page.locator('input[type="text"]')
  const nameId = await nameInput.getAttribute('id')
  const hasNameLabel = nameId ? (await page.locator(`label[for="${nameId}"]`).count()) > 0 : false
  const hasNameAriaLabel = (await nameInput.getAttribute('aria-label')) !== null
  expect(hasNameLabel || hasNameAriaLabel).toBeTruthy()

  const emailInput = page.locator('input[type="email"]')
  const emailId = await emailInput.getAttribute('id')
  const hasEmailLabel = emailId ? (await page.locator(`label[for="${emailId}"]`).count()) > 0 : false
  const hasEmailAriaLabel = (await emailInput.getAttribute('aria-label')) !== null
  expect(hasEmailLabel || hasEmailAriaLabel).toBeTruthy()
})

test('Skip link is present on login page', async ({ page }) => {
  await page.goto('/auth/login', { timeout: 60000 })
  const skipLink = page.locator('a[href="#main-content"]')
  await expect(skipLink).toHaveCount(1)
})

test('Footer has proper landmark', async ({ page }) => {
  await page.goto('/auth/login', { timeout: 60000 })
  const footer = page.locator('footer')
  await expect(footer).toBeVisible()
})

test('Login page has proper heading', async ({ page }) => {
  await page.goto('/auth/login', { timeout: 60000 })
  const h1 = page.locator('h1')
  await expect(h1).toBeVisible()
  await expect(h1).toContainText('Entrar')
})
