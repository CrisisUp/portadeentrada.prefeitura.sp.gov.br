# Secrets Rotation Policy — Porta de Entrada

## Resumo

| Secret | Frequência | Como rotacionar |
| --- | --- | --- |
| `NEXTAUTH_SECRET` | A cada 90 dias ou em caso de incidente | Vercel dashboard → Regenerate |
| `DATABASE_URL` | Quando o DB for migrado | Provider dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | A cada 90 dias | Upstash dashboard → Regenerate |
| `CRON_SECRET` | A cada 90 dias | Vercel dashboard → Regenerate |

## Procedimento de Rotação

### 1. NEXTAUTH_SECRET

```bash
# Gerar novo secret
NEW_SECRET=$(openssl rand -base64 32)
echo "Novo secret: $NEW_SECRET"

# Atualizar no Vercel (production + preview)
# Vercel Dashboard → Settings → Environment Variables → NEXTAUTH_SECRET

# Atualizar em todas as environments (production, preview, development)
```

**⚠️ Impacto:** Todos os usuários logados serão deslogados (sessions inválidos).

### 2. DATABASE_URL

1. Criar novo usuário no PostgreSQL
2. Conceder permissões
3. Atualizar `DATABASE_URL` no Vercel
4. Testar: `npx prisma db push`
5. Revogar acesso do usuário antigo

### 3. UPSTASH_REDIS_REST_TOKEN

1. Upstash Dashboard → Redis → Settings → Tokens
2. Generate new token
3. Atualizar `UPSTASH_REDIS_REST_TOKEN` no Vercel
4. Revoke antigo

**⚠️ Impacto:** Rate limiting temporariamente inoperante durante a atualização.

### 4. CRON_SECRET

```bash
NEW_CRON_SECRET=$(openssl rand -base64 32)
echo "Novo cron secret: $NEW_CRON_SECRET"

# Atualizar no Vercel Dashboard
```

## Rotation Calendar

| Mês | Secret | Responsável |
| --- | --- | --- |
| Janeiro | NEXTAUTH_SECRET, CRON_SECRET | — |
| Abril | UPSTASH_REDIS_REST_TOKEN | — |
| Julho | NEXTAUTH_SECRET, CRON_SECRET | — |
| Outubro | UPSTASH_REDIS_REST_TOKEN | — |

## Incident Response

Se um secret for comprometido:

1. **Rotacionar imediatamente** o secret afetado
2. **Invalidar sessões** (se NEXTAUTH_SECRET): todos os usuários serão deslogados
3. **Verificar logs** de auditoria por atividade suspeita
4. **Notificar** equipe de segurança
5. **Documentar** no CHANGELOG.md

## Storage

- **NUNCA** commitar secrets no Git
- Usar Vercel Environment Variables para produção
- Usar `.env.local` para desenvolvimento (não versionado)
- Verificar `.gitignore` inclui `.env*`
