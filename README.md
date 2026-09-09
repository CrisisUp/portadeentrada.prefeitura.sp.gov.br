# Porta de Entrada — Prefeitura de São Paulo

> Portal cultural da Secretaria Municipal de Cultura — Next.js 15 + TypeScript + Prisma + NextAuth v5

---

## 📋 Visão Geral

| Atributo | Valor |
| ---------- | ------- |
| **Framework** | Next.js 15.5 (App Router, Turbopack) |
| **Linguagem** | TypeScript 5.7 (strict mode) |
| **Banco** | PostgreSQL + Prisma ORM 6.x |
| **Auth** | NextAuth v5 (beta) — Credentials + JWT |
| **Estilo** | Tailwind CSS 3.4 + Fontes Google (Abril Fatface, Oswald, Open Sans) |
| **Notificações** | Sonner (toasts) |
| **API Docs** | Swagger UI (em `/docs`) |

---

## 🏗️ Arquitetura

```text
portadeentrada/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/    # NextAuth handler (GET/POST)
│   │   │   └── register/         # POST /api/auth/register
│   │   ├── cultura/              # CRUD programas culturais
│   │   └── inscricoes/           # Inscrições em programas
│   ├── auth/
│   │   ├── login/                # GET /auth/login
│   │   └── register/             # GET /auth/register
│   ├── admin/                    # Área admin (role: ADMIN)
│   ├── cadastro/                 # Cadastros (role: EDITOR+)
│   ├── busca/                    # Busca global
│   └── [programas]/              # Páginas públicas (fomento, programação, etc.)
├── components/                   # React Components
│   ├── Header.tsx                # Header fixo + auth state + busca
│   ├── Footer.tsx                # Footer institucional
│   ├── Banner.tsx                # Carrossel hero (85vh)
│   ├── NavigationCard.tsx        # Cards de navegação
│   ├── SessionProvider.tsx       # NextAuth Provider
│   └── ToastProvider.tsx         # Sonner Toaster
├── lib/
│   ├── auth.ts                   # NextAuth config (credentials, callbacks, roles)
│   └── prisma.ts                 # Prisma Client singleton
├── prisma/
│   └── schema.prisma             # Models: User, Session, ProgramaCultural, Inscricao
├── middleware.ts                 # Route protection (ADMIN, EDITOR)
├── public/images/                # Assets estáticos (logos, banners, cards)
└── types/                        # TypeScript types (next-auth.d.ts)
```

---

## 🔐 Autenticação & Autorização

### Stack

- **NextAuth v5** (App Router compatible)
- **Credentials Provider** — email + senha
- **bcryptjs** — hash cost 12
- **JWT Strategy** — stateless sessions
- **Roles:** `ADMIN` > `EDITOR` > `VIEWER`

### Models (Prisma)

```prisma
enum Role { ADMIN, EDITOR, VIEWER }

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String
  role          Role      @default(VIEWER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 📡 Endpoints de Autenticação

### Páginas (App Router)

| Rota | Método | Arquivo | Descrição |
| ------ | -------- | --------- | ----------- |
| `/auth/login` | GET | `app/auth/login/page.tsx` | Formulário de login (email/senha) |
| `/auth/register` | GET | `app/auth/register/page.tsx` | Formulário de cadastro |

### API Routes

| Rota | Método | Arquivo | Descrição |
| ------ | -------- | --------- | ----------- |
| `/api/auth/[...nextauth]` | GET/POST | `app/api/auth/[...nextauth]/route.ts` | Handler NextAuth (todas rotas internas) |
| `/api/auth/register` | POST | `app/api/auth/register/route.ts` | Cria usuário (validação + bcrypt + Prisma) |

### Rotas NextAuth Internas (expõe via `[...nextauth]`)

| Rota Completa | Método | Função |
| --------------- | -------- | -------- |
| `/api/auth/signin` | GET | Página de login (redirect para `/auth/login`) |
| `/api/auth/callback/credentials` | POST | Valida credenciais, cria JWT |
| `/api/auth/signout` | GET/POST | Destrói sessão, redirect `/` |
| `/api/auth/session` | GET | Retorna `{ user: { id, name, email, role }, expires }` |
| `/api/auth/csrf` | GET | Token CSRF para formulários |
| `/api/auth/providers` | GET | Lista providers configurados |

---

## 🔀 Fluxos de Autenticação

### Login (Credentials)

```mermaid
sequenceDiagram
    User->>Browser: Acessa /auth/login
    Browser->>Server: GET /auth/login (page.tsx)
    Server-->>Browser: Render login form
    User->>Browser: Preenche email/senha + submit
    Browser->>Server: POST /api/auth/callback/credentials
    Server->>Prisma: findUnique(email)
    Server->>bcrypt: compare(password, hash)
    alt Credenciais válidas
        Server->>JWT: Sign token (id, name, email, role)
        Server-->>Browser: Set-Cookie (next-auth.session-token)
        Browser->>Server: Redirect to /
    else Inválidas
        Server-->>Browser: 401 + error message
    end
