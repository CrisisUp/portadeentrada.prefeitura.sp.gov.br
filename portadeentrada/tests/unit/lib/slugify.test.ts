import { describe, it, expect } from 'vitest'
import { slugify, programaSlug } from '@/lib/slugify'

describe('Slugify Utilities', () => {
  describe('slugify', () => {
    it('converts to lowercase', () => {
      expect(slugify('HELLO WORLD')).toBe('hello-world')
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('removes accents', () => {
      expect(slugify('São Paulo')).toBe('sao-paulo')
      expect(slugify('Fomento à Cultura')).toBe('fomento-a-cultura')
      expect(slugify('Programação Cultural')).toBe('programacao-cultural')
      expect(slugify('Formação')).toBe('formacao')
      expect(slugify('Virada Cultural')).toBe('virada-cultural')
    })

    it('replaces non-alphanumeric with hyphens', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
      expect(slugify('Test@#$%')).toBe('test')
      expect(slugify('A&B')).toBe('a-b')
    })

    it('collapses multiple hyphens', () => {
      expect(slugify('Hello---World')).toBe('hello-world')
      expect(slugify('A  B  C')).toBe('a-b-c')
    })

    it('trims hyphens from start and end', () => {
      expect(slugify('-hello')).toBe('hello')
      expect(slugify('hello-')).toBe('hello')
      expect(slugify('-hello-')).toBe('hello')
      expect(slugify('---')).toBe('')
    })

    it('handles empty string', () => {
      expect(slugify('')).toBe('')
    })

    it('handles numbers', () => {
      expect(slugify('Programa 2026')).toBe('programa-2026')
      expect(slugify('Edital 123')).toBe('edital-123')
    })
  })

  describe('programaSlug', () => {
    it('prepends slash', () => {
      expect(programaSlug('Fomento à Cultura')).toBe('/fomento-a-cultura')
      expect(programaSlug('PROMAC')).toBe('/promac')
      expect(programaSlug('Virada Cultural')).toBe('/virada-cultural')
    })

    it('works with complex titles', () => {
      expect(programaSlug('Editais para Oficinas')).toBe('/editais-para-oficinas')
      expect(programaSlug('Programação Cultural')).toBe('/programacao-cultural')
    })
  })
})