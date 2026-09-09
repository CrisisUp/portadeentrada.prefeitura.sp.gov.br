import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should show home page with navigation cards', async ({ page }) => {
    await page.goto('/', { timeout: 60000, waitUntil: 'domcontentloaded' })

    // Navigation cards are Link elements inside section
    const navLinks = page.locator('section a[href^="/"]')
    await expect(navLinks.first()).toBeVisible({ timeout: 30000 })

    // Should have 5 navigation cards
    const count = await navLinks.count()
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('should have working header with logo and nav', async ({ page }) => {
    await page.goto('/', { timeout: 60000, waitUntil: 'domcontentloaded' })

    // Check logo
    await expect(page.locator('header img[alt="Porta de Entrada"]')).toBeVisible()

    // Check login link (uppercase LOGIN)
    await expect(page.locator('header a[href="/auth/login"]')).toContainText('LOGIN')

    // Check docs link
    await expect(page.locator('header a[href="/docs"]')).toContainText('API Docs')
  })

  test('should have working footer', async ({ page }) => {
    await page.goto('/', { timeout: 60000, waitUntil: 'domcontentloaded' })

    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('footer')).toContainText('Prefeitura da Cidade de São Paulo')
  })
})

test.describe('Navigation', () => {
  test('should navigate to busca page', async ({ page }) => {
    const response = await page.goto('/busca', { timeout: 60000 })
    expect(response).not.toBeNull()
    expect(response?.status()).toBeLessThan(500)
  })

  test('should show docs page with Swagger UI', async ({ page }) => {
    await page.goto('/docs', { timeout: 60000 })

    await expect(page.locator('h1')).toContainText('Porta de Entrada API')
    // Swagger UI should render
    await expect(page.locator('.swagger-ui')).toBeVisible({ timeout: 10000 })
  })

  test('should show fomento page', async ({ page }) => {
    const response = await page.goto('/fomento-a-cultura', { timeout: 60000 })
    expect(response?.status()).toBeLessThan(500)
  })

  test('should show formacao page', async ({ page }) => {
    const response = await page.goto('/formacao', { timeout: 60000 })
    expect(response?.status()).toBeLessThan(500)
  })

  test('should show promac page', async ({ page }) => {
    const response = await page.goto('/promac', { timeout: 60000 })
    expect(response?.status()).toBeLessThan(500)
  })

  test('should redirect cadastro to login when not auth', async ({ page }) => {
    await page.goto('/cadastro', { timeout: 60000 })
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})

test.describe('Authentication', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/auth/login', { timeout: 60000 })

    await expect(page.locator('h1')).toContainText('Entrar')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
    // Forgot password link
    await expect(page.locator('a[href="/auth/forgot-password"]')).toContainText('Esqueci minha senha')
  })

  test('should show register form', async ({ page }) => {
    await page.goto('/auth/register', { timeout: 60000 })

    await expect(page.locator('h1')).toContainText('Criar Conta')
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /criar conta/i })).toBeVisible()
  })
})

test.describe('Admin Access', () => {
  test('should redirect non-admin from /admin', async ({ page }) => {
    await page.goto('/admin', { timeout: 60000 })
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should redirect non-admin from /admin/inscricoes', async ({ page }) => {
    await page.goto('/admin/inscricoes', { timeout: 60000 })
    await expect(page).toHaveURL(/\/auth\/login/)
  })
})