```

### Registro

```mermaid
sequenceDiagram
    User->>Browser: Acessa /auth/register
    Browser->>Server: GET /auth/register (page.tsx)
    User->>Browser: Preenche nome/email/senha + submit
    Browser->>Server: POST /api/auth/register
    Server->>Server: Valida (nome, email, senha >= 6)
    Server->>Prisma: findUnique(email)
    alt Email disponível
        Server->>bcrypt: hash(password, 12)
        Server->>Prisma: create User { role: VIEWER }
        Server-->>Browser: 201 { id, name, email, role }
        Browser->>Server: Redirect /auth/login
    else Email em uso
        Server-->>Browser: 409 { error }
    end
```

### Proteção de Rotas (Middleware)

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  
  // /admin/* → apenas ADMIN
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') return redirect('/auth/login')
  }
  
  // /cadastro/* → ADMIN ou EDITOR
  if (pathname.startsWith('/cadastro')) {
    if (!token || !['ADMIN','EDITOR'].includes(token.role)) return redirect('/')
  }
}
```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Next.js dev server (Turbopack)

# Build & Produção
npm run build            # Build otimizado (standalone)
npm run start            # Inicia servidor de produção

# Qualidade
npm run lint             # ESLint (Next.js config)

# Banco de Dados (Prisma)
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Migrações (dev)
npm run prisma:studio    # Prisma Studio (GUI)
npm run db:push          # Push schema sem migração
npm run db:seed          # Seed (ts-node prisma/seed.ts)
npm run db:reset         # Reset + migrate + seed
```

---

## ⚙️ Variáveis de Ambiente

```env
# .env (não commitar)
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
NEXTAUTH_SECRET="seu-secret-super-seguro-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

> **Produção:** Gere `NEXTAUTH_SECRET` com `openssl rand -base64 32`

---

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte repositório na Vercel
2. Configure Environment Variables:
   - `DATABASE_URL` (PostgreSQL - Vercel Postgres / Neon / Supabase)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (ex: `https://portadeentrada.prefeitura.sp.gov.br`)
3. Deploy automático a cada push em `main`

### Build Standalone (Docker/VM)

```bash
npm run build
# Output em .next/standalone/ — copiar + node_modules/.prisma/client
```

---

## 📦 Dependências Principais

### Runtime

```json
{
  "next": "^15.1.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "next-auth": "^5.0.0-beta.32",
  "@prisma/client": "^6.19.3",
  "bcryptjs": "^3.0.3",
  "sonner": "^2.0.8",
  "swagger-ui-react": "^5.32.14"
}
```

### Development

```json
{
  "typescript": "^5.7.0",
  "@types/node": "^22.10.0",
  "@types/react": "^19.0.0",
  "@types/react-dom": "^19.0.0",
  "@types/bcryptjs": "^3.0.0",
  "prisma": "^6.19.3",
  "tailwindcss": "^3.4.17",
  "postcss": "^8.5.0",
  "autoprefixer": "^10.4.20",
  "eslint": "^9.x",
  "eslint-config-next": "^15.1.0",
  "ts-node": "^10.9.2"
}
```

---

## 🔮 Roadmap Auth (Próximos Passos)

| Feature | Status | Esforço | Impacto |
| --------- | -------- | --------- | --------- |
| **OAuth Google/GitHub** | 📋 Planejado | Baixo | Médio |
| **OAuth OIDC Genérico** | 📋 Planejado | Médio | **Alto** (SSO corporativo, LGPD) |
| **Email/Magic Link** | 📋 Planejado | Médio | Médio (passwordless) |
| **Forgot/Reset Password** | 📋 Planejado | Baixo | **Alto** (recuperação credentials) |
| **MFA (TOTP/WebAuthn)** | 📋 Futuro | Alto | Alto (compliance) |
| **Session Management UI** | 📋 Futuro | Baixo | Médio (dispositivos ativos) |

### Implementação Recomendada (Próxima Sprint)

```typescript
// lib/auth.ts - adicionar providers OAuth
import GoogleProvider from "next-auth/providers/google"
import { OIDCProvider } from "next-auth/providers/oidc"

providers: [
  CredentialsProvider({ ... }),
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  OIDCProvider({
    id: "enterprise",
    name: "Enterprise SSO",
    issuer: process.env.OIDC_ISSUER!,
    clientId: process.env.OIDC_CLIENT_ID!,
    clientSecret: process.env.OIDC_CLIENT_SECRET!,
  }),
]
```

---

## 📝 Convenções do Projeto

| Área | Padrão |
| ------ | -------- |
| **Componentes** | PascalCase (`NavigationCard.tsx`) |
| **Hooks/Utils** | camelCase (`useSession`, `prisma.ts`) |
| **Types** | `types/next-auth.d.ts` (module augmentation) |
| **CSS** | Tailwind utility-first + `@layer components` se necessário |
| **Commits** | Conventional Commits (`feat:`, `fix:`, `chore:`) |
| **Branch** | `feat/`, `fix/`, `chore/` + descrição curta |

---

## 🔗 Links Úteis

- **Next.js 15 Docs:** <https://nextjs.org/docs>
- **NextAuth v5 Docs:** <https://next-auth.js.org/getting-started/introduction>
- **Prisma Docs:** <https://www.prisma.io/docs>
- **Tailwind CSS:** <https://tailwindcss.com/docs>
- **TypeScript:** <https://www.typescriptlang.org/docs>

---

## 📄 Licença

Proprietário — Prefeitura da Cidade de São Paulo / Secretaria Municipal de Cultura.
Uso restrito ao órgão.

---

*Documentação gerada em 2026-09-04. Atualize conforme evolução do projeto.*
