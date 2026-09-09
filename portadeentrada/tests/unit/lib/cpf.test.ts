import { describe, it, expect } from 'vitest'
import {
  cleanCpf,
  isValidCpf,
  formatCpf,
  validateCpf,
  hasValidLength,
  isAllSameDigits,
  validateCheckDigits,
} from '@/lib/cpf'

describe('CPF Utilities', () => {
  describe('cleanCpf', () => {
    it('removes non-digits', () => {
      expect(cleanCpf('123.456.789-00')).toBe('12345678900')
      expect(cleanCpf('123 456 789 00')).toBe('12345678900')
    })

    it('handles empty string', () => {
      expect(cleanCpf('')).toBe('')
    })

    it('handles already clean CPF', () => {
      expect(cleanCpf('12345678900')).toBe('12345678900')
    })
  })

  describe('hasValidLength', () => {
    it('returns true for 11 digits', () => {
      expect(hasValidLength('12345678900')).toBe(true)
    })

    it('returns false for wrong length', () => {
      expect(hasValidLength('123456789')).toBe(false)
      expect(hasValidLength('123456789001')).toBe(false)
      expect(hasValidLength('')).toBe(false)
    })
  })

  describe('isAllSameDigits', () => {
    it('detects all same digits', () => {
      expect(isAllSameDigits('11111111111')).toBe(true)
      expect(isAllSameDigits('00000000000')).toBe(true)
      expect(isAllSameDigits('99999999999')).toBe(true)
    })

    it('returns false for different digits', () => {
      expect(isAllSameDigits('12345678900')).toBe(false)
      expect(isAllSameDigits('11144477735')).toBe(false)
    })
  })

  describe('validateCheckDigits', () => {
    it('validates correct check digits', () => {
      expect(validateCheckDigits('11144477735')).toBe(true)
      expect(validateCheckDigits('52998224725')).toBe(true)
    })

    it('rejects invalid check digits', () => {
      expect(validateCheckDigits('12345678900')).toBe(false)
      expect(validateCheckDigits('11144477736')).toBe(false)
    })
  })

  describe('isValidCpf', () => {
    it('validates correct CPFs', () => {
      expect(isValidCpf('11144477735')).toBe(true)
      expect(isValidCpf('52998224725')).toBe(true)
      expect(isValidCpf('17845681040')).toBe(true)
      expect(isValidCpf('15016936110')).toBe(true)
    })

    it('rejects invalid length', () => {
      expect(isValidCpf('123456789')).toBe(false)
      expect(isValidCpf('')).toBe(false)
    })

    it('rejects repeated digits', () => {
      expect(isValidCpf('11111111111')).toBe(false)
      expect(isValidCpf('00000000000')).toBe(false)
    })

    it('rejects invalid check digits', () => {
      expect(isValidCpf('12345678900')).toBe(false)
    })

    it('works with formatted input', () => {
      expect(isValidCpf('111.444.777-35')).toBe(true)
      expect(isValidCpf('529.982.247-25')).toBe(true)
    })
  })

  describe('formatCpf', () => {
    it('formats 11-digit CPF correctly', () => {
      expect(formatCpf('11144477735')).toBe('111.444.777-35')
      expect(formatCpf('52998224725')).toBe('529.982.247-25')
    })

    it('returns original if not 11 digits', () => {
      expect(formatCpf('123')).toBe('123')
      expect(formatCpf('1234567890')).toBe('1234567890')
    })
  })

  describe('validateCpf', () => {
    it('returns detailed result for valid CPF', () => {
      const result = validateCpf('11144477735')
      expect(result.valid).toBe(true)
      expect(result.formatted).toBe('111.444.777-35')
      expect(result.error).toBeUndefined()
    })

    it('returns error for empty CPF', () => {
      const result = validateCpf('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CPF é obrigatório')
    })

    it('returns error for wrong length', () => {
      const result = validateCpf('123')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CPF deve ter 11 dígitos')
    })

    it('returns error for repeated digits', () => {
      const result = validateCpf('11111111111')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('CPF inválido')
    })
  })
})
