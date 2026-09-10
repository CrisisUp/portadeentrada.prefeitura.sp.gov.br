import { describe, it, expect } from 'vitest'
import {
  CreateInscricaoSchema,
  UpdateInscricaoSchema,
  BulkUpdateInscricoesSchema,
  CreateProgramaCulturalSchema,
  UpdateProgramaCulturalSchema,
  InscricoesQuerySchema,
  ProgramasQuerySchema,
  validateCreateInscricao,
  validateUpdateInscricao,
  validateBulkUpdateInscricoes,
  validateInscricoesQuery,
  validateProgramasQuery,
} from '@/lib/schemas'
import { StatusInscricao, StatusPrograma } from '@prisma/client'

describe('lib/schemas', () => {
  describe('CreateInscricaoSchema', () => {
    const validInscricao = {
      // Valid CUID format (24 chars, Prisma cuid2)
      programaId: 'clx7f6v7k0000abc123def45',
      nomeCompleto: 'João Silva',
      email: 'joao@test.com',
      telefone: '11999999999', // 11 digits without formatting
      cpf: '11144477735',
      rg: '12.345.678-9',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310100',
      portfolioUrl: 'https://portfolio.com',
      cartaIntencao: 'Minha carta de intenção',
      status: StatusInscricao.pendente,
    }

    it('valida dados corretos', () => {
      const result = CreateInscricaoSchema.safeParse(validInscricao)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(StatusInscricao.pendente)
      }
    })

    it('usa status padrão "pendente" se não informado', () => {
      const { status, ...data } = validInscricao
      const result = CreateInscricaoSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(StatusInscricao.pendente)
      }
    })

    it('rejeita email inválido', () => {
      const result = CreateInscricaoSchema.safeParse({
        ...validInscricao,
        email: 'invalido',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('email'))).toBe(true)
      }
    })

    it('rejeita CPF com tamanho incorreto', () => {
      const result = CreateInscricaoSchema.safeParse({
        ...validInscricao,
        cpf: '123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('cpf'))).toBe(true)
      }
    })

    it('rejeita programaId inválido (não é CUID)', () => {
      const result = CreateInscricaoSchema.safeParse({
        ...validInscricao,
        programaId: 'invalido',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('programaId')
      }
    })

    it('rejeita portfolioUrl inválida', () => {
      const result = CreateInscricaoSchema.safeParse({
        ...validInscricao,
        portfolioUrl: 'não-é-url',
      })
      expect(result.success).toBe(false)
    })

    it('aceita portfolioUrl vazia', () => {
      const result = CreateInscricaoSchema.safeParse({
        ...validInscricao,
        portfolioUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('rejeita campo obrigatório faltando', () => {
      const { nomeCompleto, ...data } = validInscricao
      const result = CreateInscricaoSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('nomeCompleto'))).toBe(true)
      }
    })
  })

  describe('UpdateInscricaoSchema', () => {
    it('aceita atualização parcial', () => {
      const result = UpdateInscricaoSchema.safeParse({
        nomeCompleto: 'João Silva Atualizado',
      })
      expect(result.success).toBe(true)
    })

    it('permite alterar status', () => {
      const result = UpdateInscricaoSchema.safeParse({
        status: StatusInscricao.aprovada,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(StatusInscricao.aprovada)
      }
    })

    it('valida email se fornecido', () => {
      const result = UpdateInscricaoSchema.safeParse({
        email: 'invalido',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('BulkUpdateInscricoesSchema', () => {
    it('valida array de IDs e status', () => {
      const result = BulkUpdateInscricoesSchema.safeParse({
        ids: ['clx7f6v7k0000abc123def45', 'clx7f6v7k0000def123abc456'],
        status: StatusInscricao.aprovada,
      })
      if (!result.success) {
        console.log('BulkUpdate errors:', JSON.stringify(result.error.issues, null, 2))
      }
      expect(result.success).toBe(true)
    })

    it('rejeita array vazio de IDs', () => {
      const result = BulkUpdateInscricoesSchema.safeParse({
        ids: [],
        status: StatusInscricao.aprovada,
      })
      expect(result.success).toBe(false)
    })

    it('rejeita status inválido', () => {
      const result = BulkUpdateInscricoesSchema.safeParse({
        ids: ['abc123def456ghi789jkl0'],
        status: 'invalido',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('CreateProgramaCulturalSchema', () => {
    const validPrograma = {
      titulo: 'Programa Teste',
      descricao: 'Descrição do programa',
      categoria: 'Fomento',
      status: StatusPrograma.aberto,
      dataInicio: new Date('2024-01-01'),
      dataFim: new Date('2024-12-31'),
      slug: 'programa-teste',
    }

    it('valida dados corretos', () => {
      const result = CreateProgramaCulturalSchema.safeParse(validPrograma)
      expect(result.success).toBe(true)
    })

    it('campo slug é opcional', () => {
      const { slug, ...data } = validPrograma
      const result = CreateProgramaCulturalSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejeita título vazio', () => {
      const result = CreateProgramaCulturalSchema.safeParse({
        ...validPrograma,
        titulo: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejeita categoria vazia', () => {
      const result = CreateProgramaCulturalSchema.safeParse({
        ...validPrograma,
        categoria: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('UpdateProgramaCulturalSchema', () => {
    it('aceita atualização parcial', () => {
      const result = UpdateProgramaCulturalSchema.safeParse({
        titulo: 'Novo Título',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('InscricoesQuerySchema', () => {
    it('usa valores padrão', () => {
      const result = InscricoesQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
      }
    })

    it('converte page e limit para number', () => {
      const result = InscricoesQuerySchema.safeParse({
        page: '2',
        limit: '10',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.limit).toBe(10)
      }
    })

    it('valida status se fornecido', () => {
      const result = InscricoesQuerySchema.safeParse({
        status: 'aprovada',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.status).toBe(StatusInscricao.aprovada)
      }
    })

    it('rejeita status inválido', () => {
      const result = InscricoesQuerySchema.safeParse({
        status: 'invalido',
      })
      expect(result.success).toBe(false)
    })

    it('limita limit a máximo 100', () => {
      const result = InscricoesQuerySchema.safeParse({
        limit: '200',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('ProgramasQuerySchema', () => {
    it('usa valores padrão', () => {
      const result = ProgramasQuerySchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(12)
      }
    })

    it('valida categoria e status', () => {
      const result = ProgramasQuerySchema.safeParse({
        categoria: 'Fomento',
        status: 'aberto',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.categoria).toBe('Fomento')
        expect(result.data.status).toBe(StatusPrograma.aberto)
      }
    })
  })

  describe('Validation helpers', () => {
    it('validateCreateInscricao retorna success para dados válidos', () => {
      const result = validateCreateInscricao({
        programaId: 'clx7f6v7k0000abc123def45',
        nomeCompleto: 'João Silva',
        email: 'joao@test.com',
        telefone: null,
        cpf: '11144477735',
        rg: null,
        endereco: null,
        cidade: null,
        estado: null,
        cep: null,
        portfolioUrl: '',
        cartaIntencao: null,
      })
      if (!result.success) {
        console.log('validateCreateInscricao errors:', JSON.stringify(result.error.issues, null, 2))
      }
      expect(result.success).toBe(true)
    })

    it('validateCreateInscricao retorna error para dados inválidos', () => {
      const result = validateCreateInscricao({
        programaId: 'clx7f6v7k0000abc123def45',
        nomeCompleto: 'João Silva',
        email: 'invalido',
        cpf: '11144477735',
      })
      expect(result.success).toBe(false)
    })

    it('validateBulkUpdateInscricoes valida estrutura', () => {
      const result = validateBulkUpdateInscricoes({
        ids: ['clx7f6v7k0000abc123def45'],
        status: 'aprovada',
      })
      if (!result.success) {
        console.log('validateBulkUpdateInscricoes errors:', JSON.stringify(result.error.issues, null, 2))
      }
      expect(result.success).toBe(true)
    })

    it('validateInscricoesQuery parse query params', () => {
      const result = validateInscricoesQuery({
        page: '2',
        status: 'pendente',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(2)
        expect(result.data.status).toBe(StatusInscricao.pendente)
      }
    })

    it('validateProgramasQuery parse query params', () => {
      const result = validateProgramasQuery({
        categoria: 'Fomento',
        status: 'aberto',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.categoria).toBe('Fomento')
        expect(result.data.status).toBe(StatusPrograma.aberto)
      }
    })
  })
})