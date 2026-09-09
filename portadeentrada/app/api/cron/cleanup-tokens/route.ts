import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredTokens } from '@/lib/password-reset'
import { logger } from '@/lib/logger'

/**
 * GET /api/cron/cleanup-tokens
 * Vercel cron job - limpa tokens de reset de senha expirados
 * Protegido por CRON_SECRET
 */
export async function GET(request: NextRequest) {
  // Verificar autenticação do cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deleted = await cleanupExpiredTokens()
    logger.info(`Cron: ${deleted} expired password reset tokens cleaned up`)
    return NextResponse.json({ deleted })
  } catch (error) {
    logger.error('Cron: Error cleaning up tokens', { error })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
