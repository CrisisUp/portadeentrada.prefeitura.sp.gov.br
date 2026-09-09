import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { StatusPrograma } from '@/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'

interface ProgramaPageProps {
  titulo: string
  categoriaLabel?: string
  fallbackDescricao?: string
  fallbackConteudo?: React.ReactNode
}

export default async function ProgramaPage({
  titulo,
  categoriaLabel = 'Programa',
  fallbackDescricao,
  fallbackConteudo
}: ProgramaPageProps) {
  const programa = await prisma.programaCultural.findFirst({
    where: { titulo: { equals: titulo, mode: 'insensitive' } },
  })

  const descricao = programa?.descricao || fallbackDescricao || ''
  const categoria = programa?.categoria || categoriaLabel
  const status: StatusPrograma = (programa?.status as StatusPrograma) || 'aberto'
  const dataInicio = programa?.dataInicio
  const dataFim = programa?.dataFim

  return (
    <div className="max-w-[900px] mx-auto my-40 px-5">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
          {categoria}
        </span>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <h1 className="font-inter font-bold text-[42px] text-foreground mb-4">{titulo}</h1>
      <p className="font-inter text-xl text-foreground-dim mb-10">{descricao}</p>
      <div className="font-inter text-base leading-relaxed text-foreground-dim">
        {fallbackConteudo || (
          <>
            {dataInicio && (
              <p className="mb-2">
                <strong>Início:</strong> {dataInicio.toLocaleDateString('pt-BR')}
              </p>
            )}
            {dataFim && (
              <p className="mb-2">
                <strong>Fim:</strong> {dataFim.toLocaleDateString('pt-BR')}
              </p>
            )}
          </>
        )}
      </div>
      <Link href="/" className="inline-block mt-10 px-6 py-3 bg-primary text-white no-underline rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors">
        ← Voltar à Home
      </Link>
    </div>
  )
}