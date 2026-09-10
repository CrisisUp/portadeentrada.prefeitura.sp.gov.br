import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const TEST_DB_PATH = path.resolve(__dirname, '../prisma/test.db')
const TEST_DATABASE_URL = `file:${TEST_DB_PATH}`

// Configura variável de ambiente
process.env.DATABASE_URL = TEST_DATABASE_URL

async function main() {
  console.log('Setting up test database...')

  // Gera Prisma Client para schema de teste
  console.log('Generating Prisma Client...')
  execSync('npx prisma generate --schema=prisma/schema.test.prisma', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PRISMA_CLI_BINARY_TARGETS: 'native' },
  })

  // Push schema (cria tabelas no SQLite)
  console.log('Pushing schema to SQLite...')
  execSync('npx prisma db push --schema=prisma/schema.test.prisma --force-reset --accept-data-loss', {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL, PRISMA_CLI_BINARY_TARGETS: 'native' },
  })

  console.log('Test database setup complete!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})