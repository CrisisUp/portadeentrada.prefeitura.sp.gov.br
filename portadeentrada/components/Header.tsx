'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ROLE_LABELS } from '@/lib/constants'
import ThemeToggle from './ui/ThemeToggle'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function Header() {
  const { data: session } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
    toast.success('Você saiu da conta')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch(e)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 to-transparent">
      <div className="flex items-center justify-between px-10 py-3">
        {/* Logo principal */}
        <Link href="/">
          <Image
            src="/images/logo-portadeentrada-white-low.png"
            alt="Porta de Entrada"
            width={198}
            height={79}
            priority
          />
        </Link>

        {/* Logos secundárias - com fill e sizes */}
        <div className="flex items-center gap-5">
          <div className="relative h-[50px] w-[150px]">
            <Image
              src="/images/logo-branca-sp-artes.png"
              alt="SP Artes"
              fill
              priority
              className="object-contain"
              sizes="150px"
            />
          </div>
          <div className="relative h-[50px] w-[150px]">
            <Image
              src="/images/nova-logo-sp-smc.png"
              alt="SMC"
              fill
              priority
              className="object-contain"
              sizes="150px"
            />
          </div>
        </div>

        {/* Restante do header */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative hidden md:flex">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar programas, editais, eventos..."
              className="bg-white/10 border border-white/20 text-white placeholder-white/60 px-4 py-2 pr-10 rounded-lg text-sm font-inter focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all w-64"
              aria-label="Buscar"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          <ThemeToggle />
          <Link
            href="/docs"
            className="text-white px-4 py-2 rounded text-sm font-semibold hover:bg-white/10 transition-colors hidden sm:inline-flex"
          >
            API Docs
          </Link>
          {session ? (
            <div className="flex items-center gap-3">
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="text-white px-4 py-2 rounded text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  Admin
                </Link>
              )}
              <span className="text-white/70 text-sm font-inter hidden sm:inline">
                {session.user.name}
                <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {ROLE_LABELS[session.user.role]}
                </span>
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="bg-primary text-white px-4 py-2 rounded-lg font-inter text-sm font-semibold hover:bg-primary-hover transition-colors"
            >
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}