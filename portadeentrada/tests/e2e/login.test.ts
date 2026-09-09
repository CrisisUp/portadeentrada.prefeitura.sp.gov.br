import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Login Flow', () => {
  test('mostra formulário com todos os elementos', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Título
    await expect(page.locator('h1')).toContainText('Entrar')

    // Campos do formulário
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Botão de submit
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()

    // Link "Esqueci minha senha"
    await expect(page.locator('a[href="/auth/forgot-password"]')).toBeVisible()
  })

  test('mostra erro para credenciais inválidas', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    await page.locator('input[type="email"]').fill('wrong@email.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: /entrar/i }).click()

    // Permanece na página de login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('login bem-sucedido redireciona para home', async ({ page }) => {
    const email = 'admin@prefeitura.sp.gov.br'
    const password = process.env.E2E_ADMIN_PASSWORD || 'e2e-test-2026'

    await page.goto(`${BASE_URL}/auth/login`, {
      timeout: 60000,
      waitUntil: 'networkidle',
    })

    await page.locator('input[type="email"]').fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /entrar/i }).click()

    // Espera redirecionamento para home
    await page.waitForURL(
      (url) => !url.pathname.includes('/auth/login'),
      { timeout: 30000 }
    )

    await expect(page).not.toHaveURL(/\/auth\/login/)
  })

  test('validação de campos obrigatórios', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Submit vazio — browser native validation impede envio
    await page.getByRole('button', { name: /entrar/i }).click()

    // Permanece na página de login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('link "Esqueci minha senha" navega corretamente', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    await page.locator('a[href="/auth/forgot-password"]').click()
    await expect(page).toHaveURL(/\/auth\/forgot-password/)
  })
})
