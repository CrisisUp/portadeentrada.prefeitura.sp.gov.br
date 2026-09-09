import { PrismaClient, StatusInscricao } from '@prisma/client'

const prisma = new PrismaClient()

// Função para gerar CPF válido (modulus 11)
function generateValidCPF(): string {
  // Gera 9 dígitos aleatórios
  const digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))

  // Calcula primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i)
  }
  let remainder = (sum * 10) % 11
  const d1 = remainder === 10 || remainder === 11 ? 0 : remainder

  // Calcula segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += (i < 9 ? digits[i] : d1) * (11 - i)
  }
  remainder = (sum * 10) % 11
  const d2 = remainder === 10 || remainder === 11 ? 0 : remainder

  return [...digits, d1, d2].join('')
}

const nomes = [
  'Ana Maria Silva', 'João Paulo Santos', 'Maria José Oliveira', 'Pedro Henrique Lima',
  'Francisca Souza', 'Lucas Pereira', 'Juliana Costa', 'Gabriel Rodrigues',
  'Amanda Almeida', 'Rafael Fernandes', 'Camila Ribeiro', 'Thiago Martins',
  'Patrícia Araújo', 'Bruno Carvalho', 'Letícia Gomes', 'Felipe Barbosa',
  'Carla Mendes', 'Diego Nascimento', 'Vanessa Castro', 'Marcelo Vieira',
  'Priscila Dias', 'Ricardo Monteiro', 'Tatiane Cardoso', 'Eduardo Campos',
  'Fernanda Rocha', 'André Correia', 'Bianca Freitas', 'Gustavo Nunes',
  'Renata Pinto', 'Marcos Teixeira', 'Isabela Lopes', 'Carlos Eduardo Silva',
  'Adriana Melo', 'Fábio Azevedo', 'Cláudia Moreira', 'Rodrigo Barros',
  'Simone Cunha', 'Paulo Ricardo Lima', 'Mariana Duarte', 'Sérgio Alves',
  'Vanessa Prado', 'Leonardo Reis', 'Cristina Batista', 'Roberto Dantas',
  'Tânia Machado', 'Alexandre Fonseca', 'Patrícia Teles', 'Daniel Ramos',
  'Luciana Vieira', 'Marcílio Neves'
]

const cidades = ['São Paulo', 'Guarulhos', 'Campinas', 'Santo André', 'São Bernardo do Campo', 'Osasco']
const estados = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS']
const portfolios = ['https://www.behance.net/', 'https://www.instagram.com/', 'https://vimeo.com/', '']
const cartas = [
  'Sou artista plástico há 15 anos e gostaria de participar deste programa.',
  'Tenho formação em Artes Visuais pela USP e busco oportunidades.',
  'Trabalho com arte urbana e gostaria de apresentar meu projeto.',
  'Sou professora de arte e quero desenvolver um projeto pedagógico.',
  'Musicista profissional, toco violão e componho MPB.',
  'Dançarina contemporânea, busco residência artística.',
  'Fotógrafo documental, já expus em 3 países.',
  'Escritor e poeta, lancei 3 livros.',
  'Cineasta amador, produzo curtas-metragens sobre cultura popular.',
  'Artesão em cerâmica, trabalho com técnica ancestral.',
]

function randomPhone(): string {
  const ddd = ['11', '21', '31', '41', '51']
  const d = ddd[Math.floor(Math.random() * ddd.length)]
  return `(${d})${Math.floor(Math.random() * 90000) + 10000}${Math.floor(Math.random() * 9000) + 1000}`
}

function randomRG(): string {
  const rg = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('')
  return `${rg.slice(0,2)}.${rg.slice(2,5)}.${rg.slice(5,8)}-${rg.slice(8)}`
}

function randomCEP(): string {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
}

function randomEndereco(): string {
  const ruas = ['Rua Augusta', 'Av. Paulista', 'Rua Oscar Freire', 'Rua Haddock Lobo']
  const rua = ruas[Math.floor(Math.random() * ruas.length)]
  return `${rua}, ${Math.floor(Math.random() * 2000) + 1}`
}

async function main() {
  console.log('🌱 Gerando 50 inscrições de teste...\n')

  // Buscar IDs reais dos programas
  const programas = await prisma.programaCultural.findMany({
    select: { id: true, titulo: true }
  })

  if (programas.length === 0) {
    console.error('❌ Nenhum programa encontrado. Execute o seed primeiro.')
    return
  }

  console.log(`📋 ${programas.length} programas encontrados\n`)

  // Limpar inscrições existentes (opcional)
  const existing = await prisma.inscricao.count()
  if (existing > 0) {
    console.log(`🗑️  Removendo ${existing} inscrições existentes...`)
    await prisma.inscricao.deleteMany()
  }

  // Gerar 50 inscrições
  for (let i = 0; i < 50; i++) {
    const programa = programas[Math.floor(Math.random() * programas.length)]
    const cidade = cidades[Math.floor(Math.random() * cidades.length)]
    const estado = estados[Math.floor(Math.random() * estados.length)]
    const portfolio = portfolios[Math.floor(Math.random() * portfolios.length)]
    const carta = cartas[Math.floor(Math.random() * cartas.length)]

    await prisma.inscricao.create({
      data: {
        programaId: programa.id,
        nomeCompleto: nomes[i],
        email: `teste${i + 1}@email.com`,
        telefone: randomPhone(),
        cpf: generateValidCPF(),
        rg: randomRG(),
        endereco: randomEndereco(),
        cidade,
        estado,
        cep: randomCEP(),
        portfolioUrl: portfolio,
        cartaIntencao: carta,
        status: ['pendente', 'aprovada', 'rejeitada'][Math.floor(Math.random() * 3)] as StatusInscricao,
      }
    })

    process.stdout.write(`\r  ✅ ${i + 1}/50 inscrições criadas`)
  }

  console.log('\n\n🎉 Seed concluído com sucesso!')

  // Mostrar estatísticas
  const stats = await prisma.inscricao.groupBy({
    by: ['status'],
    _count: true,
  })

  console.log('\n📊 Estatísticas:')
  stats.forEach(s => console.log(`  ${s.status}: ${s._count}`))

  await prisma.$disconnect()
}

main().catch(console.error)
