import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { StatusPrograma } from '@/types'
import { AUTH_ERRORS, PROGRAMA_ERRORS, SYSTEM_ERRORS } from '@/lib/errors'

const VALID_STATUS = Object.values(StatusPrograma)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const programa = await prisma.programaCultural.findUnique({
    where: { id },
  })

  if (!programa) {
    return NextResponse.json(
      { error: PROGRAMA_ERRORS.NOT_FOUND },
      { status: 404 }
    )
  }

  return NextResponse.json(programa)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params
  const body = await request.json()

  // Campos permitidos para atualização
  const allowedFields = ['titulo', 'descricao', 'categoria', 'status', 'dataInicio', 'dataFim']

  // Filtrar apenas campos permitidos
  const filteredData: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) {
      filteredData[field] = body[field]
    }
  }

  // Validar que há pelo menos um campo para atualizar
  if (Object.keys(filteredData).length === 0) {
    return NextResponse.json(
      { error: 'Nenhum campo válido para atualização' },
      { status: 400 }
    )
  }

  // Validar status se fornecido
  if (filteredData.status && !VALID_STATUS.includes(filteredData.status as StatusPrograma)) {
    return NextResponse.json(
      { error: `Status inválido. Valores permitidos: ${VALID_STATUS.join(', ')}` },
      { status: 400 }
    )
  }

  // Converter datas de string para Date
  if (filteredData.dataInicio) {
    const date = new Date(filteredData.dataInicio as string)
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Data de início inválida' },
        { status: 400 }
      )
    }
    filteredData.dataInicio = date
  }

  if (filteredData.dataFim) {
    const date = new Date(filteredData.dataFim as string)
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Data de fim inválida' },
        { status: 400 }
      )
    }
    filteredData.dataFim = date
  }

  try {
    const programa = await prisma.programaCultural.update({
      where: { id },
      data: filteredData,
    })
    return NextResponse.json(programa)
  } catch {
    return NextResponse.json(
      { error: PROGRAMA_ERRORS.UPDATE_FAILED },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  if (token.role !== 'ADMIN') {
    return NextResponse.json({ error: SYSTEM_ERRORS.PERMISSION_DENIED }, { status: 403 })
  }

  const { id } = await params

  try {
    await prisma.programaCultural.delete({
      where: { id },
    })
    return NextResponse.json({ message: 'Programa removido com sucesso' })
  } catch {
    return NextResponse.json(
      { error: PROGRAMA_ERRORS.DELETE_FAILED },
      { status: 500 }
    )
  }
}
