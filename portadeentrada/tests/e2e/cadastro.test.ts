import { test, expect } from './fixtures'

const BASE_URL = 'http://localhost:3000'

test.describe('Cadastro (Inscrição) Page', () => {
  test('redireciona para login sem autenticação', async ({ page }) => {
    await page.goto(`${BASE_URL}/cadastro`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('mostra formulário quando autenticado', async ({ adminPage }) => {
    await adminPage.goto(`${BASE_URL}/cadastro`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Espera o formulário carregar
    await adminPage.waitForSelector('button:has-text("Enviar Inscrição")', {
      timeout: 15000,
    })

    // Seções do formulário
    await expect(adminPage.locator('text=Dados Pessoais').first()).toBeVisible()
    await expect(adminPage.locator('text=Endereço').first()).toBeVisible()

    // Botão de envio
    await expect(
      adminPage.locator('button:has-text("Enviar Inscrição")')
    ).toBeVisible()
  })

  test('cards de programa aparecem', async ({ adminPage }) => {
    await adminPage.goto(`${BASE_URL}/cadastro`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Espera os programas carregarem
    await adminPage.waitForSelector('button:has-text("Enviar Inscrição")', {
      timeout: 15000,
    })

    // Pelo menos um card de programa (botão clicável com nome de programa)
    const programButtons = adminPage.locator('button').filter({
      hasText: /aberto/i,
    })

    // Verifica que existem programas disponíveis
    const count = await programButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('nome e email pré-preenchidos da sessão', async ({ adminPage }) => {
    await adminPage.goto(`${BASE_URL}/cadastro`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    await adminPage.waitForSelector('button:has-text("Enviar Inscrição")', {
      timeout: 15000,
    })

    // Campos pré-preenchidos com dados do admin
    const nomeInput = adminPage.locator('input#nomeCompleto')
    const emailInput = adminPage.locator('input#email')

    await expect(nomeInput).not.toHaveValue('')
    await expect(emailInput).not.toHaveValue('')
  })

  test('botão Enviar desabilitado sem programa selecionado', async ({
    adminPage,
  }) => {
    await adminPage.goto(`${BASE_URL}/cadastro`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    await adminPage.waitForSelector('button:has-text("Enviar Inscrição")', {
      timeout: 15000,
    })

    // Botão deve estar desabilitado sem programa selecionado
    const submitButton = adminPage.locator(
      'button:has-text("Enviar Inscrição")'
    )
    await expect(submitButton).toBeDisabled()
  })
})
