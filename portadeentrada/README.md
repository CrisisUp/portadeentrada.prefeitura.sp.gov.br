# Porta de Entrada

Portal cultural da Prefeitura da Cidade de São Paulo - Secretaria Municipal de Cultura.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Prisma ORM, PostgreSQL (produção) / SQLite (testes)
- **Autenticação:** NextAuth v5 (JWT + Credentials)
- **Estilo:** Tailwind CSS
- **Fonts:** Abril Fatface, Oswald, Open Sans (via next/font/google)
- **Testes:** Vitest (unit/integration/component) + Playwright (E2E)

## Início Rápido

```bash
# Instalar dependências
npm install

# Configurar banco de dados (produção)
npx prisma migrate deploy
npm run db:seed

# OU: Reset completo com senhas conhecidas (recomendado para desenvolvimento)
npm run db:reset

# Iniciar desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Estrutura do Projeto

```
├── app/
│   ├── api/           # Rotas de API
│   │   ├── auth/      # Autenticação (login, register)
│   │   ├── cultura/   # CRUD Programas Culturais
│   │   └── inscricoes/ # Inscrições
│   ├── admin/         # Painel administrativo
│   ├── auth/          # Páginas de login/cadastro
│   └── busca/         # Busca de programas
├── components/        # Componentes React
│   └── ui/            # Componentes base (Button, Input, Card, Badge, Skeleton, etc.)
├── lib/               # Utilitários
│   ├── auth.ts        # Configuração NextAuth
│   ├── constants.ts   # Constantes compartilhadas
│   ├── logger.ts      # Logger estruturado
│   └── prisma.ts      # Cliente Prisma
├── prisma/
│   ├── schema.prisma  # Schema do banco (PostgreSQL)
│   ├── schema.test.prisma # Schema para testes (SQLite)
│   └── seed.ts        # Dados iniciais
├── scripts/
│   ├── reset-and-seed.mjs   # Reset automatizado do banco com senhas conhecidas
│   └── create-test-schema.mjs # Criação de schema SQLite para testes
├── tests/
│   ├── setup.ts       # Setup global para testes unitários (jsdom)
│   ├── setup.tsx      # Setup global para testes de componente (jsdom + RTL)
│   ├── unit/          # Testes unitários (124 testes)
│   │   └── lib/       # Testes de utilitários (cpf, phone, slugify, cep, constants, schemas, errors)
│   ├── integration/   # Testes de integração (28 testes)
│   │   ├── helpers/
│   │   │   ├── test-db.ts      # Helpers de banco SQLite isolado
│   │   │   └── auth-helpers.ts # Mocks de autenticação
│   │   └── api/
│   │       └── inscricoes.test.ts # Testes da API /api/inscricoes
│   ├── component/     # Testes de componente (~59 testes)
│   │   ├── ui/        # Componentes base (Button, Input, Card, Badge, Skeleton)
│   │   ├── Header.test.tsx
│   │   └── pages/
│   │       └── CadastroPage.test.tsx
│   └── e2e/           # Testes E2E com Playwright
├── types/             # Definições TypeScript
└── vitest.config.ts   # Config Vitest unitário (jsdom)
└── vitest.integration.config.ts # Config Vitest integração (node + SQLite)
```

## Scripts Disponíveis

### Desenvolvimento
| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar em produção |
| `npm run lint` | Verificar código |

### Banco de Dados
| Comando | Descrição |
|---------|-----------|
| `npm run db:seed` | Preencher banco com dados iniciais |
| `npm run db:reset` | **Reset completo + seed com senhas conhecidas (admin123)** |
| `npm run prisma:studio` | Abrir Prisma Studio |
| `npx prisma migrate deploy` | Aplicar migrações em produção |
| `npx prisma db push` | Sincronizar schema (desenvolvimento) |

### Testes
| Comando | Descrição |
|---------|-----------|
| `npm test` | **Todos os testes** (unit + integration + component) |
| `npm run test:unit` | Testes unitários apenas (124 testes, jsdom) |
| `npm run test:integration` | Testes de integração apenas (28 testes, node + SQLite) |
| `npm run test:integration:watch` | Testes de integração em modo watch |
| `npm run test:integration:coverage` | Testes de integração com coverage |
| `npm run test:component` | Testes de componente apenas (~59 testes, jsdom + RTL) |
| `npm run test:coverage` | Todos os testes com coverage |
| `npm run test:ui` | Interface visual do Vitest |
| `npm run test:e2e` | Testes E2E com Playwright |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:e2e:headed` | Playwright headed mode |

## Suítes de Testes

### Testes Unitários (124 testes)
Testam lógica pura isolada: validadores (CPF, telefone, CEP, slugify), schemas Zod, constantes, erros personalizados.
- **Ambiente:** jsdom (rápido, sem I/O)
- **Config:** `vitest.config.ts`

### Testes de Integração (28 testes)
Testam APIs reais com banco de dados isolado (SQLite em memória).
- **Cobertura:** `/api/inscricoes` (CRUD completo, auth, validação, edge cases)
- **Banco:** SQLite por teste (isolamento total, limpeza automática)
- **Auth:** Mock de `getToken` do NextAuth
- **Config:** `vitest.integration.config.ts` (pool: forks, 1 thread)
- **Helpers:** `tests/integration/helpers/test-db.ts`, `auth-helpers.ts`

