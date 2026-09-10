import { describe, it, expect } from 'vitest'
import {
  cleanCpf,
  hasValidLength,
  isAllSameDigits,
  validateCheckDigits,
  formatCpf,
  validateCpf,
  isValidCpf,
} from '@/lib/cpf'

describe('lib/cpf', () => {
  describe('cleanCpf', () => {
    it('remove caracteres não numéricos', () => {
      expect(cleanCpf('111.444.777-35')).toBe('11144477735')
      expect(cleanCpf('111 444 777 35')).toBe('11144477735')
      expect(cleanCpf('111-444-777-35')).toBe('11144477735')
    })

    it('retorna string vazia se input vazio', () => {
      expect(cleanCpf('')).toBe('')
      expect(cleanCpf('   ')).toBe('')
    })

    it('mantém apenas dígitos', () => {
      expect(cleanCpf('abc111.444.777-35xyz')).toBe('11144477735')
    })
  })

  describe('hasValidLength', () => {
    it('retorna true para 11 dígitos', () => {
      expect(hasValidLength('11144477735')).toBe(true)
    })

    it('retorna false para menos de 11 dígitos', () => {
      expect(hasValidLength('1114447773')).toBe(false)
      expect(hasValidLength('')).toBe(false)
    })

    it('retorna false para mais de 11 dígitos', () => {
      expect(hasValidLength('111444777355')).toBe(false)
    })
  })

  describe('isAllSameDigits', () => {
    it('retorna true para todos dígitos iguais', () => {
      expect(isAllSameDigits('11111111111')).toBe(true)
      expect(isAllSameDigits('00000000000')).toBe(true)
      expect(isAllSameDigits('99999999999')).toBe(true)
    })

    it('retorna false para dígitos diferentes', () => {
      expect(isAllSameDigits('11144477735')).toBe(false)
      expect(isAllSameDigits('12345678901')).toBe(false)
    })
  })

  describe('validateCheckDigits', () => {
    it('valida CPF com dígitos verificadores corretos', () => {
      // CPFs válidos conhecidos
      expect(validateCheckDigits('11144477735')).toBe(true)
      expect(validateCheckDigits('52998224725')).toBe(true)
      expect(validateCheckDigits('39053344705')).toBe(true)
    })

    it('rejeita CPF com dígitos verificadores incorretos', () => {
      expect(validateCheckDigits('11144477736')).toBe(false)
      expect(validateCheckDigits('52998224726')).toBe(false)
    })
  })

  describe('formatCpf', () => {
    it('formata CPF de 11 dígitos corretamente', () => {
      expect(formatCpf('11144477735')).toBe('111.444.777-35')
      expect(formatCpf('52998224725')).toBe('529.982.247-25')
    })

    it('retorna original se não tem 11 dígitos', () => {
      expect(formatCpf('1114447773')).toBe('1114447773')
      expect(formatCpf('')).toBe('')
      expect(formatCpf('abc')).toBe('abc')
    })

    it('aceita CPF já formatado', () => {
      expect(formatCpf('111.444.777-35')).toBe('111.444.777-35')
    })
  })

  describe('validateCpf', () => {
    it('retorna válido para CPF correto', () => {
      const result = validateCpf('111.444.777-35')
      expect(result.valid).toBe(true)
      expect(result.formatted).toBe('111.444.777-35')
      expect(result.error).toBeUndefined()
    })

    it('rejeita CPF vazio', () => {
      const result = validateCpf('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CPF é obrigatório')
    })

    it('rejeita CPF com tamanho inválido', () => {
      const result = validateCpf('1114447773')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CPF deve ter 11 dígitos')
    })

    it('rejeita CPF com todos dígitos iguais', () => {
      const result = validateCpf('111.111.111-11')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CPF inválido')
    })

    it('rejeita CPF com dígitos verificadores incorretos', () => {
      const result = validateCpf('111.444.777-36')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CPF inválido')
    })
  })

  describe('isValidCpf', () => {
    it('retorna true para CPF válido', () => {
      expect(isValidCpf('111.444.777-35')).toBe(true)
      expect(isValidCpf('52998224725')).toBe(true)
    })

    it('retorna false para CPF inválido', () => {
      expect(isValidCpf('111.444.777-36')).toBe(false)
      expect(isValidCpf('111.111.111-11')).toBe(false)
      expect(isValidCpf('123')).toBe(false)
      expect(isValidCpf('')).toBe(false)
    })
  })
})