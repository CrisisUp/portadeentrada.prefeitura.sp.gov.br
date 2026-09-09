import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { StatusPrograma, StatusInscricao } from '@/types'
import { logger } from '@/lib/logger'
import { isValidCpf, cleanCpf } from '@/lib/cpf'
import { isValidPhone, cleanPhone } from '@/lib/phone'
import { AUTH_ERRORS, VALIDATION_ERRORS, PROGRAMA_ERRORS, INSCRICAO_ERRORS, SUCCESS_MESSAGES } from '@/lib/errors'

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Formato de dados inválido. Envie os dados em JSON.' },
      { status: 415 }
    )
  }

  const body = await request.json()
  const {
    programaId,
    nomeCompleto,
    email,
    telefone,
    cpf,
    rg,
    endereco,
    cidade,
    estado,
    cep,
    portfolioUrl,
    cartaIntencao,
  } = body

  // Validações obrigatórias
  const requiredFields = {
    programaId: 'Programa',
    nomeCompleto: 'Nome completo',
    email: 'Email',
    cpf: 'CPF',
  }

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!body[field] || String(body[field]).trim() === '') {
      return NextResponse.json(
        { error: VALIDATION_ERRORS.FIELD_REQUIRED(label) },
        { status: 400 }
      )
    }
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: AUTH_ERRORS.INVALID_EMAIL },
      { status: 400 }
    )
  }

  // Validar CPF (completo - modulus 11)
  const cpfClean = cleanCpf(cpf)
  if (!isValidCpf(cpfClean)) {
    return NextResponse.json(
      { error: VALIDATION_ERRORS.INVALID_CPF },
      { status: 400 }
    )
  }

  // Validar telefone se fornecido (opcional)
  let telefoneClean: string | null = null
  if (telefone && String(telefone).trim() !== '') {
    telefoneClean = cleanPhone(telefone)
    if (!isValidPhone(telefoneClean)) {
      return NextResponse.json(
        { error: VALIDATION_ERRORS.INVALID_PHONE },
        { status: 400 }
      )
    }
  }

  try {
    // Verificar se programa existe e está aberto
    const programa = await prisma.programaCultural.findUnique({
      where: { id: programaId },
    })

    if (!programa) {
      return NextResponse.json(
        { error: PROGRAMA_ERRORS.NOT_FOUND },
        { status: 404 }
      )
    }

    if (programa.status !== StatusPrograma.aberto) {
      return NextResponse.json(
        { error: PROGRAMA_ERRORS.NOT_ACCEPTING },
        { status: 400 }
      )
    }

    // Verificar se já existe inscrição para este CPF neste programa
    const existingInscricao = await prisma.inscricao.findFirst({
      where: {
        programaId,
        cpf: cpfClean,
      },
    })

    if (existingInscricao) {
      return NextResponse.json(
        { error: PROGRAMA_ERRORS.ALREADY_ENROLLED },
        { status: 409 }
      )
    }

    // Criar inscrição
    const inscricao = await prisma.inscricao.create({
      data: {
        programaId,
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim().toLowerCase(),
        telefone: telefoneClean,
        cpf: cpfClean,
        rg: rg?.trim() || null,
        endereco: endereco?.trim() || null,
        cidade: cidade?.trim() || null,
        estado: estado?.trim() || null,
        cep: cep?.replace(/\D/g, '') || null,
        portfolioUrl: portfolioUrl?.trim() || null,
        cartaIntencao: cartaIntencao?.trim() || null,
        status: StatusInscricao.pendente,
      },
      include: {
        programa: {
          select: { titulo: true },
        },
      },
    })

    return NextResponse.json(
      {
        message: SUCCESS_MESSAGES.INSCRICAO,
        inscricao: {
          id: inscricao.id,
          programa: inscricao.programa.titulo,
          status: inscricao.status,
          createdAt: inscricao.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Erro ao criar inscrição', { error })
    return NextResponse.json(
      { error: INSCRICAO_ERRORS.CREATE_FAILED },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.json({ error: AUTH_ERRORS.UNAUTHORIZED }, { status: 401 })
  }

  try {
    // Admin/Editor veem todas, Viewer vê apenas suas
    const where = token.role === 'VIEWER' && token.email
      ? { email: token.email }
      : {}

    const inscricoes = await prisma.inscricao.findMany({
      where,
      include: {
        programa: {
          select: { id: true, titulo: true, categoria: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(inscricoes)
  } catch (error) {
    logger.error('Erro ao buscar inscrições', { error })
    return NextResponse.json(
      { error: INSCRICAO_ERRORS.FETCH_FAILED },
      { status: 500 }
    )
  }
}