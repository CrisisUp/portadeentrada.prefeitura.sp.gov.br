import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testarSerializacao() {
  const inscricao = await prisma.inscricao.findFirst({
    include: {
      programa: { select: { id: true, titulo: true, categoria: true } },
    },
  })

  const serialized = JSON.parse(JSON.stringify(inscricao))
  console.log('=== Serialização JSON ===')
  console.log('Tipo de createdAt:', typeof serialized.createdAt)
  console.log('Valor de createdAt:', serialized.createdAt)
  console.log('Tipo de programa:', typeof serialized.programa)
  console.log('Valor de programa:', JSON.stringify(serialized.programa))
  console.log('Todos os campos:', Object.keys(serialized))
}

testarSerializacao().catch(console.error).finally(() => prisma.$disconnect())
