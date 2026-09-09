/**
 * Logger estruturado para o projeto Porta de Entrada.
 *
 * Atualmente usa console, mas pode ser expandido para:
 * - Sentry (erros em produção)
 * - DataDog (métricas e logs)
 * - Google Analytics (eventos)
 *
 * Uso:
 *   import { logger } from '@/lib/logger'
 *   logger.error('Erro ao buscar dados', { error, context: 'fetchProgramas' })
 *   logger.warn('Rate limit atingido', { ip, count })
 *   logger.info('Usuário criado', { userId, email })
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  context?: LogContext
  timestamp: string
}

// ========================================
// Audit event types
export type AuditEventType =
  // Auth events
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.logout'
  | 'auth.register'
  | 'auth.password.reset'
  | 'auth.password.reset.failure'
  | 'auth.session.regenerated'
  // Admin actions
  | 'admin.inscricao.approved'
  | 'admin.inscricao.rejected'
  | 'admin.inscricao.bulk_update'
  | 'admin.programa.created'
  | 'admin.programa.updated'
  | 'admin.programa.deleted'
  | 'admin.user.role_changed'
  // Access events
  | 'access.denied'
  | 'access.unauthorized'
  // Rate limit events
  | 'ratelimit.hit'
  | 'ratelimit.warning'
  // Security events
  | 'security.csp_report'
  | 'security.xss_attempt'
  | 'security.suspicious_activity'

interface AuditLogEntry {
  event: AuditEventType
  userId?: string
  email?: string
  ip?: string
  userAgent?: string
  details?: LogContext
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

// Severity mapping for audit events
const AUDIT_SEVERITY: Record<AuditEventType, 'low' | 'medium' | 'high' | 'critical'> = {
  'auth.login.success': 'low',
  'auth.login.failure': 'medium',
  'auth.logout': 'low',
  'auth.register': 'low',
  'auth.password.reset': 'medium',
  'auth.password.reset.failure': 'medium',
  'auth.session.regenerated': 'medium',
  'admin.inscricao.approved': 'low',
  'admin.inscricao.rejected': 'low',
  'admin.inscricao.bulk_update': 'low',
  'admin.programa.created': 'low',
  'admin.programa.updated': 'low',
  'admin.programa.deleted': 'medium',
  'admin.user.role_changed': 'high',
  'access.denied': 'high',
  'access.unauthorized': 'high',
  'ratelimit.hit': 'medium',
  'ratelimit.warning': 'high',
  'security.csp_report': 'high',
  'security.xss_attempt': 'critical',
  'security.suspicious_activity': 'critical',
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`
  if (entry.context && Object.keys(entry.context).length > 0) {
    return `${base} ${JSON.stringify(entry.context)}`
  }
  return base
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  }

  const formatted = formatLog(entry)

  switch (level) {
    case 'error':
      console.error(formatted)
      // TODO: Enviar para Sentry em produção
      // if (process.env.NODE_ENV === 'production') Sentry.captureException(context?.error)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'info':
      console.info(formatted)
      break
    case 'debug':
      console.debug(formatted)
      break
  }
}

/**
 * Registra evento de auditoria estruturado
 * Usa console.warn para events de medium+ severity, console.info para low
 * Pode ser expandido para enviar para serviço externo (Sentry, DataDog, etc)
 */
function audit(
  event: AuditEventType,
  context?: {
    userId?: string
    email?: string
    ip?: string
    userAgent?: string
    details?: LogContext
  }
): void {
  const severity = AUDIT_SEVERITY[event]

  const entry: AuditLogEntry = {
    event,
    userId: context?.userId,
    email: context?.email,
    ip: context?.ip,
    userAgent: context?.userAgent,
    details: context?.details,
    timestamp: new Date().toISOString(),
    severity,
  }

  const message = `AUDIT: ${event}`
  const formatted = `[${entry.timestamp}] [AUDIT:${severity.toUpperCase()}] ${message} ${JSON.stringify({
    userId: entry.userId,
    email: entry.email,
    ip: entry.ip,
    details: entry.details,
  })}`

  // Use appropriate log level based on severity
  if (severity === 'critical' || severity === 'high') {
    console.error(formatted)
  } else if (severity === 'medium') {
    console.warn(formatted)
  } else {
    console.info(formatted)
  }

  // TODO: Em produção, enviar para serviço de auditoria
  // if (process.env.NODE_ENV === 'production') {
  //   await sendToAuditService(entry)
  // }
}

export const logger = {
  error: (message: string, context?: LogContext) => log('error', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  audit,
}

export type { AuditLogEntry }
