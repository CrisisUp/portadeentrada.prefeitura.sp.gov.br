import { describe, it, expect } from 'vitest'
import {
  AUTH_ERRORS,
  VALIDATION_ERRORS,
  PROGRAMA_ERRORS,
  INSCRICAO_ERRORS,
  SYSTEM_ERRORS,
  SUCCESS_MESSAGES,
} from '@/lib/errors'

describe('Error Messages', () => {
  describe('AUTH_ERRORS', () => {
    it('has all required error messages', () => {
      expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBeDefined()
      expect(AUTH_ERRORS.UNAUTHORIZED).toBeDefined()
      expect(AUTH_ERRORS.SESSION_EXPIRED).toBeDefined()
      expect(AUTH_ERRORS.REQUIRED_FIELDS).toBeDefined()
      expect(AUTH_ERRORS.ACCOUNT_EXISTS).toBeDefined()
      expect(AUTH_ERRORS.INVALID_EMAIL).toBeDefined()
      expect(AUTH_ERRORS.WEAK_PASSWORD).toBeDefined()
      expect(AUTH_ERRORS.RATE_LIMIT).toBeDefined()
    })

    it('has user-friendly messages in Portuguese', () => {
      expect(AUTH_ERRORS.INVALID_CREDENTIALS).toContain('incorretos')
      expect(AUTH_ERRORS.UNAUTHORIZED).toContain('logado')
      expect(AUTH_ERRORS.ACCOUNT_EXISTS).toContain('cadastrado')
    })
  })

  describe('VALIDATION_ERRORS', () => {
    it('has validation messages', () => {
      expect(VALIDATION_ERRORS.INVALID_CPF).toBeDefined()
      expect(VALIDATION_ERRORS.INVALID_PHONE).toBeDefined()
      expect(VALIDATION_ERRORS.INVALID_DATE).toBeDefined()
      expect(VALIDATION_ERRORS.INVALID_URL).toBeDefined()
    })

    it('has factory functions', () => {
      expect(VALIDATION_ERRORS.FIELD_REQUIRED('nome')).toContain('nome')
      expect(VALIDATION_ERRORS.MAX_LENGTH('email', 100)).toContain('100')
    })
  })

  describe('PROGRAMA_ERRORS', () => {
    it('has all program error messages', () => {
      expect(PROGRAMA_ERRORS.NOT_FOUND).toBeDefined()
      expect(PROGRAMA_ERRORS.NOT_ACCEPTING).toBeDefined()
      expect(PROGRAMA_ERRORS.ALREADY_ENROLLED).toBeDefined()
      expect(PROGRAMA_ERRORS.CREATE_FAILED).toBeDefined()
      expect(PROGRAMA_ERRORS.UPDATE_FAILED).toBeDefined()
      expect(PROGRAMA_ERRORS.DELETE_FAILED).toBeDefined()
      expect(PROGRAMA_ERRORS.FETCH_FAILED).toBeDefined()
      expect(PROGRAMA_ERRORS.INVALID_DATA).toBeDefined()
    })
  })

  describe('INSCRICAO_ERRORS', () => {
    it('has all inscricao error messages', () => {
      expect(INSCRICAO_ERRORS.CREATE_FAILED).toBeDefined()
      expect(INSCRICAO_ERRORS.FETCH_FAILED).toBeDefined()
      expect(INSCRICAO_ERRORS.UPDATE_FAILED).toBeDefined()
      expect(INSCRICAO_ERRORS.NO_SELECTION).toBeDefined()
      expect(INSCRICAO_ERRORS.INVALID_STATUS).toBeDefined()
    })
  })

  describe('SYSTEM_ERRORS', () => {
    it('has all system error messages', () => {
      expect(SYSTEM_ERRORS.GENERIC).toBeDefined()
      expect(SYSTEM_ERRORS.NETWORK).toBeDefined()
      expect(SYSTEM_ERRORS.SERVER).toBeDefined()
      expect(SYSTEM_ERRORS.NOT_FOUND).toBeDefined()
      expect(SYSTEM_ERRORS.PERMISSION_DENIED).toBeDefined()
    })
  })

  describe('SUCCESS_MESSAGES', () => {
    it('has all required success messages', () => {
      expect(SUCCESS_MESSAGES.LOGIN).toBeDefined()
      expect(SUCCESS_MESSAGES.REGISTER).toBeDefined()
      expect(SUCCESS_MESSAGES.INSCRICAO).toBeDefined()
      expect(SUCCESS_MESSAGES.CSV_EXPORT).toBeDefined()
      expect(SUCCESS_MESSAGES.PROGRAMA_CREATED).toBeDefined()
      expect(SUCCESS_MESSAGES.PROGRAMA_UPDATED).toBeDefined()
      expect(SUCCESS_MESSAGES.PROGRAMA_DELETED).toBeDefined()
    })

    it('has factory function for INSCRICAO_UPDATE', () => {
      const msg = SUCCESS_MESSAGES.INSCRICAO_UPDATE(3, 'aprovadas')
      expect(msg).toContain('3')
      expect(msg).toContain('aprovadas')
    })
  })
})
