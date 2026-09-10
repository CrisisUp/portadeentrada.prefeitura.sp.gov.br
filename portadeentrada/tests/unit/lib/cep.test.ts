import { describe, it, expect, vi } from 'vitest'
import { cleanCep, isValidCepFormat, formatCep, fetchCep, validateCep } from '@/lib/cep'

// Mock fetch for fetchCep tests
global.fetch = vi.fn()

describe('lib/cep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('cleanCep', () => {
    it('remove caracteres não numéricos', () => {
      expect(cleanCep('01310-100')).toBe('01310100')
      expect(cleanCep('01310 100')).toBe('01310100')
      expect(cleanCep('01310.100')).toBe('01310100')
    })

    it('retorna string vazia se input vazio', () => {
      expect(cleanCep('')).toBe('')
    })
  })

  describe('isValidCepFormat', () => {
    it('valida CEP com 8 dígitos', () => {
      expect(isValidCepFormat('01310100')).toBe(true)
      expect(isValidCepFormat('01310-100')).toBe(true)
    })

    it('rejeita CEP com tamanho inválido', () => {
      expect(isValidCepFormat('0131010')).toBe(false)
      expect(isValidCepFormat('013101000')).toBe(false)
      expect(isValidCepFormat('')).toBe(false)
    })

    it('rejeita CEP com letras', () => {
      expect(isValidCepFormat('01310-10A')).toBe(false)
      expect(isValidCepFormat('ABC10100')).toBe(false)
    })
  })

  describe('formatCep', () => {
    it('formata CEP de 8 dígitos corretamente', () => {
      expect(formatCep('01310100')).toBe('01310-100')
      expect(formatCep('01310-100')).toBe('01310-100')
    })

    it('retorna original se não tem 8 dígitos', () => {
      expect(formatCep('0131010')).toBe('0131010')
      expect(formatCep('')).toBe('')
      expect(formatCep('abc')).toBe('abc')
    })
  })

  describe('fetchCep', () => {
    it('retorna dados do CEP quando encontrado', async () => {
      const mockCepData = {
        cep: '01310-100',
        logradouro: 'Avenida Paulista',
        complemento: 'lado ímpar',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
        ibge: '3550308',
        gia: '1004',
        ddd: '11',
        siafi: '7107',
      }

      ;(fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCepData),
      })

      const result = await fetchCep('01310100')

      expect(result).toEqual(mockCepData)
      expect(fetch).toHaveBeenCalledWith('https://viacep.com.br/ws/01310100/json/', {
        next: { revalidate: 86400 },
      })
    })

    it('retorna null para CEP não encontrado (erro: true)', async () => {
      ;(fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ erro: true }),
      })

      const result = await fetchCep('00000000')
      expect(result).toBeNull()
    })

    it('retorna null para resposta HTTP error', async () => {
      ;(fetch as vi.Mock).mockResolvedValueOnce({
        ok: false,
      })

      const result = await fetchCep('01310100')
      expect(result).toBeNull()
    })

    it('retorna null para erro de rede', async () => {
      ;(fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchCep('01310100')
      expect(result).toBeNull()
    })

    it('retorna null para formato inválido', async () => {
      const result = await fetchCep('123')
      expect(result).toBeNull()
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  describe('validateCep', () => {
    it('retorna true para formato válido sem checkExistence', async () => {
      const result1 = await validateCep('01310100')
      const result2 = await validateCep('01310-100')
      expect(result1).toBe(true)
      expect(result2).toBe(true)
    })

    it('retorna false para formato inválido', async () => {
      const result1 = await validateCep('123')
      const result2 = await validateCep('')
      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })

    it('valida existência quando checkExistence=true', async () => {
      ;(fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          cep: '01310-100',
          logradouro: 'Avenida Paulista',
          uf: 'SP',
        }),
      })

      const result = await validateCep('01310100', true)
      expect(result).toBe(true)
    })

    it('retorna false quando CEP não existe', async () => {
      ;(fetch as vi.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ erro: true }),
      })

      const result = await validateCep('00000000', true)
      expect(result).toBe(false)
    })
  })
})