import { NextRequest, NextResponse } from 'next/server'
import { resetPassword } from '@/lib/password-reset'
import { logger } from '@/lib/logger'

/**
 * POST /api/auth/reset-password
 * Reset password using a valid token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token de redefinição é obrigatório.' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Nova senha é obrigatória.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const success = await resetPassword(token, password)

    if (!success) {
      logger.audit('auth.password.reset.failure', {
        details: { reason: 'invalid_token' },
      })
      return NextResponse.json(
        { error: 'Token inválido ou expirado. Solicite um novo link de redefinição.' },
        { status: 400 }
      )
    }

    logger.audit('auth.password.reset', {
      details: { success: true },
    })

    return NextResponse.json({ message: 'Senha redefinida com sucesso. Faça login com a nova senha.' })
  } catch (error) {
    logger.error('Erro no reset-password', { error })
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
