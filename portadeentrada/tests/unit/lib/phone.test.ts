import { describe, it, expect } from 'vitest'
import { cleanPhone, isValidPhone, formatPhone, maskPhone } from '@/lib/phone'

describe('Phone Utilities', () => {
  describe('cleanPhone', () => {
    it('removes non-digits', () => {
      expect(cleanPhone('(11) 99999-9999')).toBe('11999999999')
      expect(cleanPhone('11 99999-9999')).toBe('11999999999')
      expect(cleanPhone('+55 11 99999-9999')).toBe('5511999999999')
    })

    it('handles empty string', () => {
      expect(cleanPhone('')).toBe('')
    })
  })

  describe('isValidPhone', () => {
    it('validates correct mobile phones (11 digits with 9)', () => {
      expect(isValidPhone('11999999999')).toBe(true)
      expect(isValidPhone('21987654321')).toBe(true)
      expect(isValidPhone('(11) 99999-9999')).toBe(true)
      expect(isValidPhone('+55 11 99999-9999')).toBe(true)
    })

    it('validates correct landlines (10 digits)', () => {
      expect(isValidPhone('1133334444')).toBe(true)
      expect(isValidPhone('(11) 3333-4444')).toBe(true)
    })

    it('rejects invalid length', () => {
      expect(isValidPhone('1199999999')).toBe(false) // 10 digits but starts with 9
      expect(isValidPhone('119999999999')).toBe(false) // 12 digits
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('')).toBe(false)
    })

    it('rejects invalid DDD', () => {
      expect(isValidPhone('00999999999')).toBe(false) // DDD 00
      expect(isValidPhone('10999999999')).toBe(false) // DDD 10
      expect(isValidPhone('0999999999')).toBe(false) // DDD 0
    })

    it('rejects mobile without 9', () => {
      expect(isValidPhone('1133334444')).toBe(true) // landline OK
      expect(isValidPhone('11933334444')).toBe(true) // mobile with 9 OK
      // 11 digits but 3rd digit is not 9
      expect(isValidPhone('11833334444')).toBe(false)
    })

    it('rejects repeated digits', () => {
      expect(isValidPhone('11111111111')).toBe(false)
      expect(isValidPhone('99999999999')).toBe(false)
    })
  })

  describe('formatPhone', () => {
    it('formats 11-digit mobile', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
      expect(formatPhone('21987654321')).toBe('(21) 98765-4321')
    })

    it('formats 10-digit landline', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    })

    it('handles already formatted', () => {
      expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999')
    })

    it('returns original if invalid length', () => {
      expect(formatPhone('123')).toBe('123')
      // 10 digits with 9 as 3rd digit is now invalid for landline, returns original
      expect(formatPhone('1199999999')).toBe('1199999999')
    })
  })

  describe('maskPhone', () => {
    it('masks progressively', () => {
      expect(maskPhone('1')).toBe('1')
      expect(maskPhone('11')).toBe('11')
      expect(maskPhone('119')).toBe('(11) 9')
      expect(maskPhone('1199999')).toBe('(11) 9999-9')
      expect(maskPhone('11999999999')).toBe('(11) 99999-9999')
      expect(maskPhone('1133334444')).toBe('(11) 3333-4444')
    })

    it('handles formatted input', () => {
      expect(maskPhone('(11) 99999-9999')).toBe('(11) 99999-9999')
    })
  })
})