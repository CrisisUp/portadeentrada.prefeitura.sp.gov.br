'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { AUTH_ERRORS, SUCCESS_MESSAGES } from '@/lib/errors'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || AUTH_ERRORS.REQUIRED_FIELDS)
        setLoading(false)
        return
      }

      toast.success(SUCCESS_MESSAGES.REGISTER)
      router.push('/auth/login')
    } catch {
      toast.error(AUTH_ERRORS.REQUIRED_FIELDS)
      setLoading(false)
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
            Criar Conta
          </h1>
          <p className="font-inter text-foreground-dim">
            Cadastre-se no portal
          </p>
        </div>

        <Card variant="elevated" className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="name"
              type="text"
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome completo"
              autoComplete="name"
            />

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
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-foreground-muted font-inter">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-primary underline">
              Entrar
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
