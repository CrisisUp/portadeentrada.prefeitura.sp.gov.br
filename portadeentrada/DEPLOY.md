# Deploy Guide — Porta de Entrada

## Pré-requisitos

- Node.js 20+
- PostgreSQL (Produção: Vercel Postgres ou Supabase)
- Upstash Redis (Rate limiting)
- Vercel Account

## Variáveis de Ambiente

| Variável | Descrição | Onde usar |
| --- | --- | --- |
| `DATABASE_URL` | URL de conexão PostgreSQL | Vercel |
| `NEXTAUTH_SECRET` | Secret para JWT (gere com `openssl rand -base64 32`) | Vercel |
| `NEXTAUTH_URL` | URL base do site (ex: `https://portadeentrada.prefeitura.sp.gov.br`) | Vercel |
| `UPSTASH_REDIS_REST_URL` | URL do Upstash Redis | Vercel |
| `UPSTASH_REDIS_REST_TOKEN` | Token do Upstash Redis | Vercel |
| `CRON_SECRET` | Secret para autenticar cron jobs (gere com `openssl rand -base64 32`) | Vercel |

## Deploy Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
cp .env.example .env
# Edite .env com sua DATABASE_URL

# 3. Rodar migrations
npx prisma migrate dev

# 4. Gerar Prisma Client
npx prisma generate

# 5. Rodar seed (opcional)
npm run db:seed

# 6. Iniciar dev server
npm run dev
```

## Deploy Produção (Vercel)

### 1. Configurar variáveis de ambiente

No dashboard da Vercel → Settings → Environment Variables:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Gere: `openssl rand -base64 32`
- `NEXTAUTH_URL` — `https://portadeentrada.prefeitura.sp.gov.br`
- `UPSTASH_REDIS_REST_URL` — Redis REST URL
- `UPSTASH_REDIS_REST_TOKEN` — Redis REST Token
- `CRON_SECRET` — Gere: `openssl rand -base64 32`

### 2. Deploy automático

O Vercel faz deploy automático a cada push em `main`.

Build step (definido em `vercel.json`):
```bash
prisma generate && npm run build
```

### 3. Database migrations

**Importante:** Migrations NÃO rodam automaticamente no Vercel.

Opção A — Rodar manualmente antes do deploy:
```bash
npx prisma migrate deploy
```

Opção B — Adicionar ao build (recomendado):
```bash
# Em package.json, adicionar ao build script:
"build": "prisma migrate deploy && prisma generate && next build"
```

Opção C — Usar Vercel Postgres com branch database:
```bash
# Vercel Postgres suporta migration automática via Git integration
```

### 4. Cron jobs

O `vercel.json` define um cron job para limpeza de tokens expirados:

```
GET /api/cron/cleanup-tokens → todos os dias às 03:00 UTC
```

Protegido por `CRON_SECRET` no header `Authorization: Bearer <token>`.

## Rollback

Se o deploy falhar:

1. No dashboard da Vercel → Deployments → clique no deployment anterior → "Promote to Production"
2. Para rollback de migration:
   ```bash
   npx prisma migrate reset  # CUIDADO: apaga dados
   # Ou manualmente:
   npx prisma migrate dev --create-only rollback-descriptive-name
   ```

## Health Check

```bash
# Verificar se o app está rodando
curl https://portadeentrada.prefeitura.sp.gov.br/api/health

# Verificar rate limit
curl -I https://portadeentrada.prefeitura.sp.gov.br/api/cultura
# Headers esperados: X-RateLimit-Limit, X-RateLimit-Remaining
```

## Troubleshooting

| Erro | Causa | Solução |
| --- | --- | --- |
| `P1001: Can't reach database` | DATABASE_URL inválido | Verificar URL no .env e no Vercel |
| `P3009: migration is failed` | Migration anterior falhou | `npx prisma migrate reset` em dev |
| `NEXTAUTH_ERROR: JWT` | NEXTAUTH_SECRET ausente/mudou | Regenerar secret e atualizar em todos os ambientes |
| Rate limit não funciona | Upstash não configurado | Verificar UPSTASH_REDIS_REST_URL/TOKEN |
