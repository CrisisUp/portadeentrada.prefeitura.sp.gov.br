import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { StatusInscricao } from '@/types'
import { logger } from '@/lib/logger'
import { AUTH_ERRORS, INSCRICAO_ERRORS, SYSTEM_ERRORS } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token || (token.role !== 'ADMIN' && token.role !== 'EDITOR')) {
    return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  // Allowlist para ordenação segura
const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'nomeCompleto', 'email', 'status'] as const
const ALLOWED_SORT_ORDERS = ['asc', 'desc'] as const

type SortField = (typeof ALLOWED_SORT_FIELDS)[number]
type SortOrder = (typeof ALLOWED_SORT_ORDERS)[number]

function validateSortParams(sortBy: string, sortOrder: string): { sortBy: SortField; sortOrder: SortOrder } {
  const validatedSortBy = ALLOWED_SORT_FIELDS.includes(sortBy as SortField)
    ? (sortBy as SortField)
    : 'createdAt'
  const validatedSortOrder = ALLOWED_SORT_ORDERS.includes(sortOrder as SortOrder)
    ? (sortOrder as SortOrder)
    : 'desc'
  return { sortBy: validatedSortBy, sortOrder: validatedSortOrder }
}

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const programaId = searchParams.get('programaId') || ''
  const { sortBy, sortOrder } = validateSortParams(
    searchParams.get('sortBy') || 'createdAt',
    searchParams.get('sortOrder') || 'desc'
  )

  try {
    // Construir filtros
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { nomeCompleto: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
      ]
    }

    if (status && Object.values(StatusInscricao).includes(status as StatusInscricao)) {
      where.status = status as StatusInscricao
    }

    if (programaId) {
      where.programaId = programaId
    }

    // Buscar total para paginação
    const total = await prisma.inscricao.count({ where })

    // Buscar inscrições com paginação
    const inscricoes = await prisma.inscricao.findMany({
      where,
      include: {
        programa: {
          select: { id: true, titulo: true, categoria: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Buscar programas para filtros
    const programas = await prisma.programaCultural.findMany({
      select: { id: true, titulo: true },
      orderBy: { titulo: 'asc' },
    })

    return NextResponse.json({
      inscricoes,
      programas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Erro ao buscar inscrições admin', { error })
    return NextResponse.json(
      { error: INSCRICAO_ERRORS.FETCH_FAILED },
      { status: 500 }
    )
  }
}

// Atualizar status em lote
export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token || token.role !== 'ADMIN') {
    return NextResponse.json({ error: SYSTEM_ERRORS.PERMISSION_DENIED }, { status: 403 })
  }

  const body = await request.json()
  const { ids, status } = body

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: INSCRICAO_ERRORS.NO_SELECTION }, { status: 400 })
  }

  if (!status || !Object.values(StatusInscricao).includes(status)) {
    return NextResponse.json({ error: INSCRICAO_ERRORS.INVALID_STATUS }, { status: 400 })
  }

  try {
    const result = await prisma.inscricao.updateMany({
      where: { id: { in: ids } },
      data: { status: status as StatusInscricao },
    })

    logger.info('Status atualizado em lote', { count: result.count, status })

    return NextResponse.json({
      message: `${result.count} inscrição(ões) atualizada(s)`,
      count: result.count,
    })
  } catch (error) {
    logger.error('Erro ao atualizar inscrições', { error })
    return NextResponse.json(
      { error: INSCRICAO_ERRORS.UPDATE_FAILED },
      { status: 500 }
    )
  }
}
