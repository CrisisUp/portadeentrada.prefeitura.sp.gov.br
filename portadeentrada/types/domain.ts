/**
 * Tipos de domínio centralizados - re-exporta types do Prisma Client
 * Evita interfaces locais duplicadas e garante type safety
 */

import type {
  ProgramaCultural,
  Inscricao,
  User,
  Role,
} from '@prisma/client'

import {
  StatusPrograma,
  StatusInscricao,
} from '@prisma/client'

// Re-export Prisma types
export type {
  ProgramaCultural,
  Inscricao,
  User,
  Role,
}

// Re-export enums as values (needed for runtime checks like Object.values())
export {
  StatusPrograma,
  StatusInscricao,
}

// Tipos compostos para APIs (com relações)
export type ProgramaCulturalCompleto = ProgramaCultural & {
  inscricoes?: Inscricao[]
}

export type InscricaoCompleta = Inscricao & {
  programa: Pick<ProgramaCultural, 'id' | 'titulo' | 'categoria'>
}

export type UserCompleto = User & {
  inscricoes?: Inscricao[]
}

// Tipos para formulários/inputs
export type ProgramaCulturalInput = Omit<
  ProgramaCultural,
  'id' | 'createdAt' | 'updatedAt' | 'inscricoes'
>

export type ProgramaCulturalUpdate = Partial<ProgramaCulturalInput>

export type InscricaoInput = Omit<
  Inscricao,
  'id' | 'createdAt' | 'updatedAt' | 'programa' | 'status'
> & {
  status?: StatusInscricao
}

export type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'emailVerified' | 'role'>