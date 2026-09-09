import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Busca (Search) Page', () => {
  test('mostra formulário com todos os controles', async ({ page }) => {
    await page.goto(`${BASE_URL}/busca`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Título
    await expect(page.locator('h1')).toContainText('Busca')

    // Controles de filtro
    await expect(page.locator('input#q')).toBeVisible()
    await expect(page.locator('select#categoria')).toBeVisible()
    await expect(page.locator('select#status')).toBeVisible()
    // Botão Filtrar (submit do form de filtros)
    await expect(page.getByRole('button', { name: 'Filtrar' })).toBeVisible()
  })

  test('programas aparecem por padrão', async ({ page }) => {
    await page.goto(`${BASE_URL}/busca`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Espera os resultados carregarem
    await page.waitForSelector('.grid a', { timeout: 15000 })

    // Pelo menos um card de programa visível
    const cards = page.locator('.grid a')
    await expect(cards.first()).toBeVisible()
  })

  test('busca por termo filtra resultados', async ({ page }) => {
    await page.goto(`${BASE_URL}/busca?q=PROMAC`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Resultado contém PROMAC
    await expect(page.locator('text=PROMAC').first()).toBeVisible()
  })

  test('filtro por categoria funciona', async ({ page }) => {
    await page.goto(`${BASE_URL}/busca?categoria=Festival`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Mensagem indica filtro por categoria
    await expect(page.locator('text=Festival').first()).toBeVisible()
  })

  test('filtro por status funciona', async ({ page }) => {
    await page.goto(`${BASE_URL}/busca?status=aberto`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Programas com badge "Aberto" devem aparecer
    await expect(page.locator('text=Aberto').first()).toBeVisible()
  })

  test('estado vazio quando nenhum resultado', async ({ page }) => {
    await page.goto(`${BASE_URL}/busca?q=xyznonexistent123`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    await expect(page.locator('text=Nenhum programa encontrado')).toBeVisible()
  })

  test('botão Limpar remove filtros', async ({ page }) => {
    await page.goto(`${BASE_URL}/busca?q=test&categoria=Festival`, {
      timeout: 60000,
      waitUntil: 'domcontentloaded',
    })

    // Link "Limpar" visível quando filtros ativos
    const limparLink = page.locator('a[href="/busca"]').filter({ hasText: 'Limpar' })
    await expect(limparLink).toBeVisible()

    await limparLink.click()

    // URL limpa
    await expect(page).toHaveURL(/\/busca$/)
  })
})
