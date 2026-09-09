# Porta de Entrada

Portal cultural da Prefeitura da Cidade de São Paulo - Secretaria Municipal de Cultura.

## Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Prisma ORM, PostgreSQL
- **Autenticação:** NextAuth v5 (JWT + Credentials)
- **Estilo:** Tailwind CSS
- **Fonts:** Abril Fatface, Oswald, Open Sans (via next/font/google)

## Início Rápido

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npx prisma migrate deploy
npx prisma db seed

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
├── lib/               # Utilitários
│   ├── auth.ts        # Configuração NextAuth
│   ├── constants.ts   # Constantes compartilhadas
│   ├── logger.ts      # Logger estruturado
│   └── prisma.ts      # Cliente Prisma
├── prisma/
│   ├── schema.prisma  # Schema do banco
│   └── seed.ts        # Dados iniciais
└── types/             # Definições TypeScript
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar em produção |
| `npm run lint` | Verificar código |
| `npm run db:seed` | Preencher banco com dados iniciais |
| `npm run db:reset` | Resetar banco e recriar dados |
| `npm run prisma:studio` | Abrir Prisma Studio |

## Usuários Padrão (Seed)

Os senhas são geradas automaticamente ou definidas via variáveis de ambiente:

| Email | Função | Variável |
|-------|--------|----------|
| admin@prefeitura.sp.gov.br | ADMIN | `SEED_ADMIN_PASSWORD` |
| editor@prefeitura.sp.gov.br | EDITOR | `SEED_EDITOR_PASSWORD` |
| viewer@prefeitura.sp.gov.br | VIEWER | `SEED_VIEWER_PASSWORD` |

## Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portadeentrada"

# NextAuth
NEXTAUTH_SECRET="seu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Seed passwords (opcional)
SEED_ADMIN_PASSWORD="sua-senha"
SEED_EDITOR_PASSWORD="sua-senha"
SEED_VIEWER_PASSWORD="sua-senha"
```

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

## Licença

© 2026 Prefeitura da Cidade de São Paulo
