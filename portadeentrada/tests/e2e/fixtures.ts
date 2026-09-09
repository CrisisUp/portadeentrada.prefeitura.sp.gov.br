import { test as base, expect, type Page, type BrowserContext } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const AUTH_FILE = path.join(process.cwd(), 'tests', 'e2e', '.auth', 'admin.json')
const BASE_URL = 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@prefeitura.sp.gov.br'
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'e2e-test-2026'

// Cache para o storageState autenticado
let cachedAdminContext: BrowserContext | null = null

async function ensureAdminAuth(browser: import('@playwright/test').Browser): Promise<BrowserContext> {
  if (cachedAdminContext) {
    return cachedAdminContext
  }

  // Tentar carregar storageState existente
  let context: BrowserContext
  try {
    context = await browser.newContext({ storageState: AUTH_FILE })
    const page = await context.newPage()
    await page.goto(BASE_URL, { timeout: 5000, waitUntil: 'domcontentloaded' })
    // Verificar se ainda está logado (não redireciona para login)
    if (!page.url().includes('/auth/login')) {
      cachedAdminContext = context
      return context
    }
    await context.close()
  } catch {
    // Storage state inválido ou expirado
  }

  // Fazer login fresco
  context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`${BASE_URL}/auth/login`, { timeout: 60000, waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
  await page.locator('input[type="password"]').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /entrar/i }).click()
  // Aguardar navegação ou toast de sucesso
  await Promise.race([
    page.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 30000 }),
    page.waitForSelector('[role="status"]', { timeout: 30000 }),
  ])
  // Se ainda na página de login, navegar para home
  if (page.url().includes('/auth/login')) {
    await page.goto(BASE_URL, { timeout: 30000, waitUntil: 'domcontentloaded' })
  }

  // Salvar storageState para reuso
  const authDir = path.dirname(AUTH_FILE)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }
  await context.storageState({ path: AUTH_FILE })

  cachedAdminContext = context
  return context
}

/**
 * Fixture adminPage — cria browser context autenticado como admin.
 * Faz login automaticamente na primeira vez e cacheia a sessão.
 *
 * Uso nos testes:
 *   import { test, expect } from './fixtures'
 *   test('meu teste', async ({ adminPage }) => { ... })
 */
export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ browser }, use) => {
    const context = await ensureAdminAuth(browser)
    const page = await context.newPage()
    await use(page)
    await page.close()
    // Não fechamos o context aqui pois está cacheado
  },
})

export { expect }
