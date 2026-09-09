/**
 * Validação e formatação de telefone brasileiro
 * Suporta: (11) 99999-9999, 11 99999-9999, 11999999999, +55 11 99999-9999
 */

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function isValidPhone(phone: string): boolean {
  let cleaned = cleanPhone(phone)

  // Remove country code +55 if present
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    cleaned = cleaned.slice(2)
  }

  // Deve ter 10 ou 11 dígitos (com ou sem 9º dígito)
  if (cleaned.length !== 10 && cleaned.length !== 11) return false

  // DDD válido (11 a 99, exceto 00)
  const ddd = parseInt(cleaned.slice(0, 2), 10)
  if (ddd < 11 || ddd > 99) return false

  // Se 11 dígitos, o 3º dígito deve ser 9 (celular)
  // Se 10 dígitos, o 3º dígito NÃO deve ser 9 (fixo não tem 9º dígito)
  if (cleaned.length === 11 && cleaned[2] !== '9') return false
  if (cleaned.length === 10 && cleaned[2] === '9') return false

  // Não pode ser sequência repetida
  if (/^(\d)\1+$/.test(cleaned)) return false

  return true
}

export function formatPhone(phone: string): string {
  let cleaned = cleanPhone(phone)

  // Remove country code +55 if present
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    cleaned = cleaned.slice(2)
  }

  // Validate before formatting
  if (!isValidPhone(phone)) {
    return phone
  }

  if (cleaned.length === 11) {
    // (11) 99999-9999
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  if (cleaned.length === 10) {
    // (11) 9999-9999
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

export function maskPhone(phone: string): string {
  const cleaned = cleanPhone(phone)
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 6) return cleaned.replace(/(\d{2})(\d+)/, '($1) $2')
  if (cleaned.length <= 10) return cleaned.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
  return formatPhone(cleaned)
}