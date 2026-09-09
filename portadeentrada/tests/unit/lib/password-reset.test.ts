import { describe, it, expect } from 'vitest'
import { generateResetToken } from '@/lib/password-reset'

describe('Password Reset Token', () => {
  describe('generateResetToken', () => {
    it('generates a 64-character hex string', () => {
      const token = generateResetToken()
      expect(token).toHaveLength(64)
      expect(/^[a-f0-9]+$/.test(token)).toBe(true)
    })

    it('generates unique tokens', () => {
      const token1 = generateResetToken()
      const token2 = generateResetToken()
      expect(token1).not.toBe(token2)
    })

    it('generates different tokens on each call', () => {
      const tokens = new Set<string>()
      for (let i = 0; i < 10; i++) {
        tokens.add(generateResetToken())
      }
      // All 10 should be unique
      expect(tokens.size).toBe(10)
    })
  })
})
