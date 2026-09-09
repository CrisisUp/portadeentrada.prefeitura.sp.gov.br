import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testar() {
  const inscricoes = await prisma.inscricao.findMany({
    where: {},
    include: {
      programa: {
        select: { id: true, titulo: true, categoria: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: 0,
    take: 3,
  })

  const json = JSON.stringify(inscricoes)
  const parsed = JSON.parse(json)

  console.log('Quantidade:', parsed.length)
  console.log('Primeiro item:', JSON.stringify(parsed[0], null, 2))
  console.log('Campos:', Object.keys(parsed[0]))
}

testar().catch(console.error).finally(() => prisma.$disconnect())
