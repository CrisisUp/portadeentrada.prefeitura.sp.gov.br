/**
 * Zod schemas para validação e inferência de tipos API
 * Elimina duplicação de tipos manuais (ex: InscricaoAPI)
 */

import { z } from 'zod'
import { StatusInscricao, StatusPrograma, Role } from '@prisma/client'

// ========================================
// Enums (runtime values)
export const StatusInscricaoSchema = z.nativeEnum(StatusInscricao)
export const StatusProgramaSchema = z.nativeEnum(StatusPrograma)
export const RoleSchema = z.nativeEnum(Role)

// ========================================
// Base schemas (from Prisma models)
export const UserBaseSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  role: RoleSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ProgramaCulturalBaseSchema = z.object({
  id: z.string().cuid(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  categoria: z.string().min(1),
  status: StatusProgramaSchema,
  dataInicio: z.date().nullable(),
  dataFim: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const InscricaoBaseSchema = z.object({
  id: z.string().cuid(),
  programaId: z.string().cuid(),
  nomeCompleto: z.string().min(1),
  email: z.string().email(),
  telefone: z.string().nullable(),
  cpf: z.string().length(11),
  rg: z.string().nullable(),
  endereco: z.string().nullable(),
  cidade: z.string().nullable(),
  estado: z.string().nullable(),
  cep: z.string().nullable(),
  portfolioUrl: z.string().url().nullable().or(z.literal('')),
  cartaIntencao: z.string().nullable(),
  status: StatusInscricaoSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})

// ========================================
// Relations / composite types
export const ProgramaResumoSchema = z.object({
  id: z.string().cuid(),
  titulo: z.string(),
})

export const InscricaoCompletaSchema = InscricaoBaseSchema.extend({
  programa: ProgramaResumoSchema,
})

export const ProgramaCulturalCompletoSchema = ProgramaCulturalBaseSchema.extend({
  inscricoes: z.array(InscricaoBaseSchema).optional(),
})

// ========================================
// API Response schemas (serialized - dates as strings)
export const UserApiSchema = UserBaseSchema.transform((data) => ({
  ...data,
  createdAt: data.createdAt.toISOString(),
  updatedAt: data.updatedAt.toISOString(),
  emailVerified: data.emailVerified?.toISOString() ?? null,
}))

export const ProgramaCulturalApiSchema = ProgramaCulturalBaseSchema.transform((data) => ({
  ...data,
  createdAt: data.createdAt.toISOString(),
  updatedAt: data.updatedAt.toISOString(),
  dataInicio: data.dataInicio?.toISOString() ?? null,
  dataFim: data.dataFim?.toISOString() ?? null,
}))

export const InscricaoApiSchema = InscricaoBaseSchema.transform((data) => ({
  ...data,
  createdAt: data.createdAt.toISOString(),
  updatedAt: data.updatedAt.toISOString(),
}))

export const InscricaoCompletaApiSchema = InscricaoCompletaSchema.transform((data) => ({
  ...data,
  createdAt: data.createdAt.toISOString(),
  updatedAt: data.updatedAt.toISOString(),
}))

export const ProgramaCulturalCompletoApiSchema = ProgramaCulturalCompletoSchema.transform((data) => ({
  ...data,
  createdAt: data.createdAt.toISOString(),
  updatedAt: data.updatedAt.toISOString(),
  dataInicio: data.dataInicio?.toISOString() ?? null,
  dataFim: data.dataFim?.toISOString() ?? null,
  inscricoes: data.inscricoes?.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    updatedAt: i.updatedAt.toISOString(),
  })),
}))

// ========================================
// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
})

// ========================================
// Input schemas (for POST/PUT bodies)
export const CreateProgramaCulturalSchema = ProgramaCulturalBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  slug: z.string().min(1).optional(),
})

export const UpdateProgramaCulturalSchema = CreateProgramaCulturalSchema.partial()

export const CreateInscricaoSchema = InscricaoBaseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
}).extend({
  status: StatusInscricaoSchema.optional().default(StatusInscricao.pendente),
})

export const UpdateInscricaoSchema = CreateInscricaoSchema.partial().extend({
  status: StatusInscricaoSchema.optional(),
})

export const BulkUpdateInscricoesSchema = z.object({
  ids: z.array(z.string().cuid()).min(1),
  status: StatusInscricaoSchema,
})

// ========================================
// Query params schemas
export const InscricoesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: StatusInscricaoSchema.optional(),
  programaId: z.string().cuid().optional(),
})

export const ProgramasQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  status: StatusProgramaSchema.optional(),
  categoria: z.string().optional(),
})

// ========================================
// Type exports (inferred from schemas)
export type UserApi = z.infer<typeof UserApiSchema>
export type ProgramaCulturalApi = z.infer<typeof ProgramaCulturalApiSchema>
export type InscricaoApi = z.infer<typeof InscricaoApiSchema>
export type InscricaoCompletaApi = z.infer<typeof InscricaoCompletaApiSchema>
export type ProgramaCulturalCompletoApi = z.infer<typeof ProgramaCulturalCompletoApiSchema>
export type Pagination = z.infer<typeof PaginationSchema>

export type CreateProgramaCulturalInput = z.infer<typeof CreateProgramaCulturalSchema>
export type UpdateProgramaCulturalInput = z.infer<typeof UpdateProgramaCulturalSchema>
export type CreateInscricaoInput = z.infer<typeof CreateInscricaoSchema>
export type UpdateInscricaoInput = z.infer<typeof UpdateInscricaoSchema>
export type BulkUpdateInscricoesInput = z.infer<typeof BulkUpdateInscricoesSchema>
export type InscricoesQuery = z.infer<typeof InscricoesQuerySchema>
export type ProgramasQuery = z.infer<typeof ProgramasQuerySchema>

// ========================================
// Validation helpers
export function validateInscricoesQuery(query: Record<string, string | string[] | undefined>) {
  return InscricoesQuerySchema.safeParse(query)
}

export function validateProgramasQuery(query: Record<string, string | string[] | undefined>) {
  return ProgramasQuerySchema.safeParse(query)
}

export function validateCreateInscricao(data: unknown) {
  return CreateInscricaoSchema.safeParse(data)
}

export function validateUpdateInscricao(data: unknown) {
  return UpdateInscricaoSchema.safeParse(data)
}

export function validateBulkUpdateInscricoes(data: unknown) {
  return BulkUpdateInscricoesSchema.safeParse(data)
}