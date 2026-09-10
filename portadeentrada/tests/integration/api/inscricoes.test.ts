import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { prisma, setupTestDb, teardownTestDb, cleanTestDb, createTestUser, createTestPrograma, createTestInscricao } from '../helpers/test-db'
import { createMockGetToken, testUsers, testEachRole } from '../helpers/auth-helpers'
import { POST, GET } from '@/app/api/inscricoes/route'
import { StatusInscricao, StatusPrograma } from '@prisma/client'

// Mock do next-auth/jwt NO TOPO DO ARQUIVO (fora dos testes)
vi.mock('next-auth/jwt', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getToken: vi.fn(),
  }
})

import { getToken } from 'next-auth/jwt'

const mockGetToken = getToken as ReturnType<typeof vi.fn>

describe('API /api/inscricoes - Integração', () => {
  let adminUser: Awaited<ReturnType<typeof createTestUser>>
  let programaAberto: Awaited<ReturnType<typeof createTestPrograma>>
  let programaFechado: Awaited<ReturnType<typeof createTestPrograma>>

  beforeAll(async () => {
    await setupTestDb()
    adminUser = await createTestUser('ADMIN', { email: 'admin@test.com' })
    programaAberto = await createTestPrograma('aberto', { titulo: 'Programa Aberto Integração' })
    programaFechado = await createTestPrograma('encerrado', { titulo: 'Programa Fechado Integração' })
  })

  afterAll(async () => {
    await teardownTestDb()
  })

  beforeEach(async () => {
    await cleanTestDb()
    // Re-seed usuários e programas após limpeza
    adminUser = await createTestUser('ADMIN', { email: 'admin@test.com' })
    programaAberto = await createTestPrograma('aberto', { titulo: 'Programa Aberto Integração' })
    programaFechado = await createTestPrograma('encerrado', { titulo: 'Programa Fechado Integração' })

    // Reset mock para admin padrão
    mockGetToken.mockResolvedValue({
      sub: testUsers.admin.id,
      email: testUsers.admin.email,
      role: testUsers.admin.role,
      name: testUsers.admin.name,
    })
  })

  // Helper para criar request com mock de auth
  function createPostRequest(body: Record<string, unknown>, user = testUsers.admin) {
    if (user) {
      mockGetToken.mockResolvedValue({
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      })
    } else {
      mockGetToken.mockResolvedValue(null)
    }
    return new NextRequest('http://localhost:3000/api/inscricoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  function createGetRequest(user = testUsers.admin) {
    if (user) {
      mockGetToken.mockResolvedValue({
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      })
    } else {
      mockGetToken.mockResolvedValue(null)
    }
    return new NextRequest('http://localhost:3000/api/inscricoes', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ========================================
  // POST /api/inscricoes
  // ========================================

  describe('POST - Criar inscrição', () => {
    const validInscricao = {
      programaId: '', // preenchido nos testes
      nomeCompleto: 'João Silva Integração',
      email: 'joao.integracao@test.com',
      telefone: '11999999999',
      cpf: '11144477735',
      rg: '12.345.678-9',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310100',
      portfolioUrl: 'https://portfolio.com',
      cartaIntencao: 'Minha carta de intenção para teste de integração.',
    }

    it('cria inscrição válida com todos os campos', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toContain('Inscrição realizada com sucesso')
      expect(data.inscricao).toMatchObject({
        programa: programaAberto.titulo,
        status: StatusInscricao.pendente,
      })
      expect(data.inscricao.id).toBeDefined()
      expect(data.inscricao.createdAt).toBeDefined()

      // Verifica no banco
      const saved = await prisma.inscricao.findUnique({ where: { id: data.inscricao.id } })
      expect(saved).not.toBeNull()
      expect(saved?.cpf).toBe('11144477735')
      expect(saved?.email).toBe('joao.integracao@test.com')
      expect(saved?.telefone).toBe('11999999999')
      expect(saved?.cep).toBe('01310100')
    })

    it('cria inscrição com campos mínimos (apenas obrigatórios)', async () => {
      const minimal = {
        programaId: programaAberto.id,
        nomeCompleto: 'Maria Mínima',
        email: 'maria.minima@test.com',
        cpf: '52998224725', // CPF válido diferente
      }
      const request = createPostRequest(minimal)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.inscricao.status).toBe(StatusInscricao.pendente)
    })

    it('rejeita sem autenticação (401)', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id }, null)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('logado')
    })

    it('rejeita campos obrigatórios faltando (400)', async () => {
      const request = createPostRequest({ programaId: programaAberto.id }) // sem nome, email, cpf
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('obrigatório')
    })

    it('rejeita email inválido (400)', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, email: 'invalido' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('email')
    })

    it('rejeita CPF inválido (400)', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, cpf: '12345678901' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('CPF')
    })

    it('rejeita CPF com todos dígitos iguais (400)', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, cpf: '11111111111' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('CPF')
    })

    it('rejeita telefone inválido (400)', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, telefone: '123' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('telefone')
    })

    it('aceita telefone vazio/opcional', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, telefone: '' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      const saved = await prisma.inscricao.findUnique({ where: { id: data.inscricao.id } })
      expect(saved?.telefone).toBeNull()
    })

    it('rejeita programa inexistente (404)', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: 'clx7f6v7k0000abc123def99' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toContain('Programa não encontrado')
    })

    it('rejeita programa não aberto (400)', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaFechado.id })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('não está aceitando')
    })

    it('rejeita CPF duplicado no mesmo programa (409)', async () => {
      // Primeira inscrição
      const request1 = createPostRequest({ ...validInscricao, programaId: programaAberto.id })
      await POST(request1)

      // Segunda com mesmo CPF
      const request2 = createPostRequest({ ...validInscricao, programaId: programaAberto.id, email: 'outro@test.com' })
      const response = await POST(request2)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('já está inscrito')
    })

    it('permite mesmo CPF em programas diferentes', async () => {
      const request1 = createPostRequest({ ...validInscricao, programaId: programaAberto.id })
      await POST(request1)

      const programaAberto2 = await createTestPrograma('aberto', { titulo: 'Outro Programa Aberto' })
      const request3 = createPostRequest({ ...validInscricao, programaId: programaAberto2.id, email: 'outro@test.com' })
      const response = await POST(request3)

      expect(response.status).toBe(201)
    })

    it('normaliza email para lowercase', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, email: 'JOAO@TEST.COM' })
      const response = await POST(request)
      const data = await response.json()

      const saved = await prisma.inscricao.findUnique({ where: { id: data.inscricao.id } })
      expect(saved?.email).toBe('joao@test.com')
    })

    it('normaliza CPF removendo formatação', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, cpf: '111.444.777-35' })
      const response = await POST(request)
      const data = await response.json()

      const saved = await prisma.inscricao.findUnique({ where: { id: data.inscricao.id } })
      expect(saved?.cpf).toBe('11144477735')
    })

    it('normaliza CEP removendo formatação', async () => {
      const request = createPostRequest({ ...validInscricao, programaId: programaAberto.id, cep: '01310-100' })
      const response = await POST(request)
      const data = await response.json()

      const saved = await prisma.inscricao.findUnique({ where: { id: data.inscricao.id } })
      expect(saved?.cep).toBe('01310100')
    })

    it('rejeita Content-Type inválido (415)', async () => {
      const request = new NextRequest('http://localhost:3000/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'invalid',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(415)
      expect(data.error).toContain('JSON')
    })
  })

  // ========================================
  // GET /api/inscricoes
  // ========================================

  describe('GET - Listar inscrições', () => {
    beforeEach(async () => {
      // Cria algumas inscrições para testar listagem
      await createTestInscricao(programaAberto.id, {
        email: 'user1@test.com',
        cpf: '11144477735',
        nomeCompleto: 'Usuário Um',
        status: 'pendente',
      })
      await createTestInscricao(programaAberto.id, {
        email: 'user2@test.com',
        cpf: '22255588846',
        nomeCompleto: 'Usuário Dois',
        status: 'aprovada',
      })
      await createTestInscricao(programaFechado.id, {
        email: 'user3@test.com',
        cpf: '33366699957',
        nomeCompleto: 'Usuário Três',
        status: 'rejeitada',
      })
    })

    it('retorna todas inscrições para ADMIN', async () => {
      const request = createGetRequest(testUsers.admin)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(3)
      // Ordem: mais recente primeiro
      expect(data[0].nomeCompleto).toBe('Usuário Três')
    })

    it('retorna todas inscrições para EDITOR', async () => {
      const request = createGetRequest(testUsers.editor)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.length).toBe(3)
    })

    it('retorna apenas próprias inscrições para VIEWER', async () => {
      const viewerUser = await createTestUser('VIEWER', { email: 'viewer@test.com' })
      // Cria inscrição para este viewer
      await createTestInscricao(programaAberto.id, {
        email: 'viewer@test.com',
        cpf: '44477711168',
        nomeCompleto: 'Viewer Próprio',
      })

      const request = createGetRequest({ id: viewerUser.id, email: viewerUser.email, role: 'VIEWER', name: viewerUser.name })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.length).toBe(1)
      expect(data[0].email).toBe('viewer@test.com')
    })

    it('retorna 401 sem autenticação', async () => {
      const request = createGetRequest(null)
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('logado')
    })

    it('inclui dados do programa na resposta', async () => {
      const request = createGetRequest(testUsers.admin)
      const response = await GET(request)
      const data = await response.json()

      expect(data[0].programa).toBeDefined()
      expect(data[0].programa.titulo).toBeDefined()
      expect(data[0].programa.categoria).toBeDefined()
    })
  })

  // ========================================
  // Testes de Permissão por Role
  // ========================================

  describe('Permissões por Role', () => {
    // Gera CPF válido único
    function generateUniqueCpf() {
      const base = '11144477735' // CPF válido base
      const suffix = Math.floor(Math.random() * 10)
      return base.slice(0, -1) + suffix
    }

    testEachRole((user, roleName) => {
      it(`${roleName} pode criar inscrição`, async () => {
        const inscricao = {
          programaId: programaAberto.id,
          nomeCompleto: `Teste ${roleName}`,
          email: `${roleName.toLowerCase()}-${Date.now()}-${Math.random()}@test.com`,
          cpf: '52998224725', // CPF válido conhecido
        }

        const request = createPostRequest(inscricao, user)
        const response = await POST(request)

        // Debug: log error if fails
        if (response.status !== 201) {
          const data = await response.json()
          console.log(`Role ${roleName} error:`, data.error)
        }

        // Todos roles autenticados podem criar inscrição
        expect(response.status).toBe(201)
      })
    })

    testEachRole((user, roleName) => {
      it(`${roleName} pode listar inscrições`, async () => {
        const request = createGetRequest(user)
        const response = await GET(request)

        expect(response.status).toBe(200)
      })
    })
  })
})