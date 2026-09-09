import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResetToken } from '@/lib/password-reset'
import { logger } from '@/lib/logger'

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 * Always returns 200 to prevent user enumeration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      // Still return 200 to prevent enumeration
      return NextResponse.json({ message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      // Log the attempt but don't reveal user existence
      logger.audit('auth.password.reset.failure', {
        email: email.toLowerCase().trim(),
        details: { reason: 'user_not_found' },
      })
      return NextResponse.json({ message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' })
    }

    const token = await createResetToken(user.id)

    // In production, send email here:
    // await sendPasswordResetEmail(user.email, token)
    // For now, log the token (dev only)
    logger.info(`[DEV] Password reset token for ${user.email}: ${token}`)
    logger.info(`[DEV] Reset URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`)

    logger.audit('auth.password.reset', {
      userId: user.id,
      email: user.email,
      details: { tokenGenerated: true },
    })

    return NextResponse.json({ message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' })
  } catch (error) {
    logger.error('Erro no forgot-password', { error })
    // Still return 200 to prevent information leakage
    return NextResponse.json({ message: 'Se o email estiver cadastrado, você receberá um link de redefinição.' })
  }
}
