import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Configuração do Redis (Upstash) - variáveis de ambiente necessárias:
// UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
// UPSTASH_REDIS_REST_TOKEN=xxx

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const redisConfigured = Boolean(UPSTASH_URL && UPSTASH_TOKEN)

const redis = redisConfigured
  ? new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! })
  : null

// Rate limiter para registro: 5 requests por hora por IP
export const registerRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(5, '1 h'),
      prefix: 'ratelimit:register',
    })
  : null

// Rate limiter para login: 10 tentativas por 15 min por IP
export const loginRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(10, '15 m'),
      prefix: 'ratelimit:login',
    })
  : null

// Rate limiter genérico para API: 100 requests por minuto por IP
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(100, '1 m'),
      prefix: 'ratelimit:api',
    })
  : null

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetTime: number
  limit: number
}

export async function checkRateLimit(
  ratelimit: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  // Se Redis não está configurado, permitir acesso (dev mode)
  if (!ratelimit) {
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000,
      limit: 999,
    }
  }

  const result = await ratelimit.limit(identifier)
  return {
    allowed: result.success,
    remaining: result.remaining,
    resetTime: result.reset,
    limit: result.limit,
  }
}

export { redisConfigured }
