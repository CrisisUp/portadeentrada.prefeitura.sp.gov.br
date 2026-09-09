'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import type { ProgramaCultural } from '@/types'
import { AUTH_ERRORS, INSCRICAO_ERRORS, SUCCESS_MESSAGES } from '@/lib/errors'
import { isValidCpf, cleanCpf, formatCpf } from '@/lib/cpf'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function CadastroPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [programas, setProgramas] = useState<ProgramaCultural[]>([])
  const [loadingProgramas, setLoadingProgramas] = useState(true)
  const [selectedProgramaId, setSelectedProgramaId] = useState('')
  const [loading, setLoading] = useState(false)

  // Dados do formulário
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    telefone: '',
    cpf: '',
    rg: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    portfolioUrl: '',
    cartaIntencao: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Buscar programas abertos ao montar
  useEffect(() => {
    async function fetchProgramas() {
      try {
        const res = await fetch('/api/cultura')
        if (res.ok) {
          const data = await res.json()
          setProgramas(data.filter((p: ProgramaCultural) => p.status === 'aberto'))
        }
      } catch {
        toast.error('Não foi possível carregar os programas. Tente novamente.')
      } finally {
        setLoadingProgramas(false)
      }
    }
    fetchProgramas()
  }, [])

  // Pré-preencher se logado
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        nomeCompleto: session.user.name || '',
        email: session.user.email || '',
      }))
    }
  }, [session])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function validateField(name: string, value: string): string {
    switch (name) {
      case 'nomeCompleto':
        if (!value.trim()) return 'Nome completo é obrigatório'
        return ''
      case 'email':
        if (!value.trim()) return 'Email é obrigatório'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido'
        return ''
      case 'cpf':
        if (!value.trim()) return 'CPF é obrigatório'
        if (!isValidCpf(cleanCpf(value))) return 'CPF inválido. Verifique os números.'
        return ''
      default:
        return ''
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = 'Nome completo é obrigatório'
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido'
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório'
    else if (!isValidCpf(cleanCpf(formData.cpf))) newErrors.cpf = 'CPF inválido'
    if (!selectedProgramaId) newErrors.programaId = 'Selecione um programa'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios para continuar.')
      return
    }

    if (!session) {
      toast.error(AUTH_ERRORS.UNAUTHORIZED)
      router.push('/auth/login')
      return
    }

    setLoading(true)

    try {
      const cpfClean = cleanCpf(formData.cpf)

      const res = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programaId: selectedProgramaId,
          ...formData,
          cpf: cpfClean,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || INSCRICAO_ERRORS.CREATE_FAILED)
        return
      }

      toast.success(SUCCESS_MESSAGES.INSCRICAO)
      setFormData({
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        telefone: '',
        cpf: '',
        rg: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        portfolioUrl: '',
        cartaIntencao: '',
      })
      setSelectedProgramaId('')
    } catch {
      toast.error(INSCRICAO_ERRORS.CREATE_FAILED)
    } finally {
      setLoading(false)
    }
  }

  const selectedPrograma = programas.find(p => p.id === selectedProgramaId)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-alt" suppressHydrationWarning>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-inter text-foreground-dim">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="max-w-[900px] mx-auto my-40 px-5 text-center">
        <Card variant="elevated" className="p-12">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="font-inter font-bold text-[42px] text-foreground mb-4">
            Área Restrita
          </h1>
          <p className="font-inter text-foreground-dim mb-8 max-w-md mx-auto">
            Para se inscrever em programas culturais, você precisa estar logado.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/login"
              className="bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="bg-surface-muted text-foreground px-6 py-3 rounded-lg font-inter font-semibold hover:bg-surface-muted transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto my-40 px-5 pb-20">
      <header className="mb-10">
        <span className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4">
          Inscrição
        </span>
        <h1 className="font-inter font-bold text-[42px] text-foreground mb-4">Inscreva-se nos Programas</h1>
        <p className="font-inter text-xl text-foreground-muted">
          Preencha o formulário abaixo para participar dos editais e programas culturais abertos.
        </p>
      </header>

      {loadingProgramas ? (
        <div className="bg-surface rounded-xl shadow-sm border border-line p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-inter text-foreground-dim">Carregando programas...</p>
        </div>
      ) : programas.length === 0 ? (
        <div className="bg-surface rounded-xl shadow-sm border border-line p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="font-inter font-bold text-2xl text-foreground mb-2">
            Nenhum programa aberto no momento
          </h2>
          <p className="font-inter text-foreground-dim mb-6">
            Volte mais tarde para conferir novas oportunidades.
          </p>
          <Link
            href="/busca"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-inter font-semibold hover:bg-primary-hover transition-colors"
          >
            Ver todos os programas
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Seleção de Programa */}
          <div className="bg-surface rounded-xl shadow-sm border border-line p-6">
            <h2 className="font-inter text-xl text-foreground mb-4">1. Escolha o Programa</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {programas.map((programa) => (
                <button
                  type="button"
                  key={programa.id}
                  onClick={() => setSelectedProgramaId(programa.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                    selectedProgramaId === programa.id
                      ? 'border-primary bg-primary/5'
                      : 'border-line-dim hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block bg-primary text-white px-2 py-0.5 rounded text-xs font-semibold uppercase">
                      {programa.categoria}
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                      Aberto
                    </span>
                  </div>
                  <h3 className="font-inter font-bold text-lg text-foreground mb-1">{programa.titulo}</h3>
                  <p className="font-inter text-sm text-foreground-muted line-clamp-2">{programa.descricao}</p>
                  {selectedProgramaId === programa.id && (
                    <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
            {errors.programaId && (
              <p id="programaId-error" className="mt-2 text-sm text-red-600 font-inter" role="alert">{errors.programaId}</p>
            )}
          </div>

          {selectedPrograma && (
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 mb-6">
              <p className="font-inter text-sm text-primary mb-1">Programa selecionado:</p>
              <p className="font-inter font-bold text-lg text-foreground">{selectedPrograma.titulo}</p>
              <p className="font-inter text-sm text-foreground-dim mt-1">{selectedPrograma.descricao}</p>
            </div>
          )}

          {/* Dados Pessoais */}
          <Card className="p-6">
            <h2 className="font-inter text-xl text-foreground mb-4">2. Dados Pessoais</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                id="nomeCompleto"
                name="nomeCompleto"
                type="text"
                label="Nome Completo"
                required
                value={formData.nomeCompleto}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.nomeCompleto}
                placeholder="Seu nome completo"
                autoComplete="name"
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                required
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                placeholder="seu@email.com"
                autoComplete="email"
              />

              <Input
                id="telefone"
                name="telefone"
                type="tel"
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
                autoComplete="tel"
              />

              <Input
                id="cpf"
                name="cpf"
                type="text"
                label="CPF"
                required
                value={formData.cpf}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.cpf}
                maxLength={14}
                placeholder="000.000.000-00"
              />

              <Input
                id="rg"
                name="rg"
                type="text"
                label="RG"
                value={formData.rg}
                onChange={handleChange}
                placeholder="00.000.000-0"
              />
            </div>
          </Card>

          {/* Endereço */}
          <Card className="p-6">
            <h2 className="font-inter text-xl text-foreground mb-4">3. Endereço</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="md:col-span-2">
                <Input
                  id="endereco"
                  name="endereco"
                  type="text"
                  label="Endereço (Rua, nº, complemento)"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua Exemplo, 123, Apto 45"
                  autoComplete="street-address"
                />
              </div>

              <Input
                id="cidade"
                name="cidade"
                type="text"
                label="Cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="São Paulo"
                autoComplete="address-level2"
              />

              <div>
                <label htmlFor="estado" className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-line-dim rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-inter bg-surface"
                  autoComplete="address-level1"
                >
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="PR">Paraná</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="BA">Bahia</option>
                  <option value="GO">Goiás</option>
                  <option value="PE">Pernambuco</option>
                  <option value="CE">Ceará</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <Input
                id="cep"
                name="cep"
                type="text"
                label="CEP"
                value={formData.cep}
                onChange={handleChange}
                maxLength={9}
                placeholder="00000-000"
                autoComplete="postal-code"
              />
            </div>
          </Card>

          {/* Informações Complementares */}
          <Card className="p-6">
            <h2 className="font-inter text-xl text-foreground mb-4">4. Informações Complementares</h2>
            <div className="space-y-4">
              <Input
                id="portfolioUrl"
                name="portfolioUrl"
                type="url"
                label="Link do Portfólio / Site / Redes Sociais"
                value={formData.portfolioUrl}
                onChange={handleChange}
                placeholder="https://seuportfolio.com ou @seuinstagram"
              />

              <div>
                <label htmlFor="cartaIntencao" className="block text-sm font-semibold text-foreground-dim mb-1 font-inter">
                  Carta de Intenção / Motivação
                </label>
                <textarea
                  id="cartaIntencao"
                  name="cartaIntencao"
                  value={formData.cartaIntencao}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-line-dim rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-inter resize-y"
                  placeholder="Conte-nos por que você quer participar deste programa, sua experiência prévia, etc."
                />
              </div>
            </div>
          </Card>

          {/* Botão Enviar */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !selectedProgramaId}
              loading={loading}
            >
              Enviar Inscrição
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}