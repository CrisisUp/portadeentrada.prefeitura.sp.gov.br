import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const TEST_DB_PATH = path.resolve(projectRoot, 'prisma/prisma/test.db')

// Garante que o diretório existe
const dbDir = path.dirname(TEST_DB_PATH)
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

process.env.DATABASE_URL = `file:${TEST_DB_PATH}`

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Creating test database schema via raw SQL...')

  try {
    // Cria tabelas via SQL direto no SQLite
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        "emailVerified" DATETIME,
        "passwordHash" TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'VIEWER',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
        id TEXT PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        "userId" TEXT NOT NULL,
        "expiresAt" DATETIME NOT NULL,
        "usedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
      );
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PasswordResetToken_token_idx" ON "PasswordResetToken"(token);
      CREATE INDEX IF NOT EXISTS "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
      CREATE INDEX IF NOT EXISTS "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProgramaCultural" (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        categoria TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'aberto',
        "dataInicio" DATETIME,
        "dataFim" DATETIME,
        slug TEXT UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        "deletedAt" DATETIME
      );
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ProgramaCultural_status_idx" ON "ProgramaCultural"(status);
      CREATE INDEX IF NOT EXISTS "ProgramaCultural_categoria_idx" ON "ProgramaCultural"(categoria);
      CREATE INDEX IF NOT EXISTS "ProgramaCultural_slug_idx" ON "ProgramaCultural"(slug);
    `)

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Inscricao" (
        id TEXT PRIMARY KEY,
        "programaId" TEXT NOT NULL,
        "nomeCompleto" TEXT NOT NULL,
        email TEXT NOT NULL,
        telefone TEXT,
        cpf TEXT NOT NULL,
        rg TEXT,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        "portfolioUrl" TEXT,
        "cartaIntencao" TEXT,
        status TEXT NOT NULL DEFAULT 'pendente',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        "deletedAt" DATETIME,
        FOREIGN KEY ("programaId") REFERENCES "ProgramaCultural"(id) ON DELETE CASCADE
      );
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Inscricao_programaId_idx" ON "Inscricao"("programaId");
      CREATE INDEX IF NOT EXISTS "Inscricao_programaId_status_idx" ON "Inscricao"("programaId", status);
      CREATE INDEX IF NOT EXISTS "Inscricao_email_idx" ON "Inscricao"(email);
      CREATE INDEX IF NOT EXISTS "Inscricao_status_idx" ON "Inscricao"(status);
      CREATE INDEX IF NOT EXISTS "Inscricao_cpf_idx" ON "Inscricao"(cpf);
      CREATE INDEX IF NOT EXISTS "Inscricao_createdAt_idx" ON "Inscricao"("createdAt");
      CREATE INDEX IF NOT EXISTS "Inscricao_deletedAt_idx" ON "Inscricao"("deletedAt");
    `)

    console.log('✅ Database schema created successfully!')

    // Seed mínimo
    await seedTestData(prisma)

  } catch (error) {
    console.error('❌ Error creating schema:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function seedTestData(prisma) {
  console.log('🌱 Seeding test data...')

  // Upsert admin user
  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "User" (id, name, email, "emailVerified", "passwordHash", role, "createdAt", "updatedAt")
    VALUES ('clx7f6v7k0000abc123def45', 'Admin Test', 'admin@test.com', CURRENT_TIMESTAMP, 'hashed', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `)

  // Programas
  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "ProgramaCultural" (id, titulo, descricao, categoria, status, "dataInicio", "dataFim", slug, "createdAt", "updatedAt")
    VALUES
      ('clx7f6v7k0000abc123def46', 'Programa Aberto Teste', 'Descrição do programa aberto', 'Fomento', 'aberto', '2024-01-01', '2024-12-31', 'programa-aberto-teste', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('clx7f6v7k0000abc123def47', 'Programa Fechado Teste', 'Descrição do programa fechado', 'Festival', 'encerrado', '2023-01-01', '2023-12-31', 'programa-fechado-teste', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `)

  console.log('✅ Test data seeded!')
}

main()