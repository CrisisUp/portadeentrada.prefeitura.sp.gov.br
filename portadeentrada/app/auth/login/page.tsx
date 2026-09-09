'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { AUTH_ERRORS, SUCCESS_MESSAGES } from '@/lib/errors'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      toast.error(AUTH_ERRORS.INVALID_CREDENTIALS)
    } else {
      toast.success(SUCCESS_MESSAGES.LOGIN)
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt px-4" suppressHydrationWarning>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src="/images/logo-portadeentrada-white-low.png"
              alt="Porta de Entrada"
              width={150}
              className="mx-auto mb-4 invert"
            />
          </Link>
          <h1 className="font-inter font-bold text-[42px] text-foreground mb-2">
            Entrar
          </h1>
          <p className="font-inter text-foreground-dim">
            Acesse o painel da Porta de Entrada
          </p>
        </div>

        <Card variant="elevated" className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
              autoComplete="email"
            />

            <Input
              id="password"
              type="password"
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-center text-sm font-inter">
            <Link href="/auth/forgot-password" className="text-primary underline">
              Esqueci minha senha
            </Link>
          </p>

          <p className="text-center text-sm text-foreground-muted font-inter">
            <Link href="/" className="text-primary underline">
              ← Voltar ao site
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
