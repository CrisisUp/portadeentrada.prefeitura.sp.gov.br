# Dockerfile para Porta de Entrada - Next.js 15 + Prisma + PostgreSQL
# Multi-stage build para produção otimizada

# =============================================================================
# BASE STAGE - Dependências comuns
# =============================================================================
FROM node:22-alpine AS base

# Instalar dependências do sistema necessárias para Prisma e bcrypt
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    python3 \
    make \
    g++

# Definir diretório de trabalho
WORKDIR /app

# Habilitar corepack para gerenciar pnpm/yarn se necessário
RUN corepack enable

# =============================================================================
# BUILDER STAGE - Build da aplicação
# =============================================================================
FROM base AS builder

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar TODAS as dependências (incluindo devDependencies para build)
RUN npm ci --prefer-offline --no-audit --progress=false

# Copiar código fonte e arquivos de configuração
COPY prisma ./prisma/
COPY next.config.ts tsconfig.json ./
COPY src ./src
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY types ./types
COPY public ./public
COPY middleware.ts ./

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# =============================================================================
# RUNNER STAGE - Imagem final de produção
# =============================================================================
FROM base AS runner

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas o necessário do builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copiar entrypoint script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Copiar node_modules de produção apenas (sem devDependencies)
# Nota: next.js standalone output já inclui as deps necessárias

# Mudar para usuário não-root
USER nextjs

# Entrypoint para migrações + seed automáticos
ENTRYPOINT ["./docker-entrypoint.sh"]

# Expor porta
EXPOSE 3000

# Configurar variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicialização
CMD ["node", "server.js"]