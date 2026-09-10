import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { vi } from 'vitest'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * SQLite em arquivo para testes de integração
 * Mais rápido que PostgreSQL e não requer servidor externo
 */
const TEST_DB_PATH = path.resolve(__dirname, '../../../prisma/prisma/test.db')
const TEST_DATABASE_URL = `file:${TEST_DB_PATH}`

// Prisma client configurado para SQLite de teste
const prisma = new PrismaClient({
  datasources: {
    db: { url: TEST_DATABASE_URL },
  },
})

/**
 * Setup completo do banco de teste SQLite
 * Apenas seed - schema já foi criado pelo globalSetup
 */
export async function setupTestDb(): Promise<void> {
  // Garante que usa o banco de teste
  process.env.DATABASE_URL = TEST_DATABASE_URL

  // Seed mínimo para testes
  await seedTestData()
}

/**
 * Teardown - desconecta Prisma
 */
export async function teardownTestDb(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Limpa todas as tabelas (mais rápido que reset para testes isolados)
 * Ordem respeita foreign keys
 */
export async function cleanTestDb(): Promise<void> {
  await prisma.inscricao.deleteMany()
  await prisma.programaCultural.deleteMany()
  await prisma.user.deleteMany()
  await prisma.passwordResetToken.deleteMany()
}

/**
 * Seed mínimo de dados para testes
 */
async function seedTestData(): Promise<void> {
  // Cria usuário admin para testes autenticados
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      id: 'clx7f6v7k0000abc123def45', // CUID válido fixo
      email: 'admin@test.com',
      name: 'Admin Test',
      role: 'ADMIN',
      emailVerified: new Date(),
      passwordHash: 'hashed',
    },
  })

  // Cria programas de teste via raw SQL (compatível com SQLite)
  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "ProgramaCultural" (id, titulo, descricao, categoria, status, "dataInicio", "dataFim", slug, "createdAt", "updatedAt")
    VALUES
      ('clx7f6v7k0000abc123def46', 'Programa Aberto Teste', 'Descrição do programa aberto', 'Fomento', 'aberto', '2024-01-01T00:00:00.000Z', '2024-12-31T00:00:00.000Z', 'programa-aberto-teste', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('clx7f6v7k0000abc123def47', 'Programa Fechado Teste', 'Descrição do programa fechado', 'Festival', 'encerrado', '2023-01-01T00:00:00.000Z', '2023-12-31T00:00:00.000Z', 'programa-fechado-teste', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `)
}

/**
 * Helper para criar usuário de teste com role específica
 */
export async function createTestUser(
  role: 'ADMIN' | 'EDITOR' | 'VIEWER' = 'VIEWER',
  overrides: Partial<{ email: string; name: string }> = {}
) {
  const email = overrides.email || `test-${role.toLowerCase()}-${Date.now()}@test.com`
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: overrides.name || `Test ${role}`,
      role,
      emailVerified: new Date(),
      passwordHash: 'hashed',
    },
    update: {
      role,
      name: overrides.name || `Test ${role}`,
    },
  })
}

/**
 * Helper para criar programa de teste
 */
export async function createTestPrograma(
  status: 'aberto' | 'em_andamento' | 'encerrado' = 'aberto',
  overrides: Partial<{ titulo: string; categoria: string }> = {}
) {
  return prisma.programaCultural.create({
    data: {
      titulo: overrides.titulo || `Programa ${status} ${Date.now()}`,
      descricao: 'Descrição de teste',
      categoria: overrides.categoria || 'Fomento',
      status,
      dataInicio: new Date('2024-01-01'),
      dataFim: new Date('2024-12-31'),
      slug: `programa-${status}-${Date.now()}`,
    },
  })
}

/**
 * Helper para criar inscrição de teste
 */
export async function createTestInscricao(
  programaId: string,
  overrides: Partial<{
    cpf: string
    email: string
    nomeCompleto: string
    status: 'pendente' | 'aprovada' | 'rejeitada'
  }> = {}
) {
  const cpf = overrides.cpf || `1114447773${Math.floor(Math.random() * 10)}`
  return prisma.inscricao.create({
    data: {
      programaId,
      nomeCompleto: overrides.nomeCompleto || 'João Silva Teste',
      email: overrides.email || `joao-${Date.now()}@test.com`,
      cpf,
      telefone: '11999999999',
      status: overrides.status || 'pendente',
    },
  })
}

/**
 * Prisma client para uso direto nos testes
 */
export { prisma }