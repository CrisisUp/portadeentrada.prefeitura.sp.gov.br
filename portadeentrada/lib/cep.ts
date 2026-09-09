/**
 * Utilitários de validação e consulta de CEP
 * CEP brasileiro: 8 dígitos (XXXXX-XXX ou XXXXXXXX)
 */

export interface CepData {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

/**
 * Remove caracteres não numéricos do CEP
 */
export function cleanCep(cep: string): string {
  return cep.replace(/\D/g, '')
}

/**
 * Valida formato de CEP brasileiro (8 dígitos)
 */
export function isValidCepFormat(cep: string): boolean {
  const cleaned = cleanCep(cep)
  return /^\d{8}$/.test(cleaned)
}

/**
 * Formata CEP para exibição (XXXXX-XXX)
 */
export function formatCep(cep: string): string {
  const cleaned = cleanCep(cep)
  if (cleaned.length !== 8) return cep
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
}

/**
 * Consulta CEP via API ViaCEP
 * Retorna dados do endereço ou null se não encontrado/erro
 */
export async function fetchCep(cep: string): Promise<CepData | null> {
  const cleaned = cleanCep(cep)

  if (!isValidCepFormat(cleaned)) {
    return null
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`, {
      next: { revalidate: 86400 }, // Cache 24h
    })

    if (!response.ok) {
      return null
    }

    const data: CepData = await response.json()

    // ViaCEP retorna { erro: true } quando CEP não encontrado
    if (data.erro) {
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao consultar CEP:', error)
    return null
  }
}

/**
 * Valida CEP completo: formato + existência (opcional via API)
 */
export async function validateCep(cep: string, checkExistence = false): Promise<boolean> {
  if (!isValidCepFormat(cep)) {
    return false
  }

  if (!checkExistence) {
    return true
  }

  const data = await fetchCep(cep)
  return data !== null
}

export default {
  cleanCep,
  isValidCepFormat,
  formatCep,
  fetchCep,
  validateCep,
}