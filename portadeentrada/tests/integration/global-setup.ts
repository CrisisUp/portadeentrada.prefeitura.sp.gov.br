import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Caminho correto para o arquivo SQLite
const TEST_DB_PATH = path.resolve(__dirname, '../../prisma/prisma/test.db')
const TEST_DATABASE_URL = `file:${TEST_DB_PATH}`

/**
 * Global setup - roda UMA vez antes de todos os testes de integração
 * Apenas configura a variável de ambiente - schema já deve existir
 */
export default async function globalSetup() {
  console.log('\n🔧 Setting up test database (SQLite)...\n')

  process.env.DATABASE_URL = TEST_DATABASE_URL
  process.env.PRISMA_CLI_BINARY_TARGETS = 'windows'

  console.log('DATABASE_URL:', TEST_DATABASE_URL)
  console.log('\n✅ Test database config ready!\n')
}