import { vi } from 'vitest'
import type { JWT } from 'next-auth/jwt'

/**
 * Tipos para sessão de teste
 */
export interface TestSessionUser {
  id: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  name?: string
}

/**
 * Cria um mock de getToken do next-auth/jwt
 * Use com vi.mock('next-auth/jwt') no topo do arquivo de teste
 */
export function createMockGetToken(user: TestSessionUser | null) {
  return vi.fn().mockResolvedValue(user ? {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  } : null)
}

/**
 * Mock do getServerSession (para Server Components/Actions)
 * Deve ser chamado no topo do arquivo de teste via vi.mock
 */
export function createMockGetServerSession(user: TestSessionUser | null) {
  return vi.fn().mockResolvedValue(user ? {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  } : null)
}

/**
 * Cria headers de autenticação para testes com fetch direto
 * Útil quando testando rota via NextRequest real
 */
export function createAuthHeaders(user: TestSessionUser): HeadersInit {
  // Simula o cookie de sessão do NextAuth
  // Em testes reais, você faria login via POST /api/auth/callback/credentials
  // e extrairia o cookie. Aqui simplificamos.
  return {
    'Content-Type': 'application/json',
    // 'Cookie': `next-auth.session-token=${mockSessionToken}`, // Se necessário
  }
}

/**
 * Usuários pré-definidos para testes comuns
 */
export const testUsers = {
  admin: { id: 'clx7f6v7k0000abc123def45', email: 'admin@test.com', role: 'ADMIN' as const, name: 'Admin Test' },
  editor: { id: 'clx7f6v7k0000abc123def46', email: 'editor@test.com', role: 'EDITOR' as const, name: 'Editor Test' },
  viewer: { id: 'clx7f6v7k0000abc123def47', email: 'viewer@test.com', role: 'VIEWER' as const, name: 'Viewer Test' },
  unauthenticated: null,
} as const

/**
 * Helper para testar diferentes roles em uma suíte
 */
export function testEachRole(
  testFn: (user: TestSessionUser, roleName: string) => void
) {
  describe.each([
    ['ADMIN', testUsers.admin],
    ['EDITOR', testUsers.editor],
    ['VIEWER', testUsers.viewer],
  ])('%s', (roleName, user) => {
    testFn(user, roleName)
  })
}

/**
 * Helper para testar apenas admins e editors (permissões de escrita)
 */
export function testWriteRoles(
  testFn: (user: TestSessionUser, roleName: string) => void
) {
  describe.each([
    ['ADMIN', testUsers.admin],
    ['EDITOR', testUsers.editor],
  ])('%s', (roleName, user) => {
    testFn(user, roleName)
  })
}