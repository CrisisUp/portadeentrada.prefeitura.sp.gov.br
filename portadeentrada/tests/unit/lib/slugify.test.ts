import { describe, it, expect } from 'vitest'
import { slugify, generateUniqueSlug, programaSlug } from '@/lib/slugify'

describe('lib/slugify', () => {
  describe('slugify', () => {
    it('converte para lowercase', () => {
      expect(slugify('TEXTO')).toBe('texto')
      expect(slugify('Texto')).toBe('texto')
    })

    it('remove acentos', () => {
      expect(slugify('café')).toBe('cafe')
      expect(slugify('São Paulo')).toBe('sao-paulo')
      expect(slugify('ação')).toBe('acao')
      expect(slugify('útil')).toBe('util')
    })

    it('substitui espaços e caracteres especiais por hífen', () => {
      expect(slugify('hello world')).toBe('hello-world')
      expect(slugify('hello@world')).toBe('hello-world')
      expect(slugify('hello#world$')).toBe('hello-world')
    })

    it('colapsa múltiplos hífens em um', () => {
      expect(slugify('hello   world')).toBe('hello-world')
      expect(slugify('hello---world')).toBe('hello-world')
    })

    it('remove hífens no início e fim', () => {
      expect(slugify('-hello')).toBe('hello')
      expect(slugify('hello-')).toBe('hello')
      expect(slugify('-hello-')).toBe('hello')
    })

    it('mantém números', () => {
      expect(slugify('teste123')).toBe('teste123')
      expect(slugify('123')).toBe('123')
    })

    it('remove caracteres especiais diversos', () => {
      expect(slugify('Olá, Mundo!')).toBe('ola-mundo')
      expect(slugify('Teste (com) parênteses')).toBe('teste-com-parenteses')
      expect(slugify('A&B')).toBe('a-b')
    })

    it('retorna string vazia para input vazio', () => {
      expect(slugify('')).toBe('')
      expect(slugify('   ')).toBe('')
      expect(slugify('!!!')).toBe('')
    })

    it('trata strings complexas', () => {
      expect(slugify('Fomento à Cultura 2024')).toBe('fomento-a-cultura-2024')
      expect(slugify('PROGRAMA DE INICIAÇÃO ARTÍSTICA')).toBe('programa-de-iniciacao-artistica')
    })
  })

  describe('generateUniqueSlug', () => {
    it('retorna baseSlug se não existe', () => {
      const existing: string[] = []
      expect(generateUniqueSlug('meu-programa', existing)).toBe('meu-programa')
    })

    it('adiciona sufixo se baseSlug existe', () => {
      const existing = ['meu-programa']
      expect(generateUniqueSlug('meu-programa', existing)).toBe('meu-programa-1')
    })

    it('incrementa contador se múltiplos existem', () => {
      const existing = ['meu-programa', 'meu-programa-1', 'meu-programa-2']
      expect(generateUniqueSlug('meu-programa', existing)).toBe('meu-programa-3')
    })

    it('não conflita com slugs similares', () => {
      const existing = ['meu-programa', 'meu-programa-outro']
      expect(generateUniqueSlug('meu-programa', existing)).toBe('meu-programa-1')
    })
  })

  describe('programaSlug', () => {
    it('gera slug com barra inicial', () => {
      expect(programaSlug('Fomento à Cultura')).toBe('/fomento-a-cultura')
      expect(programaSlug('Teste Programa')).toBe('/teste-programa')
    })

    it('aplica todas as regras do slugify', () => {
      expect(programaSlug('Olá, Mundo!')).toBe('/ola-mundo')
      expect(programaSlug('  Espaços  ')).toBe('/espacos')
    })
  })
})