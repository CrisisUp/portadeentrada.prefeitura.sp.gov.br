import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { AUTH_ERRORS, SYSTEM_ERRORS } from '@/lib/errors'

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  if (token.role !== 'ADMIN') {
    return NextResponse.json({ error: SYSTEM_ERRORS.PERMISSION_DENIED }, { status: 403 })
  }

  try {
    // Buscar estatísticas reais do banco de dados
    const [
      totalProgramas,
      totalCategorias,
      totalUsuarios,
      totalInscricoes,
    ] = await Promise.all([
      prisma.programaCultural.count(),
      prisma.programaCultural.groupBy({
        by: ['categoria'],
      }).then((result: { categoria: string }[]) => result.length),
      prisma.user.count(),
      prisma.inscricao.count(),
    ])

    return NextResponse.json({
      programas: totalProgramas,
      categorias: totalCategorias,
      usuarios: totalUsuarios,
      inscricoes: totalInscricoes,
    })
  } catch (error) {
    logger.error('Erro ao buscar estatísticas', { error })
    return NextResponse.json(
      { error: SYSTEM_ERRORS.SERVER },
      { status: 500 }
    )
  }
}
