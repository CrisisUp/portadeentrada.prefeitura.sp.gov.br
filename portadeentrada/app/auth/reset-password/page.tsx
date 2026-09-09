'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!token) {
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
          </div>

          <Card variant="elevated" className="p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="font-inter font-bold text-[32px] text-foreground mb-4">
              Link Inválido
            </h1>
            <p className="font-inter text-foreground-dim mb-6">
              O link de redefinição de senha é inválido ou está faltando.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
            >
              Solicitar Novo Link
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
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
          </div>

          <Card variant="elevated" className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="font-inter font-bold text-[32px] text-foreground mb-4">
              Senha Redefinida
            </h1>
            <p className="font-inter text-foreground-dim mb-6">
              Sua senha foi redefinida com sucesso. Agora você pode fazer login.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
            >
              Fazer Login
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao redefinir senha. Tente novamente.')
        setLoading(false)
        return
      }

      setSuccess(true)
      toast.success('Senha redefinida com sucesso!')
    } catch {
      toast.error('Erro ao redefinir senha. Tente novamente.')
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
            Nova Senha
          </h1>
          <p className="font-inter text-foreground-dim">
            Digite sua nova senha abaixo
          </p>
        </div>

        <Card variant="elevated" className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="password"
              type="password"
              label="Nova Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />

            <Input
              id="confirmPassword"
              type="password"
              label="Confirmar Nova Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-foreground-muted font-inter">
            Lembrou a senha?{' '}
            <Link href="/auth/login" className="text-primary underline">
              Voltar ao Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
