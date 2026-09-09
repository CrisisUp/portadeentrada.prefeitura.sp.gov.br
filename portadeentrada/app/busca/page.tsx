import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import Link from 'next/link'
import { StatusPrograma } from '@/types'
import { CATEGORIAS, STATUS_OPTIONS, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { programaSlug } from '@/lib/slugify'

interface BuscaPageProps {
  searchParams: Promise<{ q?: string; categoria?: string; status?: string; page?: string }>
}

const ITEMS_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Busca – Porta de Entrada',
  description: 'Busque programas culturais, editais e eventos',
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q = '', categoria = '', status = '', page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page, 10))
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const where: Record<string, unknown> = {}

  if (q) {
    where.OR = [
      { titulo: { contains: q, mode: 'insensitive' } },
      { descricao: { contains: q, mode: 'insensitive' } },
      { categoria: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (categoria) {
    where.categoria = categoria
  }

  if (status && Object.values(StatusPrograma).includes(status as StatusPrograma)) {
    where.status = status as StatusPrograma
  }

  const [programas, total] = await Promise.all([
    prisma.programaCultural.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.programaCultural.count({ where }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  // Build query string for pagination links
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (categoria) params.set('categoria', categoria)
    if (status) params.set('status', status)
    if (pageNum > 1) params.set('page', pageNum.toString())
    return `/busca?${params.toString()}`
  }

  return (
    <div className="max-w-[900px] mx-auto my-40 px-5 pb-20">
      <header className="mb-10">
        <h1 className="font-inter font-bold text-[42px] text-foreground mb-2">Busca</h1>
        <p className="font-inter text-xl text-foreground-muted">
          {q && `Resultados para "${q}"`} {categoria && `na categoria "${categoria}"`} {status && `com status "${STATUS_LABELS[status as StatusPrograma]}"`}
          {!q && !categoria && !status && 'Todos os programas culturais'}
        </p>
        {total > 0 && (
          <p className="font-inter text-sm text-foreground-muted mt-2">
            {total} programa{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
            {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
          </p>
        )}
      </header>

      {/* Filtros */}
      <div className="bg-surface rounded-xl shadow-sm p-6 mb-8 border border-line">
        <form method="GET" className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
          <div className="md:flex-1">
            <label htmlFor="q" className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">
              Buscar
            </label>
            <input
              id="q"
              name="q"
              type="search"
              value={q}
              placeholder="Buscar por título, descrição, categoria..."
              className="w-full px-4 py-3 border border-line-dim bg-surface text-foreground placeholder:text-foreground-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-inter"
            />
          </div>

          <div className="md:w-48">
            <label htmlFor="categoria" className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">
              Categoria
            </label>
            <select
              id="categoria"
              name="categoria"
              value={categoria}
              className="w-full px-4 py-3 border border-line-dim bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-inter"
            >
              <option value="">Todas</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="md:w-48">
            <label htmlFor="status" className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              className="w-full px-4 py-3 border border-line-dim bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-inter"
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="md:w-auto">
            <button
              type="submit"
              className="w-full md:w-auto bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
            >
              Filtrar
            </button>
          </div>

          {(q || categoria || status) && (
            <Link
              href="/busca"
              className="w-full md:w-auto text-center text-primary hover:underline font-inter font-semibold px-6 py-3"
            >
              Limpar
            </Link>
          )}
        </form>
      </div>

      {/* Resultados */}
      {programas.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="font-inter font-bold text-2xl text-foreground mb-2">
            Nenhum programa encontrado
          </h2>
          <p className="font-inter text-foreground-dim mb-6">
            Tente ajustar os filtros ou buscar por outros termos.
          </p>
          <Link
            href="/busca"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
          >
            Ver todos os programas
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {programas.map((programa: { id: string; titulo: string; categoria: string; descricao: string; status: StatusPrograma; dataInicio: Date | null; dataFim: Date | null }, index: number) => (
              <Link
                key={programa.id}
                href={programaSlug(programa.titulo)}
                className="stagger-item bg-surface rounded-xl shadow-sm border border-line p-6 hover:shadow-md hover:border-primary/30 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {programa.categoria}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[programa.status]}`}>
                    {STATUS_LABELS[programa.status]}
                  </span>
                </div>
                <h2 className="font-inter font-bold text-2xl text-foreground mb-2">{programa.titulo}</h2>
                <p className="font-inter text-foreground-dim leading-relaxed line-clamp-2">{programa.descricao}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-foreground-muted font-inter">
                  {programa.dataInicio && (
                    <span>📅 Início: {programa.dataInicio.toLocaleDateString('pt-BR')}</span>
                  )}
                  {programa.dataFim && (
                    <span>📅 Fim: {programa.dataFim.toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginação">
              {currentPage > 1 && (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className="px-4 py-2 border border-line-dim rounded-lg font-inter text-sm font-semibold hover:bg-surface-alt transition-colors"
                  aria-label="Página anterior"
                >
                  ← Anterior
                </Link>
              )}

              <div className="flex items-center gap-1" role="navigation" aria-label="Números das páginas">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  // Show first, last, current ± 1, and ellipsis
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)

                  if (!showPage) {
                    // Only show ellipsis once
                    if (
                      pageNum === 2 ||
                      pageNum === totalPages - 1
                    ) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className="px-3 py-2 text-foreground-muted"
                          aria-hidden="true"
                        >
                          …
                        </span>
                      )
                    }
                    return null
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={buildPageUrl(pageNum)}
                      className={`px-4 py-2 rounded-lg font-inter text-sm font-semibold transition-colors ${
                        pageNum === currentPage
                          ? 'bg-primary text-white'
                          : 'text-foreground-dim hover:bg-surface-muted'
                      }`}
                      aria-label={`Página ${pageNum}`}
                      aria-current={pageNum === currentPage ? 'page' : undefined}
                    >
                      {pageNum}
                    </Link>
                  )
                })}
              </div>

              {currentPage < totalPages && (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className="px-4 py-2 border border-line-dim rounded-lg font-inter text-sm font-semibold hover:bg-surface-alt transition-colors"
                  aria-label="Próxima página"
                >
                  Próxima →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}