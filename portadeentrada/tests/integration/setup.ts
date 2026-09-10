import { vi, beforeAll, afterAll, beforeEach } from 'vitest'
import { setupTestDb, teardownTestDb, cleanTestDb } from './helpers/test-db'

// Configuração global para testes de integração
beforeAll(async () => {
  // Setup do banco de teste uma vez para toda a suíte
  await setupTestDb()
}, 60000)

afterAll(async () => {
  // Teardown final
  await teardownTestDb()
}, 30000)

beforeEach(async () => {
  // Limpa banco antes de cada teste para isolamento
  await cleanTestDb()
}, 15000)

// Mock global de console.error para reduzir ruído em testes
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // Suprime erros esperados de validação (já testamos via response)
    const msg = args[0]
    if (typeof msg === 'string' && (
      msg.includes('Validation failed') ||
      msg.includes('PrismaClientKnownRequestError') ||
      msg.includes('Unique constraint')
    )) {
      return
    }
    originalError.apply(console, args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Garante que vi.useFakeTimers não afete timers reais do banco
vi.useRealTimers()

// Aumenta timeout padrão para operações de banco
vi.setConfig({ testTimeout: 30000 })