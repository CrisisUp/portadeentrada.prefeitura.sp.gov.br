'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Erro ao enviar email. Tente novamente.')
        setLoading(false)
        return
      }

      setSent(true)
      toast.success('Email enviado! Verifique sua caixa de entrada.')
    } catch {
      toast.error('Erro ao enviar email. Tente novamente.')
      setLoading(false)
    }
  }

  if (sent) {
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
            <div className="text-5xl mb-4">📧</div>
            <h1 className="font-inter font-bold text-[32px] text-foreground mb-4">
              Email Enviado
            </h1>
            <p className="font-inter text-foreground-dim mb-6">
              Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
            <p className="text-sm text-foreground-muted mb-6 font-inter">
              Não recebeu? Verifique a pasta de spam ou tente novamente em alguns minutos.
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
            >
              Voltar ao Login
            </Link>
          </Card>
        </div>
      </div>
    )
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
            Esqueci Minha Senha
          </h1>
          <p className="font-inter text-foreground-dim">
            Informe seu email para receber um link de redefinição
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

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
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
