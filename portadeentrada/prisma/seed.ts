import { PrismaClient, Role, StatusPrograma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Gerar senha aleatória segura
function generateSecurePassword(): string {
  return crypto.randomBytes(16).toString('hex')
}

// Usar variáveis de ambiente ou gerar senhas seguras
function getPassword(envVar: string | undefined, label: string): string {
  if (envVar) {
    return envVar
  }
  // Em produção, exigir variáveis de ambiente
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Variável de ambiente ${label} não definida em produção`)
  }
  // Em desenvolvimento, usar senha padrão
  console.log(`  ℹ️  Usando senha padrão para ${label}`)
  return 'admin123'
}

async function main() {
  console.log('🌱 Seeding database...')
  console.log('  ℹ️  Usando variáveis de ambiente para senhas (ou gerando aleatoriamente em dev)')

  const users = [
    {
      name: 'Administrador',
      email: 'admin@prefeitura.sp.gov.br',
      password: getPassword(process.env.SEED_ADMIN_PASSWORD, 'SEED_ADMIN_PASSWORD'),
      role: Role.ADMIN,
    },
    {
      name: 'Editor Cultural',
      email: 'editor@prefeitura.sp.gov.br',
      password: getPassword(process.env.SEED_EDITOR_PASSWORD, 'SEED_EDITOR_PASSWORD'),
      role: Role.EDITOR,
    },
    {
      name: 'Visualizador',
      email: 'viewer@prefeitura.sp.gov.br',
      password: getPassword(process.env.SEED_VIEWER_PASSWORD, 'SEED_VIEWER_PASSWORD'),
      role: Role.VIEWER,
    },
  ]

  for (const userData of users) {
    const passwordHash = await bcrypt.hash(userData.password, 12)
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { passwordHash, role: userData.role },
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
      },
    })
    console.log(`  ✅ ${user.name} (${user.role}) — ${user.email}`)
  }

  // Programas Culturais
  const programas = [
    {
      titulo: 'PROMAC',
      descricao: 'Programa Municipal de Apoio a Projetos Culturais',
      categoria: 'Fomento',
      status: StatusPrograma.aberto,
      dataInicio: new Date('2026-01-15'),
      dataFim: new Date('2026-03-30'),
    },
    {
      titulo: 'Virada Cultural',
      descricao: 'O maior festival de cultura de São Paulo',
      categoria: 'Festival',
      status: StatusPrograma.aberto,
      dataInicio: new Date('2026-05-15'),
      dataFim: new Date('2026-05-16'),
    },
    {
      titulo: 'Formação',
      descricao: 'Cursos, oficinas e programas de capacitação artística',
      categoria: 'Cursos',
      status: StatusPrograma.em_andamento,
      dataInicio: new Date('2026-02-01'),
      dataFim: new Date('2026-12-31'),
    },
    {
      titulo: 'Fomento à Cultura',
      descricao: 'Editais, chamamentos e oportunidades de financiamento para projetos culturais',
      categoria: 'Editais Abertos',
      status: StatusPrograma.aberto,
      dataInicio: new Date('2026-01-01'),
      dataFim: new Date('2026-12-31'),
    },
    {
      titulo: 'Programação Cultural',
      descricao: 'Espetáculos, festivais e eventos culturais pela cidade',
      categoria: 'Eventos',
      status: StatusPrograma.em_andamento,
      dataInicio: new Date('2026-01-01'),
      dataFim: new Date('2026-12-31'),
    },
    {
      titulo: 'Editais para Oficinas',
      descricao: 'Oportunidades para ministrar oficinas culturais',
      categoria: 'Editais',
      status: StatusPrograma.aberto,
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-11-30'),
    },
    {
      titulo: 'Vai nas Escolas',
      descricao: 'Projetos culturais em unidades educacionais',
      categoria: 'Educação',
      status: StatusPrograma.em_andamento,
      dataInicio: new Date('2026-02-01'),
      dataFim: new Date('2026-12-31'),
    },
    {
      titulo: 'Circuito Cultural',
      descricao: 'Circulação de espetáculos e atividades',
      categoria: 'Eventos',
      status: StatusPrograma.aberto,
      dataInicio: new Date('2026-03-01'),
      dataFim: new Date('2026-06-30'),
    },
  ]

  for (const programa of programas) {
    const existing = await prisma.programaCultural.findFirst({
      where: { titulo: programa.titulo },
    })
    if (!existing) {
      await prisma.programaCultural.create({ data: programa })
      console.log(`  📋 ${programa.titulo} — ${programa.categoria}`)
    }
  }

  console.log('🌱 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
