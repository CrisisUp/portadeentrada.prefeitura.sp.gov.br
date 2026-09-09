import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { StatusPrograma } from '@/types'
import { logger } from '@/lib/logger'
import { AUTH_ERRORS, PROGRAMA_ERRORS, SYSTEM_ERRORS } from '@/lib/errors'

const VALID_STATUS = Object.values(StatusPrograma)

export async function GET() {
  try {
    const programas = await prisma.programaCultural.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(programas)
  } catch (error) {
    logger.error('Erro ao buscar programas', { error })
    return NextResponse.json(
      { error: PROGRAMA_ERRORS.FETCH_FAILED },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  if (token.role !== 'ADMIN' && token.role !== 'EDITOR') {
    return NextResponse.json({ error: SYSTEM_ERRORS.PERMISSION_DENIED }, { status: 403 })
  }

  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Formato de dados inválido. Envie os dados em JSON.' },
      { status: 415 }
    )
  }

  const body = await request.json()
  const { titulo, descricao, categoria, status, dataInicio, dataFim } = body

  if (!titulo || !descricao || !categoria) {
    return NextResponse.json(
      { error: 'Título, descrição e categoria são obrigatórios' },
      { status: 400 }
    )
  }

  // Validar status se fornecido
  if (status && !VALID_STATUS.includes(status)) {
    return NextResponse.json(
      { error: `Status inválido. Valores permitidos: ${VALID_STATUS.join(', ')}` },
      { status: 400 }
    )
  }

  // Converter datas de string para Date
  const parsedDataInicio = dataInicio ? new Date(dataInicio) : null
  const parsedDataFim = dataFim ? new Date(dataFim) : null

  // Validar datas
  if (parsedDataInicio && isNaN(parsedDataInicio.getTime())) {
    return NextResponse.json(
      { error: 'Data de início inválida' },
      { status: 400 }
    )
  }
  if (parsedDataFim && isNaN(parsedDataFim.getTime())) {
    return NextResponse.json(
      { error: 'Data de fim inválida' },
      { status: 400 }
    )
  }

  try {
    const programa = await prisma.programaCultural.create({
      data: {
        titulo,
        descricao,
        categoria,
        status: status || StatusPrograma.aberto,
        dataInicio: parsedDataInicio,
        dataFim: parsedDataFim,
      },
    })
    return NextResponse.json(programa, { status: 201 })
  } catch (error) {
    logger.error('Erro ao criar programa', { error })
    return NextResponse.json(
      { error: PROGRAMA_ERRORS.CREATE_FAILED },
      { status: 500 }
    )
  }
}
