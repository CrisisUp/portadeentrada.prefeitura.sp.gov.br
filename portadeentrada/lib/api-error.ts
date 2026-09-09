/**
 * Error handling wrapper para API routes
 * Padroniza responses de erro e logging
 */

import { NextResponse } from 'next/server'
import { logger } from './logger'
import { ZodError } from 'zod'

export interface ApiErrorResponse {
  error: string
  message: string
  details?: Record<string, string[]>
  timestamp: string
  path: string
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string, details?: Record<string, string[]>): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details)
  }

  static unauthorized(message: string = 'Não autorizado'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message)
  }

  static forbidden(message: string = 'Acesso negado'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message)
  }

  static notFound(message: string = 'Recurso não encontrado'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message)
  }

  static conflict(message: string, details?: Record<string, string[]>): ApiError {
    return new ApiError(409, 'CONFLICT', message, details)
  }

  static internal(message: string = 'Erro interno do servidor'): ApiError {
    return new ApiError(500, 'INTERNAL_ERROR', message)
  }

  static rateLimited(retryAfter: number): ApiError {
    return new ApiError(429, 'RATE_LIMITED', 'Muitas tentativas. Tente novamente mais tarde.', {
      retryAfter: [retryAfter.toString()],
    })
  }
}

export function handleApiError(error: unknown, path: string): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString()

  // Zod validation errors
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {}
    error.issues.forEach((err) => {
      const pathKey = err.path.join('.')
      if (!details[pathKey]) details[pathKey] = []
      details[pathKey].push(err.message)
    })

    logger.warn('Validation error', { path, details, timestamp })

    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details,
        timestamp,
        path,
      },
      { status: 400 }
    )
  }

  // Custom ApiError
  if (error instanceof ApiError) {
    const logLevel = error.statusCode >= 500 ? 'error' : 'warn'
    logger[logLevel](`API Error: ${error.code}`, {
      path,
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
      timestamp,
    })

    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
        details: error.details,
        timestamp,
        path,
      },
      { status: error.statusCode }
    )
  }

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: Record<string, unknown> }

    if (prismaError.code === 'P2002') {
      // Unique constraint violation
      const field = prismaError.meta?.target as string[] | undefined
      return NextResponse.json(
        {
          error: 'CONFLICT',
          message: `Registro duplicado${field ? ` em ${field.join(', ')}` : ''}`,
          details: field ? { [field.join('.')]: ['Já existe um registro com este valor'] } : undefined,
          timestamp,
          path,
        },
        { status: 409 }
      )
    }

    if (prismaError.code === 'P2025') {
      // Record not found
      return NextResponse.json(
        {
          error: 'NOT_FOUND',
          message: 'Registro não encontrado',
          timestamp,
          path,
        },
        { status: 404 }
      )
    }
  }

  // Unknown error
  logger.error('Unhandled API error', { path, error: String(error), timestamp })

  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      timestamp,
      path,
    },
    { status: 500 }
  )
}

/**
 * Wrapper para API routes com error handling padronizado
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      const request = args[0] as Request
      return handleApiError(error, request.url)
    }
  }
}

/**
 * Wrapper para async handlers em Server Components / Actions
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorContext?: string
): Promise<{ data: T | null; error: ApiError | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (error) {
    logger.error(errorContext || 'Async operation failed', { error: String(error) })
    return { data: null, error: error instanceof ApiError ? error : ApiError.internal() }
  }
}