/**
 * Validação de CPF compartilhada (client + server)
 * Elimina duplicação entre frontend e backend
 */

export interface CpfValidationResult {
  valid: boolean
  formatted?: string
  error?: string
}

/**
 * Remove caracteres não numéricos do CPF
 */
export function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

/**
 * Verifica se CPF tem 11 dígitos
 */
export function hasValidLength(cpf: string): boolean {
  return cpf.length === 11
}

/**
 * Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
 */
export function isAllSameDigits(cpf: string): boolean {
  return /^(\d)\1{10}$/.test(cpf)
}

/**
 * Calcula dígito verificador do CPF
 */
function calculateVerifierDigit(cpf: string, factor: number): number {
  let sum = 0
  for (let i = 0; i < factor - 1; i++) {
    sum += parseInt(cpf[i], 10) * (factor - i)
  }
  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}

/**
 * Valida dígitos verificadores do CPF
 */
export function validateCheckDigits(cpf: string): boolean {
  const firstVerifier = calculateVerifierDigit(cpf, 10)
  const secondVerifier = calculateVerifierDigit(cpf, 11)

  return (
    firstVerifier === parseInt(cpf[9], 10) &&
    secondVerifier === parseInt(cpf[10], 10)
  )
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 */
export function formatCpf(cpf: string): string {
  const cleaned = cleanCpf(cpf)
  if (cleaned.length !== 11) return cpf
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
}

/**
 * Validação completa de CPF
 * Retorna objeto com resultado detalhado
 */
export function validateCpf(cpf: string): CpfValidationResult {
  const cleaned = cleanCpf(cpf)

  if (!cleaned) {
    return { valid: false, error: 'CPF é obrigatório' }
  }

  if (!hasValidLength(cleaned)) {
    return { valid: false, formatted: formatCpf(cleaned), error: 'CPF deve ter 11 dígitos' }
  }

  if (isAllSameDigits(cleaned)) {
    return { valid: false, formatted: formatCpf(cleaned), error: 'CPF inválido' }
  }

  if (!validateCheckDigits(cleaned)) {
    return { valid: false, formatted: formatCpf(cleaned), error: 'CPF inválido' }
  }

  return { valid: true, formatted: formatCpf(cleaned) }
}

/**
 * Validação simples (boolean) - para uso rápido
 */
export function isValidCpf(cpf: string): boolean {
  return validateCpf(cpf).valid
}

export default {
  cleanCpf,
  hasValidLength,
  isAllSameDigits,
  validateCheckDigits,
  formatCpf,
  validateCpf,
  isValidCpf,
}