/**
 * Mensagens de erro humanizadas para o projeto Porta de Entrada.
 * Todas as mensagens de erro devem usar este arquivo como single source of truth.
 *
 * Regras:
 * - Mensagens devem ser claras e amigáveis
 * - Evitar jargão técnico
 * - Incluir ação sugerida quando possível
 * - Manter tom profissional mas acolhedor
 */

// ===== Autenticação =====
export const AUTH_ERRORS = {
  UNAUTHORIZED: 'Você precisa estar logado para acessar esta funcionalidade.',
  SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente para continuar.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos. Verifique seus dados e tente novamente.',
  ACCOUNT_EXISTS: 'Este email já está cadastrado. Tente fazer login ou use outro email.',
  WEAK_PASSWORD: 'A senha precisa ter pelo menos 6 caracteres para sua segurança.',
  INVALID_EMAIL: 'O formato do email parece incorreto. Verifique e tente novamente.',
  REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios para continuar.',
  RATE_LIMIT: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
} as const

// ===== Validação =====
export const VALIDATION_ERRORS = {
  INVALID_CPF: 'O CPF informado não é válido. Verifique os números e tente novamente.',
  INVALID_PHONE: 'O telefone parece estar incorreto. Use o formato (11) 99999-9999.',
  INVALID_DATE: 'A data informada não parece ser válida. Verifique e tente novamente.',
  INVALID_URL: 'O link informado não parece ser válido. Verifique e tente novamente.',
  FIELD_REQUIRED: (field: string) => `O campo ${field} é obrigatório.`,
  MAX_LENGTH: (field: string, max: number) => `O campo ${field} deve ter no máximo ${max} caracteres.`,
} as const

// ===== Programas =====
export const PROGRAMA_ERRORS = {
  NOT_FOUND: 'Programa não encontrado. Ele pode ter sido removido ou o link está incorreto.',
  NOT_ACCEPTING: 'Este programa não está aceitando inscrições no momento.',
  ALREADY_ENROLLED: 'Você já está inscrito neste programa. Confira suas inscrições.',
  CREATE_FAILED: 'Não foi possível criar o programa. Tente novamente em alguns instantes.',
  UPDATE_FAILED: 'Não foi possível atualizar o programa. Tente novamente.',
  DELETE_FAILED: 'Não foi possível remover o programa. Verifique se ele não possui inscrições.',
  FETCH_FAILED: 'Não foi possível carregar os programas. Tente novamente em alguns instantes.',
  INVALID_DATA: 'Alguns dados do programa estão incorretos. Verifique os campos e tente novamente.',
} as const

// ===== Inscrições =====
export const INSCRICAO_ERRORS = {
  CREATE_FAILED: 'Não foi possível processar sua inscrição. Tente novamente em alguns instantes.',
  FETCH_FAILED: 'Não foi possível carregar as inscrições. Tente novamente.',
  UPDATE_FAILED: 'Não foi possível atualizar as inscrições. Tente novamente.',
  NO_SELECTION: 'Selecione pelo menos uma inscrição para esta ação.',
  INVALID_STATUS: 'O status informado não é válido.',
} as const

// ===== Sistema =====
export const SYSTEM_ERRORS = {
  GENERIC: 'Algo deu errado. Tente novamente em alguns instantes.',
  NETWORK: 'Verifique sua conexão com a internet e tente novamente.',
  SERVER: 'Estamos com problemas temporários. Tente novamente em alguns instantes.',
  NOT_FOUND: 'O que você procura não foi encontrado. Verifique o endereço.',
  PERMISSION_DENIED: 'Você não tem permissão para acessar esta funcionalidade.',
  CONTENT_TYPE: 'Formato de dados inválido. Tente novamente.',
} as const

// ===== Sucesso =====
export const SUCCESS_MESSAGES = {
  LOGIN: 'Bem-vindo(a) de volta!',
  REGISTER: 'Conta criada com sucesso! Faça login para continuar.',
  INSCRICAO: 'Inscrição realizada com sucesso! Você receberá uma confirmação por email.',
  INSCRICAO_UPDATE: (count: number, action: string) =>
    `${count} inscrição(ões) ${action} com sucesso!`,
  CSV_EXPORT: 'Planilha exportada com sucesso!',
  PROGRAMA_CREATED: 'Programa criado com sucesso!',
  PROGRAMA_UPDATED: 'Programa atualizado com sucesso!',
  PROGRAMA_DELETED: 'Programa removido com sucesso!',
} as const