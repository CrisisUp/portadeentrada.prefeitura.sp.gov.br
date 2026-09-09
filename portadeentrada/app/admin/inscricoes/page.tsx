'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { STATUS_INSCRICAO_COLORS, STATUS_INSCRICAO_LABELS } from '@/lib/constants'
import { INSCRICAO_ERRORS, SUCCESS_MESSAGES } from '@/lib/errors'
import type { ProgramaCultural, Inscricao, StatusInscricao } from '@/types'

// Tipos da resposta da API (com datas serializadas como string)
interface ProgramaResumo {
  id: string
  titulo: string
}

interface InscricaoAPI {
  id: string
  nomeCompleto: string
  email: string
  telefone: string | null
  cpf: string
  rg: string | null
  endereco: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  portfolioUrl: string | null
  cartaIntencao: string | null
  status: StatusInscricao
  createdAt: string
  programa: ProgramaResumo
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminInscricoesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Estados dos filtros (inicializados com valores da URL)
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [statusInput, setStatusInput] = useState(searchParams.get('status') || '')
  const [programaInput, setProgramaInput] = useState(searchParams.get('programa') || '')
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1)

  // Estados dos dados
  const [inscricoes, setInscricoes] = useState<InscricaoAPI[]>([])
  const [programas, setProgramas] = useState<ProgramaResumo[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedInscricao, setSelectedInscricao] = useState<InscricaoAPI | null>(null)
  const [updating, setUpdating] = useState(false)
  const initialLoadDone = useRef(false)

  // Função para buscar inscrições - CORRIGIDA para usar os valores atuais
  const fetchInscricoes = useCallback(async (
    pageNum: number,
    searchTerm: string,
    statusFilter: string,
    programaFilter: string
  ) => {
    console.log('📡 Buscando inscrições com:', { searchTerm, statusFilter, programaFilter, pageNum })
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
      })
      
      // Adiciona parâmetros apenas se tiverem valor
      if (searchTerm) params.set('search', searchTerm)
      if (statusFilter) params.set('status', statusFilter)
      if (programaFilter) params.set('programaId', programaFilter)

      const url = `/api/admin/inscricoes?${params.toString()}`
      console.log('🌐 URL da API:', url)

      const res = await fetch(url)
      console.log('📊 Status da resposta:', res.status)

      if (res.ok) {
        const data = await res.json()
        console.log('✅ Dados recebidos:', data.inscricoes?.length || 0, 'inscrições')
        setInscricoes(data.inscricoes || [])
        setProgramas(data.programas || [])
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
        setCurrentPage(data.pagination?.page || 1)
      } else {
        const errorData = await res.json()
        console.error('❌ Erro na API:', errorData)
        toast.error(errorData.error || INSCRICAO_ERRORS.FETCH_FAILED)
      }
    } catch (error) {
      console.error('❌ Erro no fetch:', error)
      logger.error('Erro ao buscar inscrições', { error })
      toast.error(INSCRICAO_ERRORS.FETCH_FAILED)
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para aplicar os filtros - CORRIGIDA para usar os valores atuais
  const aplicarFiltros = useCallback(() => {
    // Pega os valores atuais diretamente dos inputs
    const currentSearch = document.querySelector('input[placeholder="Nome, email ou CPF..."]') as HTMLInputElement
    const currentStatus = document.querySelector('select:first-of-type') as HTMLSelectElement
    const currentPrograma = document.querySelector('select:last-of-type') as HTMLSelectElement
    
    const searchValue = currentSearch?.value || searchInput
    const statusValue = currentStatus?.value || statusInput
    const programaValue = currentPrograma?.value || programaInput
    
    console.log('🔍 Aplicando filtros com valores atuais:', { searchValue, statusValue, programaValue })
    
    const params = new URLSearchParams()
    if (searchValue) params.set('q', searchValue)
    if (statusValue) params.set('status', statusValue)
    if (programaValue) params.set('programa', programaValue)
    
    const queryString = params.toString()
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`
    console.log('📌 Nova URL:', newUrl)
    
    // Atualiza os estados com os valores atuais
    setSearchInput(searchValue)
    setStatusInput(statusValue)
    setProgramaInput(programaValue)
    setCurrentPage(1)
    
    // Força recarregamento completo
    window.location.href = newUrl
  }, [pathname, searchInput, statusInput, programaInput])

  // Carregar dados iniciais - UMA ÚNICA VEZ
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN' && !initialLoadDone.current) {
      initialLoadDone.current = true
      
      // Pegar os valores da URL
      const q = searchParams.get('q') || ''
      const statusParam = searchParams.get('status') || ''
      const programa = searchParams.get('programa') || ''
      const page = Number(searchParams.get('page')) || 1
      
      console.log('📥 Carregamento inicial - Valores da URL:', { q, statusParam, programa, page })
      
      setSearchInput(q)
      setStatusInput(statusParam)
      setProgramaInput(programa)
      setCurrentPage(page)
      
      fetchInscricoes(page, q, statusParam, programa)
    }
  }, [status, session, searchParams, fetchInscricoes])

  // Verificar autenticação
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Handlers para os inputs
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('✏️ Search mudou:', e.target.value)
    setSearchInput(e.target.value)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('✏️ Status mudou:', e.target.value)
    setStatusInput(e.target.value)
  }

  const handleProgramaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('✏️ Programa mudou:', e.target.value)
    setProgramaInput(e.target.value)
  }

  // Handler para aplicar filtros (botão Filtrar)
  const handleFilter = () => {
    console.log('🎯 Botão Filtrar clicado!')
    aplicarFiltros()
  }

  // Handler para limpar filtros
  const handleClearFilters = () => {
    console.log('🧹 Limpando filtros')
    setSearchInput('')
    setStatusInput('')
    setProgramaInput('')
    window.location.href = pathname
  }

  function handleSelectAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setSelectedIds(inscricoes.map(i => i.id))
    } else {
      setSelectedIds([])
    }
  }

  function handleSelectOne(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  async function handleBulkStatus(newStatus: string) {
    if (selectedIds.length === 0) {
      toast.error(INSCRICAO_ERRORS.NO_SELECTION)
      return
    }

    setUpdating(true)
    try {
      const res = await fetch('/api/admin/inscricoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status: newStatus }),
      })

      const data = await res.json()

      if (res.ok) {
        const q = searchParams.get('q') || ''
        const statusParam = searchParams.get('status') || ''
        const programa = searchParams.get('programa') || ''
        const page = Number(searchParams.get('page')) || 1
        await fetchInscricoes(page, q, statusParam, programa)
        setSelectedIds([])
        toast.success(SUCCESS_MESSAGES.INSCRICAO_UPDATE(selectedIds.length, newStatus === 'aprovada' ? 'aprovada(s)' : 'rejeitada(s)'))
      } else {
        toast.error(data.error || INSCRICAO_ERRORS.UPDATE_FAILED)
      }
    } catch (error) {
      logger.error('Erro ao atualizar inscrições', { error })
      toast.error(INSCRICAO_ERRORS.UPDATE_FAILED)
    } finally {
      setUpdating(false)
    }
  }

  function exportCSV() {
    const headers = ['Nome', 'Email', 'Telefone', 'CPF', 'RG', 'Cidade', 'Estado', 'Programa', 'Status', 'Data']
    const rows = inscricoes.map(i => [
      i.nomeCompleto,
      i.email,
      i.telefone || '',
      i.cpf,
      i.rg || '',
      i.cidade || '',
      i.estado || '',
      i.programa.titulo,
      STATUS_INSCRICAO_LABELS[i.status],
      new Date(i.createdAt).toLocaleDateString('pt-BR'),
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `inscricoes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    toast.success(SUCCESS_MESSAGES.CSV_EXPORT)
  }

  // Função para mudar de página
  const handlePageChange = (newPage: number) => {
    console.log('📄 Mudando para página:', newPage)
    const params = new URLSearchParams()
    if (searchInput) params.set('q', searchInput)
    if (statusInput) params.set('status', statusInput)
    if (programaInput) params.set('programa', programaInput)
    if (newPage > 1) params.set('page', newPage.toString())
    
    const queryString = params.toString()
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ''}`
    window.location.href = newUrl
  }

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-inter text-foreground-dim">Carregando...</p>
        </div>
      </div>
    )
  }

  if (session.user.role !== 'ADMIN') {
    router.push('/')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto my-20 px-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4">
            Administração
          </span>
          <h1 className="font-inter font-bold text-[42px] text-foreground">
            Gerenciar Inscrições
          </h1>
          <p className="font-inter text-foreground-dim mt-1">
            {pagination.total} inscrição(ões) encontrada(s)
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-surface rounded-xl shadow-sm border border-line p-6 mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">Buscar</label>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Nome, email ou CPF..."
              className="w-full px-4 py-3 border border-line-dim bg-surface text-foreground placeholder:text-foreground-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-inter"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">Status</label>
            <select
              value={statusInput}
              onChange={handleStatusChange}
              className="w-full px-4 py-3 border border-line-dim bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-inter"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="aprovada">Aprovada</option>
              <option value="rejeitada">Rejeitada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">Programa</label>
            <select
              value={programaInput}
              onChange={handleProgramaChange}
              className="w-full px-4 py-3 border border-line-dim bg-surface text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-inter"
            >
              <option value="">Todos</option>
              {programas.map(p => (
                <option key={p.id} value={p.id}>{p.titulo}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Botões de ação dos filtros */}
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            onClick={handleFilter}
            className="bg-primary text-white px-6 py-2 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
          >
            Filtrar
          </button>
          {(searchInput || statusInput || programaInput) && (
            <button
              onClick={handleClearFilters}
              className="text-primary hover:underline font-inter font-semibold px-4 py-2"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Ações em lote */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
          <span className="font-inter text-blue-800 dark:text-blue-300">
            {selectedIds.length} selecionada(s)
          </span>
          <button
            onClick={() => handleBulkStatus('aprovada')}
            disabled={updating}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-inter font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updating && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Aprovar
          </button>
          <button
            onClick={() => handleBulkStatus('rejeitada')}
            disabled={updating}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-inter font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updating && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Rejeitar
          </button>
          <button
            onClick={() => setSelectedIds([])}
            disabled={updating}
            className="text-foreground-dim hover:text-foreground font-inter disabled:opacity-50"
          >
            Limpar seleção
          </button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-surface rounded-xl shadow-sm border border-line overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-inter text-foreground-dim">Carregando inscrições...</p>
          </div>
        ) : inscricoes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="font-inter font-bold text-xl text-foreground mb-2">Nenhuma inscrição encontrada</h3>
            <p className="font-inter text-foreground-dim">Ajuste os filtros ou aguarde novas inscrições.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-alt border-b border-line">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length === inscricoes.length && inscricoes.length > 0}
                      className="w-4 h-4 rounded border-line-dim bg-surface text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-inter text-sm font-semibold text-foreground-dim">Nome</th>
                  <th className="px-4 py-3 text-left font-inter text-sm font-semibold text-foreground-dim">Email</th>
                  <th className="px-4 py-3 text-left font-inter text-sm font-semibold text-foreground-dim">Programa</th>
                  <th className="px-4 py-3 text-left font-inter text-sm font-semibold text-foreground-dim">Status</th>
                  <th className="px-4 py-3 text-left font-inter text-sm font-semibold text-foreground-dim">Data</th>
                  <th className="px-4 py-3 text-left font-inter text-sm font-semibold text-foreground-dim">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inscricoes.map((inscricao) => (
                  <tr key={inscricao.id} className="hover:bg-surface-alt transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inscricao.id)}
                        onChange={() => handleSelectOne(inscricao.id)}
                        className="w-4 h-4 rounded border-line-dim bg-surface text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-inter font-semibold text-foreground">{inscricao.nomeCompleto}</p>
                      <p className="font-inter text-sm text-foreground-muted">{inscricao.cpf}</p>
                    </td>
                    <td className="px-4 py-3 font-inter text-sm text-foreground-dim">{inscricao.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block bg-primary text-white px-2 py-0.5 rounded text-xs font-semibold">
                        {inscricao.programa.titulo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_INSCRICAO_COLORS[inscricao.status]}`}>
                        {STATUS_INSCRICAO_LABELS[inscricao.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-inter text-sm text-foreground-muted">
                      {new Date(inscricao.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedInscricao(inscricao)}
                        className="text-primary hover:text-primary-hover font-inter text-sm font-semibold"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-line px-4 py-3 flex items-center justify-between">
            <p className="font-inter text-sm text-foreground-muted">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-line-dim rounded-lg font-inter text-sm font-semibold hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-line-dim rounded-lg font-inter text-sm font-semibold hover:bg-surface-alt transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedInscricao && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.target === e.currentTarget && setSelectedInscricao(null)}
          onKeyDown={(e) => e.key === 'Escape' && setSelectedInscricao(null)}
        >
          <div className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-line">
              <div className="flex items-center justify-between">
                <h2 id="modal-title" className="font-inter font-bold text-2xl text-foreground">Detalhes da Inscrição</h2>
                <button
                  onClick={() => setSelectedInscricao(null)}
                  className="text-foreground-muted hover:text-foreground-dim"
                  aria-label="Fechar modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Nome</p>
                  <p className="font-semibold text-foreground">{selectedInscricao.nomeCompleto}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Email</p>
                  <p className="text-foreground">{selectedInscricao.email}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">CPF</p>
                  <p className="text-foreground">{selectedInscricao.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Telefone</p>
                  <p className="text-foreground">{selectedInscricao.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">RG</p>
                  <p className="text-foreground">{selectedInscricao.rg || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_INSCRICAO_COLORS[selectedInscricao.status]}`}>
                    {STATUS_INSCRICAO_LABELS[selectedInscricao.status]}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground-muted mb-1">Endereço</p>
                <p className="text-foreground">
                  {selectedInscricao.endereco || 'Não informado'}
                  {selectedInscricao.cidade && `, ${selectedInscricao.cidade}`}
                  {selectedInscricao.estado && ` - ${selectedInscricao.estado}`}
                  {selectedInscricao.cep && ` (${selectedInscricao.cep})`}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground-muted mb-1">Programa</p>
                <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {selectedInscricao.programa?.titulo || 'Programa não encontrado'}
                </span>
              </div>

              {selectedInscricao.portfolioUrl && (
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Portfólio</p>
                  <a
                    href={selectedInscricao.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedInscricao.portfolioUrl}
                  </a>
                </div>
              )}

              {selectedInscricao.cartaIntencao && (
                <div>
                  <p className="text-sm text-foreground-muted mb-1">Carta de Intenção</p>
                  <p className="text-foreground-dim whitespace-pre-wrap">{selectedInscricao.cartaIntencao}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-foreground-muted mb-1">Data da Inscrição</p>
                <p className="text-foreground">
                  {new Date(selectedInscricao.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedInscricao.createdAt).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}