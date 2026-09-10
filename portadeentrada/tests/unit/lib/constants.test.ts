import { describe, it, expect } from 'vitest'
import {
  CATEGORIAS,
  STATUS_OPTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_INSCRICAO_OPTIONS,
  STATUS_INSCRICAO_COLORS,
  STATUS_INSCRICAO_LABELS,
  ROLE_LABELS,
  ROLE_COLORS,
} from '@/lib/constants'
import { StatusPrograma, StatusInscricao } from '@prisma/client'

describe('lib/constants', () => {
  describe('CATEGORIAS', () => {
    it('contém todas as categorias esperadas', () => {
      expect(CATEGORIAS).toEqual([
        'Fomento',
        'Festival',
        'Cursos',
        'Editais Abertos',
        'Eventos',
        'Editais',
        'Educação',
      ])
    })

    it('é readonly (as const)', () => {
      expect(Array.isArray(CATEGORIAS)).toBe(true)
      expect(CATEGORIAS.length).toBe(7)
    })
  })

  describe('STATUS_OPTIONS (Programa)', () => {
    it('mapeia todos os StatusPrograma para labels', () => {
      expect(STATUS_OPTIONS).toHaveLength(3)
      expect(STATUS_OPTIONS).toEqual([
        { value: 'aberto', label: 'Aberto' },
        { value: 'em_andamento', label: 'Em andamento' },
        { value: 'encerrado', label: 'Encerrado' },
      ])
    })

    it('valores correspondem ao enum StatusPrograma', () => {
      const values = STATUS_OPTIONS.map((s) => s.value)
      expect(values).toEqual(Object.values(StatusPrograma))
    })
  })

  describe('STATUS_COLORS (Programa)', () => {
    it('define cor para cada StatusPrograma', () => {
      expect(STATUS_COLORS.aberto).toBe('bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300')
      expect(STATUS_COLORS.em_andamento).toBe('bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300')
      expect(STATUS_COLORS.encerrado).toBe('bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300')
    })

    it('cobre todos os valores do enum', () => {
      const enumValues = Object.values(StatusPrograma)
      const colorKeys = Object.keys(STATUS_COLORS)
      expect(colorKeys.sort()).toEqual(enumValues.sort())
    })
  })

  describe('STATUS_LABELS (Programa)', () => {
    it('define label legível para cada StatusPrograma', () => {
      expect(STATUS_LABELS.aberto).toBe('Aberto')
      expect(STATUS_LABELS.em_andamento).toBe('Em andamento')
      expect(STATUS_LABELS.encerrado).toBe('Encerrado')
    })

    it('cobre todos os valores do enum', () => {
      const enumValues = Object.values(StatusPrograma)
      const labelKeys = Object.keys(STATUS_LABELS)
      expect(labelKeys.sort()).toEqual(enumValues.sort())
    })
  })

  describe('STATUS_INSCRICAO_OPTIONS', () => {
    it('mapeia todos os StatusInscricao para labels', () => {
      expect(STATUS_INSCRICAO_OPTIONS).toHaveLength(3)
      expect(STATUS_INSCRICAO_OPTIONS).toEqual([
        { value: 'pendente', label: 'Pendente' },
        { value: 'aprovada', label: 'Aprovada' },
        { value: 'rejeitada', label: 'Rejeitada' },
      ])
    })

    it('valores correspondem ao enum StatusInscricao', () => {
      const values = STATUS_INSCRICAO_OPTIONS.map((s) => s.value)
      expect(values).toEqual(Object.values(StatusInscricao))
    })
  })

  describe('STATUS_INSCRICAO_COLORS', () => {
    it('define cor para cada StatusInscricao', () => {
      expect(STATUS_INSCRICAO_COLORS.pendente).toBe('bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300')
      expect(STATUS_INSCRICAO_COLORS.aprovada).toBe('bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300')
      expect(STATUS_INSCRICAO_COLORS.rejeitada).toBe('bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300')
    })

    it('cobre todos os valores do enum', () => {
      const enumValues = Object.values(StatusInscricao)
      const colorKeys = Object.keys(STATUS_INSCRICAO_COLORS)
      expect(colorKeys.sort()).toEqual(enumValues.sort())
    })
  })

  describe('STATUS_INSCRICAO_LABELS', () => {
    it('define label legível para cada StatusInscricao', () => {
      expect(STATUS_INSCRICAO_LABELS.pendente).toBe('Pendente')
      expect(STATUS_INSCRICAO_LABELS.aprovada).toBe('Aprovada')
      expect(STATUS_INSCRICAO_LABELS.rejeitada).toBe('Rejeitada')
    })

    it('cobre todos os valores do enum', () => {
      const enumValues = Object.values(StatusInscricao)
      const labelKeys = Object.keys(STATUS_INSCRICAO_LABELS)
      expect(labelKeys.sort()).toEqual(enumValues.sort())
    })
  })

  describe('ROLE_LABELS', () => {
    it('define label para cada Role', () => {
      expect(ROLE_LABELS.ADMIN).toBe('Administrador')
      expect(ROLE_LABELS.EDITOR).toBe('Editor')
      expect(ROLE_LABELS.VIEWER).toBe('Visualizador')
    })
  })

  describe('ROLE_COLORS', () => {
    it('define cor para cada Role', () => {
      expect(ROLE_COLORS.ADMIN).toBe('bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300')
      expect(ROLE_COLORS.EDITOR).toBe('bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300')
      expect(ROLE_COLORS.VIEWER).toBe('bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300')
    })
  })
})