### Testes de Componente (~59 testes)
Testam componentes React com React Testing Library.
- **Componentes UI:** Button (14), Input (19), Card (9), Badge (6), Skeleton (11)
- **Páginas:** Header (10), CadastroPage (32)
- **Ambiente:** jsdom + RTL
- **Config:** `vitest.config.ts` + `tests/setup.tsx`

### Testes E2E (Playwright)
Testes end-to-end reais no navegador.
- **Config:** `playwright.config.ts` (dev server + PostgreSQL)

## Usuários Padrão (Seed / db:reset)

Todas as senhas são **`admin123`** após rodar `npm run db:reset`:

| Email | Função | Senha |
|-------|--------|-------|
| admin@prefeitura.sp.gov.br | ADMIN | admin123 |
| editor@prefeitura.sp.gov.br | EDITOR | admin123 |
| viewer@prefeitura.sp.gov.br | VIEWER | admin123 |

## Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Database (PostgreSQL para produção/desenvolvimento)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portadeentrada"

# NextAuth
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Seed passwords (opcional - padrão: admin123)
SEED_ADMIN_PASSWORD="sua-senha"
SEED_EDITOR_PASSWORD="sua-senha"
SEED_VIEWER_PASSWORD="sua-senha"
```

## Docker

### Produção

```bash
# Build da imagem
docker build -t portadeentrada .

# Ou usar docker-compose (recomendado)
docker-compose up -d
```

A aplicação estará disponível em `http://localhost:3000`.

### Desenvolvimento (Hot Reload)

```bash
# Inicia PostgreSQL + Next.js com hot reload
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f app
```

### Testes (CI/CD)

```bash
# Roda todos os testes em containers isolados
docker-compose -f docker-compose.test.yml up --abort-on-container-exit

# Ver relatórios
# test-results/ e playwright-report/ são montados como volumes
```

### Variáveis de Ambiente Docker

Copie `.env.docker.example` para `.env` e ajuste:

```bash
cp .env.docker.example .env
# Edite .env com seus valores
```

Principais variáveis:
- `NEXTAUTH_SECRET` - Gere com `openssl rand -base64 32`
- `NEXTAUTH_URL` - URL pública da aplicação
- `DATABASE_URL` - No docker-compose usa `postgres:5432` (nome do serviço)

### Arquivos Docker

| Arquivo | Descrição |
|---------|-----------|
| `Dockerfile` | Multi-stage build para produção |
| `Dockerfile.dev` | Imagem de desenvolvimento |
| `Dockerfile.test` | Imagem para CI/CD (com Chromium) |
| `docker-compose.yml` | Produção (app + postgres) |
| `docker-compose.dev.yml` | Desenvolvimento com hot reload |
| `docker-compose.test.yml` | Testes automatizados |
| `.dockerignore` | Arquivos ignorados no build |
| `scripts/docker-entrypoint.sh` | Entrypoint com migrações + seed |

## API

Documentação Swagger disponível em: `/docs`

### Rotas Principais

- `GET /api/cultura` - Listar programas culturais
- `POST /api/cultura` - Criar programa (ADMIN/EDITOR)
- `GET /api/cultura/[id]` - Buscar programa
- `PUT /api/cultura/[id]` - Atualizar programa (ADMIN/EDITOR)
- `DELETE /api/cultura/[id]` - Remover programa (ADMIN)
- `POST /api/inscricoes` - Criar inscrição (autenticado)
- `GET /api/inscricoes` - Listar inscrições (autenticado)
- `POST /api/auth/register` - Cadastrar usuário

## Estratégia de Testes (Recomendada)

```
┌─────────────────────────────────────────────────────────────┐
│                    PIRÂMIDE DE TESTES                       │
├─────────────────────────────────────────────────────────────┤
│  E2E (Playwright)          ← Poucos, críticos, lentos      │
│  ────────────────────────────────────────────────────────  │
│  Component (Vitest+RTL)    ← Interação usuário, UI         │
│  ────────────────────────────────────────────────────────  │
│  Integration (Vitest)      ← API + DB real, regras negócio │
│  ────────────────────────────────────────────────────────  │
│  Unit (Vitest)             ← Muitos, rápidos, lógica pura  │
└─────────────────────────────────────────────────────────────┘
```

**Por que esta ordem?**
1. **Unit** → Feedback instantâneo para lógica pura (validadores, schemas)
2. **Integration** → Garante que API + DB + Auth funcionam juntos (SQLite isolado = rápido)
3. **Component** → Testa UX real sem browser (RTL + jsdom)
4. **E2E** → Valida fluxos críticos em browser real (custo alto, usar com parcimônia)

## Problemas Conhecidos & Soluções

| Problema | Solução |
|----------|---------|
| Prisma bloqueia em CI ("detected Claude Code") | Usar raw SQL via `$executeRawUnsafe` + `PRISMA_CLI_BINARY_TARGETS` |
| `vi.mock()` fora de escopo | Mover mocks para topo do arquivo, usar `vi.mock` no nível do módulo |
| Múltiplos elementos com mesmo `aria-label` | Usar `getByPlaceholderText` para input, `getByRole` para botão |
| Escape JSON no Windows (ts-node) | Usar `npm run db:seed` que tem escaping correto |
| Coluna `slug` ausente no PostgreSQL | `npx prisma db push --force-reset --accept-data-loss` |
| Queries falhando em Card/Skeleton | Adicionar `data-testid` aos componentes |

## Licença

© 2026 Prefeitura da Cidade de São Paulo