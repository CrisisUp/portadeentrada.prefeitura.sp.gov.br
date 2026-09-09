# Arquitetura — Porta de Entrada

## Visão Geral

Porta de Entrada é um portal cultural da Prefeitura de São Paulo que permite aos cidadãos descobrir e se inscrever em programas culturais municipais.

## Stack Tecnológica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | NextAuth v5 (JWT strategy) |
| Cache/Rate Limit | Upstash Redis |
| UI | Tailwind CSS + componentes customizados |
| Testes | Vitest (unit) + Playwright (E2E) |
| Deploy | Vercel |

## Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │   Home    │  │  Busca    │  │ Cadastro  │       │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │
│        │              │              │              │
│        └──────────────┼──────────────┘              │
│                       │                             │
│              ┌────────▼────────┐                    │
│              │  Next.js Router │                    │
│              └────────┬────────┘                    │
└───────────────────────┼─────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│                SERVER                              │
│                       │                             │
│  ┌────────────────────▼────────────────────┐       │
│  │          API Routes (app/api/)          │       │
│  │  /auth/*  /cultura  /inscricoes  /admin │       │
│  └────────────────────┬────────────────────┘       │
│                       │                             │
│  ┌────────────────────▼────────────────────┐       │
│  │          Middleware (middleware.ts)       │       │
│  │  • Rate limiting (Upstash Redis)         │       │
│  │  • Auth protection (/admin, /cadastro)   │       │
│  └────────────────────┬────────────────────┘       │
│                       │                             │
│  ┌────────────────────▼────────────────────┐       │
│  │        Prisma Client + Extensions        │       │
│  │  • Soft delete extension                 │       │
│  │  • Singleton pattern                     │       │
│  └────────────────────┬────────────────────┘       │
│                       │                             │
└───────────────────────┼─────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────┐
│                DATABASE                            │
│                       │                             │
│  ┌────────────────────▼────────────────────┐       │
│  │            PostgreSQL                   │       │
│  │  • User                                  │       │
│  │  • ProgramaCultural                      │       │
│  │  • Inscricao                             │       │
│  │  • PasswordResetToken                    │       │
│  └────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

## Trust Boundaries

### 1. Cliente ↔ Server
- **Comunicação:** HTTPS (HSTS habilitado)
- **Headers de segurança:** CSP, X-Frame-Options, X-Content-Type-Options
- **Rate limiting:** Upstash Redis no middleware

### 2. Server ↔ Database
- **Conexão:** Connection string em variável de ambiente
- **Prisma Client:** Extensões de soft delete interceptam queries
- **Queries parameterizadas:** Proteção contra SQL injection

### 3. Autenticação
- **JWT tokens:** Strategy `jwt` (não sessions no banco)
- **Token rotation:** Access token (30 min) + Refresh token (7 dias)
- **Roles:** ADMIN, EDITOR, VIEWER com permissões por rota

### 4. API Routes
- **Input validation:** Zod schemas
- **Error handling:** `withErrorHandling` wrapper
- **Audit logging:** Eventos tipados com severidade

## Fluxo de Dados

### Inscrição em Programa

```
1. Usuário acessa /cadastro
2. Middleware verifica autenticação (redirect → /auth/login)
3. Page busca programas abertos via /api/cultura
4. Usuário preenche formulário (CPF, dados pessoais)
5. Frontend valida CPF via lib/cpf.ts
6. POST /api/inscricoes com dados
7. API valida com Zod schema
8. Prisma cria inscrição (status: pendente)
9. Admin aprova/rejeita via /admin/inscricoes
```

### Autenticação

```
1. Usuário faz login em /auth/login
2. NextAuth valida credenciais (bcrypt)
3. JWT token gerado com role + userId
4. Middleware verifica token em rotas protegidas
5. Token expira em 30 min → refresh automático
6. Refresh token expira em 7 dias → re-login
```

## Padrões de Design

### Soft Delete
- Campo `deletedAt` em modelos sensíveis
- Prisma Client Extension intercepta queries automáticas
- `delete()` converte para `update({ deletedAt: now() })`

### Error Handling
- `ApiError` class com factory methods
- `withErrorHandling()` wrapper para API routes
- `handleApiError()` trata erros conhecidos (Zod, Prisma, custom)

### Componentização
- `components/ui/` — Componentes base (Button, Input, Card, Skeleton)
- `components/` — Componentes de negócio (Header, Footer, NavigationCard)
- `forwardRef` para componentes de input

### Validação
- **Client:** `lib/cpf.ts`, `lib/cep.ts` para feedback imediato
- **Server:** Zod schemas em `lib/schemas.ts`
- **Transform:** `.transform()` para serialização Date→ISO

## Segurança

| Camada | Medida |
| --- | --- |
| Transporte | HSTS, HTTPS obrigatório |
| Headers | CSP, X-Frame-Options, X-XSS-Protection |
| Auth | JWT com rotation, bcrypt (12 rounds) |
| Rate Limit | Upstash Redis (fixed window) |
| Input | Zod validation, parameterized queries |
| Audit | Eventos tipados com severidade |
| Supply Chain | Trivy, CodeQL, Dependabot |

## Performance

| Otimização | Implementação |
| --- | --- |
| Cache estático | `Cache-Control: immutable` para `/_next/static` |
| Cache API | `stale-while-revalidate` para rotas GET |
| Bundle | `@next/bundle-analyzer` + `optimizePackageImports` |
| Imagens | Next.js Image com `sizes` responsive |
| Fontes | `next/font` com `display: swap` |
| Database | Índices compostos para queries frequentes |

## Monitoramento

- **Logs:** `lib/logger.ts` (console em dev, extensível para Sentry/DataDog)
- **Audit:** Eventos de segurança com severidade
- **Bundle:** `npm run analyze` para relatório visual
- **Cron:** Limpeza de tokens expirados (diário às 03:00 UTC)
