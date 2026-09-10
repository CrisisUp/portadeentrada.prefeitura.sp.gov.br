import { describe, it, expect } from 'vitest'
import {
  AUTH_ERRORS,
  VALIDATION_ERRORS,
  PROGRAMA_ERRORS,
  INSCRICAO_ERRORS,
  SYSTEM_ERRORS,
  SUCCESS_MESSAGES,
} from '@/lib/errors'

describe('lib/errors', () => {
  describe('AUTH_ERRORS', () => {
    it('define todas as mensagens de autenticação', () => {
      expect(AUTH_ERRORS.UNAUTHORIZED).toBe('Você precisa estar logado para acessar esta funcionalidade.')
      expect(AUTH_ERRORS.SESSION_EXPIRED).toBe('Sua sessão expirou. Faça login novamente para continuar.')
      expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBe('Email ou senha incorretos. Verifique seus dados e tente novamente.')
      expect(AUTH_ERRORS.ACCOUNT_EXISTS).toBe('Este email já está cadastrado. Tente fazer login ou use outro email.')
      expect(AUTH_ERRORS.WEAK_PASSWORD).toBe('A senha precisa ter pelo menos 6 caracteres para sua segurança.')
      expect(AUTH_ERRORS.INVALID_EMAIL).toBe('O formato do email parece incorreto. Verifique e tente novamente.')
      expect(AUTH_ERRORS.REQUIRED_FIELDS).toBe('Preencha todos os campos obrigatórios para continuar.')
      expect(AUTH_ERRORS.RATE_LIMIT).toBe('Muitas tentativas. Aguarde alguns minutos e tente novamente.')
    })

    it('é readonly (as const)', () => {
      expect(typeof AUTH_ERRORS).toBe('object')
      expect(Object.keys(AUTH_ERRORS).length).toBe(8)
    })
  })

  describe('VALIDATION_ERRORS', () => {
    it('define mensagens de validação estáticas', () => {
      expect(VALIDATION_ERRORS.INVALID_CPF).toBe('O CPF informado não é válido. Verifique os números e tente novamente.')
      expect(VALIDATION_ERRORS.INVALID_PHONE).toBe('O telefone parece estar incorreto. Use o formato (11) 99999-9999.')
      expect(VALIDATION_ERRORS.INVALID_DATE).toBe('A data informada não parece ser válida. Verifique e tente novamente.')
      expect(VALIDATION_ERRORS.INVALID_URL).toBe('O link informado não parece ser válido. Verifique e tente novamente.')
    })

    it('FIELD_REQUIRED é função que interpola campo', () => {
      expect(VALIDATION_ERRORS.FIELD_REQUIRED('nome')).toBe('O campo nome é obrigatório.')
      expect(VALIDATION_ERRORS.FIELD_REQUIRED('email')).toBe('O campo email é obrigatório.')
    })

    it('MAX_LENGTH é função que interpola campo e tamanho', () => {
      expect(VALIDATION_ERRORS.MAX_LENGTH('nome', 100)).toBe('O campo nome deve ter no máximo 100 caracteres.')
      expect(VALIDATION_ERRORS.MAX_LENGTH('descricao', 500)).toBe('O campo descricao deve ter no máximo 500 caracteres.')
    })
  })

  describe('PROGRAMA_ERRORS', () => {
    it('define todas as mensagens de programa', () => {
      expect(PROGRAMA_ERRORS.NOT_FOUND).toBe('Programa não encontrado. Ele pode ter sido removido ou o link está incorreto.')
      expect(PROGRAMA_ERRORS.NOT_ACCEPTING).toBe('Este programa não está aceitando inscrições no momento.')
      expect(PROGRAMA_ERRORS.ALREADY_ENROLLED).toBe('Você já está inscrito neste programa. Confira suas inscrições.')
      expect(PROGRAMA_ERRORS.CREATE_FAILED).toBe('Não foi possível criar o programa. Tente novamente em alguns instantes.')
      expect(PROGRAMA_ERRORS.UPDATE_FAILED).toBe('Não foi possível atualizar o programa. Tente novamente.')
      expect(PROGRAMA_ERRORS.DELETE_FAILED).toBe('Não foi possível remover o programa. Verifique se ele não possui inscrições.')
      expect(PROGRAMA_ERRORS.FETCH_FAILED).toBe('Não foi possível carregar os programas. Tente novamente em alguns instantes.')
      expect(PROGRAMA_ERRORS.INVALID_DATA).toBe('Alguns dados do programa estão incorretos. Verifique os campos e tente novamente.')
    })
  })

  describe('INSCRICAO_ERRORS', () => {
    it('define todas as mensagens de inscrição', () => {
      expect(INSCRICAO_ERRORS.CREATE_FAILED).toBe('Não foi possível processar sua inscrição. Tente novamente em alguns instantes.')
      expect(INSCRICAO_ERRORS.FETCH_FAILED).toBe('Não foi possível carregar as inscrições. Tente novamente.')
      expect(INSCRICAO_ERRORS.UPDATE_FAILED).toBe('Não foi possível atualizar as inscrições. Tente novamente.')
      expect(INSCRICAO_ERRORS.NO_SELECTION).toBe('Selecione pelo menos uma inscrição para esta ação.')
      expect(INSCRICAO_ERRORS.INVALID_STATUS).toBe('O status informado não é válido.')
    })
  })

  describe('SYSTEM_ERRORS', () => {
    it('define todas as mensagens de sistema', () => {
      expect(SYSTEM_ERRORS.GENERIC).toBe('Algo deu errado. Tente novamente em alguns instantes.')
      expect(SYSTEM_ERRORS.NETWORK).toBe('Verifique sua conexão com a internet e tente novamente.')
      expect(SYSTEM_ERRORS.SERVER).toBe('Estamos com problemas temporários. Tente novamente em alguns instantes.')
      expect(SYSTEM_ERRORS.NOT_FOUND).toBe('O que você procura não foi encontrado. Verifique o endereço.')
      expect(SYSTEM_ERRORS.PERMISSION_DENIED).toBe('Você não tem permissão para acessar esta funcionalidade.')
      expect(SYSTEM_ERRORS.CONTENT_TYPE).toBe('Formato de dados inválido. Tente novamente.')
    })
  })

  describe('SUCCESS_MESSAGES', () => {
    it('define mensagens de sucesso estáticas', () => {
      expect(SUCCESS_MESSAGES.LOGIN).toBe('Bem-vindo(a) de volta!')
      expect(SUCCESS_MESSAGES.REGISTER).toBe('Conta criada com sucesso! Faça login para continuar.')
      expect(SUCCESS_MESSAGES.INSCRICAO).toBe('Inscrição realizada com sucesso! Você receberá uma confirmação por email.')
      expect(SUCCESS_MESSAGES.CSV_EXPORT).toBe('Planilha exportada com sucesso!')
      expect(SUCCESS_MESSAGES.PROGRAMA_CREATED).toBe('Programa criado com sucesso!')
      expect(SUCCESS_MESSAGES.PROGRAMA_UPDATED).toBe('Programa atualizado com sucesso!')
      expect(SUCCESS_MESSAGES.PROGRAMA_DELETED).toBe('Programa removido com sucesso!')
    })

    it('INSCRICAO_UPDATE é função que interpola quantidade e ação', () => {
      // The function interpolates count and action directly
      expect(SUCCESS_MESSAGES.INSCRICAO_UPDATE(1, 'aprovada')).toBe('1 inscrição(ões) aprovada com sucesso!')
      expect(SUCCESS_MESSAGES.INSCRICAO_UPDATE(5, 'rejeitada')).toBe('5 inscrição(ões) rejeitada com sucesso!')
      expect(SUCCESS_MESSAGES.INSCRICAO_UPDATE(0, 'aprovada')).toBe('0 inscrição(ões) aprovada com sucesso!')
    })
  })
})