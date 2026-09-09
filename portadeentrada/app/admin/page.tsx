'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants'

interface Stats {
  programas: number
  categorias: number
  usuarios: number
  inscricoes: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        logger.error('Erro ao buscar estatísticas', { error })
      } finally {
        setLoadingStats(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchStats()
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-inter text-foreground-dim">Carregando...</p>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-inter font-bold text-[42px] text-red-600 mb-4">
            Acesso Negado
          </h1>
          <p className="font-inter text-foreground-dim mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
          >
            ← Voltar ao site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto my-20 px-5">
      <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4">
        Administração
      </span>
      <h1 className="font-inter font-bold text-[42px] text-foreground mb-4">
        Painel Administrativo
      </h1>
      <p className="font-inter text-xl text-foreground-muted mb-10">
        Gerencie usuários e conteúdo do portal
      </p>

      {/* User Info Card */}
      <div className="bg-surface rounded-xl shadow-lg p-6 mb-8">
        <h2 className="font-inter text-xl font-semibold text-foreground mb-4">
          Seus Dados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-foreground-muted font-inter">Nome</p>
            <p className="font-semibold text-foreground font-inter">
              {session.user.name}
            </p>
          </div>
          <div>
            <p className="text-sm text-foreground-muted font-inter">Email</p>
            <p className="font-semibold text-foreground font-inter">
              {session.user.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-foreground-muted font-inter">Função</p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[session.user.role]}`}
            >
              {ROLE_LABELS[session.user.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/admin/inscricoes" className="stagger-item bg-surface rounded-xl shadow-lg p-6 text-center hover:shadow-xl hover:border-primary/30 border border-transparent transition-all duration-200" style={{ animationDelay: '0ms' }}>
          {loadingStats ? (
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <p className="font-inter font-bold text-3xl text-primary">{stats?.programas ?? 0}</p>
              <p className="font-inter text-foreground-dim mt-1">Programas Culturais</p>
            </>
          )}
        </Link>
        <div className="stagger-item bg-surface rounded-xl shadow-lg p-6 text-center" style={{ animationDelay: '50ms' }}>
          {loadingStats ? (
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <p className="font-inter font-bold text-3xl text-primary">{stats?.categorias ?? 0}</p>
              <p className="font-inter text-foreground-dim mt-1">Categorias</p>
            </>
          )}
        </div>
        <div className="stagger-item bg-surface rounded-xl shadow-lg p-6 text-center" style={{ animationDelay: '100ms' }}>
          {loadingStats ? (
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <p className="font-inter font-bold text-3xl text-primary">{stats?.usuarios ?? 0}</p>
              <p className="font-inter text-foreground-dim mt-1">Usuários</p>
            </>
          )}
        </div>
        <Link href="/admin/inscricoes" className="stagger-item bg-surface rounded-xl shadow-lg p-6 text-center hover:shadow-xl hover:border-primary/30 border border-transparent transition-all duration-200" style={{ animationDelay: '150ms' }}>
          {loadingStats ? (
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <p className="font-inter font-bold text-3xl text-primary">{stats?.inscricoes ?? 0}</p>
              <p className="font-inter text-foreground-dim mt-1">Inscrições</p>
            </>
          )}
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/inscricoes" className="bg-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-inter text-lg font-semibold text-foreground">Gerenciar Inscrições</h3>
            <p className="font-inter text-sm text-foreground-muted">Aprovar, rejeitar e exportar inscrições</p>
          </div>
        </Link>
        <Link href="/busca" className="bg-surface rounded-xl shadow-lg p-6 hover:shadow-xl transition-all flex items-center gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-inter text-lg font-semibold text-foreground">Buscar Programas</h3>
            <p className="font-inter text-sm text-foreground-muted">Visualizar programas culturais</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
