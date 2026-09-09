import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { loginRateLimit, checkRateLimit } from '@/lib/ratelimit'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ========================================
  // RATE LIMIT para /api/auth/* (apenas POST)
  // ========================================
  if (pathname.startsWith('/api/auth/') && req.method === 'POST') {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1'

    const { allowed, remaining, resetTime, limit } = await checkRateLimit(loginRateLimit, `login:${ip}`)

    if (!allowed) {
      const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetTime.toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      )
    }

    // Adicionar headers de rate limit à resposta
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', resetTime.toString())
    return response
  }

  // ========================================
  // AUTH PROTECTION para /admin e /cadastro
  // ========================================
  if (pathname.startsWith('/admin') || pathname.startsWith('/cadastro')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/cadastro/:path*', '/api/auth/:path*'],
}
