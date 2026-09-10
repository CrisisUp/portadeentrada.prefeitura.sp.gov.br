#!/bin/sh
# docker-entrypoint.sh - Script de inicialização do container
# Executa migrações, seed e inicia a aplicação

set -e

echo "🐳 Iniciando container Porta de Entrada..."

# Aguardar PostgreSQL estar pronto (se DATABASE_URL estiver definido)
if [ -n "$DATABASE_URL" ]; then
  echo "⏳ Aguardando banco de dados..."

  # Extrair host e porta do DATABASE_URL
  # postgresql://user:pass@host:port/db
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

  if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    echo "   Verificando conexão com $DB_HOST:$DB_PORT..."
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -q; do
      sleep 2
    done
    echo "   ✅ Banco de dados disponível!"
  fi
fi

# Executar migrações do Prisma
echo "📦 Executando migrações do Prisma..."
npx prisma migrate deploy

# Verificar se precisa fazer seed (tabela User vazia)
echo "🌱 Verificando seed..."
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "   Banco vazio, executando seed..."
  npm run db:seed
  echo "   ✅ Seed concluído!"
else
  echo "   Banco já possui $USER_COUNT usuário(s), pulando seed."
fi

# Iniciar aplicação
echo "🚀 Iniciando aplicação Next.js..."
exec node server.js