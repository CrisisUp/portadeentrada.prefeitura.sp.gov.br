import { chromium } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const AUTH_FILE = path.join(process.cwd(), 'tests', 'e2e', '.auth', 'admin.json')
const BASE_URL = 'http://localhost:3000'
const ADMIN_EMAIL = 'admin@prefeitura.sp.gov.br'

async function globalSetup() {
  // Fallback para teste local - em CI a variável deve vir do ambiente
  const password = process.env.E2E_ADMIN_PASSWORD || 'e2e-test-2026'
  if (!password) {
    throw new Error(
      'E2E_ADMIN_PASSWORD não definido. Execute: npm run test:e2e:seed'
    )
  }

  // Garantir que o diretório .auth existe
  const authDir = path.dirname(AUTH_FILE)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(`${BASE_URL}/auth/login`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Preencher formulário de login
    await page.locator('input[type="email"]').fill(ADMIN_EMAIL)
    await page.locator('input[type="password"]').fill(password)
    console.log('🔍 Filled login form, clicking button...')
    await page.getByRole('button', { name: /entrar/i }).click()
    console.log('🔍 Button clicked, waiting for redirect...')

    // Esperar redirecionamento (login bem-sucedido vai para /)
    await page.waitForURL(
      (url) => !url.pathname.includes('/auth/login'),
      { timeout: 15000 }
    )

    // Salvar estado da sessão
    await context.storageState({ path: AUTH_FILE })

    console.log(`✅ Login E2E bem-sucedido. Sessão salva em ${AUTH_FILE}`)
  } catch (error) {
    throw new Error(
      `Falha no login E2E como ${ADMIN_EMAIL}. ` +
      `Verifique se o banco foi seedado com: npm run test:e2e:seed`
    )
  } finally {
    await browser.close()
  }
}

export default globalSetup
