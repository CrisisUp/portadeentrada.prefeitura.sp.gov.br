import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verificarInscricoes() {
  const inscricoes = await prisma.inscricao.findMany({
    select: {
      id: true,
      nomeCompleto: true,
      email: true,
      cpf: true,
      programaId: true,
      status: true,
      telefone: true,
      rg: true,
      endereco: true,
      cidade: true,
      estado: true,
      cep: true,
    },
    orderBy: { createdAt: 'asc' }
  })

  console.log('=== VERIFICAÇÃO DE INSCRIÇÕES ===')
  console.log('Total de inscrições:', inscricoes.length)
  console.log('')

  const problemas: string[] = []

  inscricoes.forEach((insc, index) => {
    const num = index + 1

    // Campos obrigatórios
    if (!insc.nomeCompleto || insc.nomeCompleto.trim() === '') {
      problemas.push(`Inscrição #${num} (${insc.id}): nomeCompleto vazio`)
    }
    if (!insc.email || insc.email.trim() === '') {
      problemas.push(`Inscrição #${num} (${insc.id}): email vazio`)
    }
    if (!insc.cpf || insc.cpf.trim() === '') {
      problemas.push(`Inscrição #${num} (${insc.id}): cpf vazio`)
    }
    if (!insc.programaId || insc.programaId.trim() === '') {
      problemas.push(`Inscrição #${num} (${insc.id}): programaId vazio`)
    }
  })

  if (problemas.length === 0) {
    console.log('✅ TODAS as inscrições têm os campos obrigatórios preenchidos!')
  } else {
    console.log('❌ PROBLEMAS ENCONTRADOS:')
    problemas.forEach(p => console.log('  -', p))
  }

  // Estatísticas de campos opcionais
  console.log('')
  console.log('=== ESTATÍSTICAS DE CAMPOS OPCIONAIS ===')

  const camposOpcionais = ['telefone', 'rg', 'endereco', 'cidade', 'estado', 'cep']
  camposOpcionais.forEach(campo => {
    const preenchidos = inscricoes.filter(i => i[campo as keyof typeof i]).length
    const porcentagem = ((preenchidos / inscricoes.length) * 100).toFixed(1)
    console.log(`  ${campo}: ${preenchidos}/${inscricoes.length} (${porcentagem}%)`)
  })
}

verificarInscricoes()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
