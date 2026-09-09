import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarInscricaoCompleta() {
  const inscricao = await prisma.inscricao.findFirst({
    include: {
      programa: {
        select: { id: true, titulo: true, categoria: true },
      },
    },
  })

  console.log('=== INSCRIÇÃO COMPLETA (com include programa) ===')
  console.log(JSON.stringify(inscricao, null, 2))
}

verificarInscricaoCompleta()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
