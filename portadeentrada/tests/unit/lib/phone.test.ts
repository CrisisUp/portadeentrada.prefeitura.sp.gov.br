import { describe, it, expect } from 'vitest'
import { cleanPhone, isValidPhone, formatPhone, maskPhone } from '@/lib/phone'

describe('lib/phone', () => {
  describe('cleanPhone', () => {
    it('remove caracteres não numéricos', () => {
      expect(cleanPhone('(11) 99999-9999')).toBe('11999999999')
      expect(cleanPhone('11 99999-9999')).toBe('11999999999')
      expect(cleanPhone('+55 11 99999-9999')).toBe('5511999999999')
    })

    it('retorna string vazia se input vazio', () => {
      expect(cleanPhone('')).toBe('')
    })
  })

  describe('isValidPhone', () => {
    it('valida celular com 9º dígito (11 dígitos)', () => {
      expect(isValidPhone('(11) 99999-9999')).toBe(true)
      expect(isValidPhone('11999999999')).toBe(true)
      expect(isValidPhone('+55 11 99999-9999')).toBe(true)
    })

    it('valida fixo sem 9º dígito (10 dígitos)', () => {
      // 10 dígitos: DDD + 8 dígitos (sem 9º dígito)
      // O 3º dígito (primeiro do número) NÃO deve ser 9
      expect(isValidPhone('(11) 8888-8888')).toBe(true)
      expect(isValidPhone('1188888888')).toBe(true)
      expect(isValidPhone('(21) 3333-4444')).toBe(true)
    })

    it('rejeita DDD inválido', () => {
      expect(isValidPhone('(00) 99999-9999')).toBe(false)
      expect(isValidPhone('(10) 99999-9999')).toBe(false)
      expect(isValidPhone('(01) 99999-9999')).toBe(false)
    })

    it('rejeita celular sem 9º dígito', () => {
      expect(isValidPhone('(11) 89999-9999')).toBe(false) // 11 dígitos mas 3º não é 9
      expect(isValidPhone('11899999999')).toBe(false)
    })

    it('rejeita fixo com 9º dígito', () => {
      // Se tem 10 dígitos mas o 3º é 9, é inválido
      expect(isValidPhone('(11) 9999-9999')).toBe(false)
      expect(isValidPhone('1199999999')).toBe(false)
    })

    it('rejeita sequência repetida', () => {
      expect(isValidPhone('(11) 11111-1111')).toBe(false)
      expect(isValidPhone('11111111111')).toBe(false)
    })

    it('rejeita tamanho inválido', () => {
      expect(isValidPhone('(11) 9999-999')).toBe(false) // 9 dígitos
      expect(isValidPhone('(11) 99999-99999')).toBe(false) // 12 dígitos
      expect(isValidPhone('999999999')).toBe(false)
    })
  })

  describe('formatPhone', () => {
    it('formata celular (11 dígitos)', () => {
      expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
      expect(formatPhone('(11) 99999-9999')).toBe('(11) 99999-9999')
      expect(formatPhone('+55 11 99999-9999')).toBe('(11) 99999-9999')
    })

    it('formata fixo (10 dígitos)', () => {
      // 10 dígitos válidos: DDD + 8 dígitos, 3º dígito NÃO é 9
      expect(formatPhone('1188888888')).toBe('(11) 8888-8888')
      expect(formatPhone('(11) 8888-8888')).toBe('(11) 8888-8888')
    })

    it('retorna original se inválido', () => {
      expect(formatPhone('123')).toBe('123')
      expect(formatPhone('abc')).toBe('abc')
    })
  })

  describe('maskPhone', () => {
    it('aplica máscara progressiva', () => {
      expect(maskPhone('1')).toBe('1')
      expect(maskPhone('11')).toBe('11')
      expect(maskPhone('119')).toBe('(11) 9')
      expect(maskPhone('1199')).toBe('(11) 99')
      expect(maskPhone('11999')).toBe('(11) 999')
      expect(maskPhone('119999')).toBe('(11) 9999')
      expect(maskPhone('1199999')).toBe('(11) 9999-9')
      expect(maskPhone('11999999')).toBe('(11) 9999-99')
      expect(maskPhone('119999999')).toBe('(11) 9999-999')
      expect(maskPhone('1199999999')).toBe('(11) 9999-9999')
      expect(maskPhone('11999999999')).toBe('(11) 99999-9999')
    })
  })
})