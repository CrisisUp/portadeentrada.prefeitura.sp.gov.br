-- init-db.sql - Inicialização do banco PostgreSQL
-- Executado automaticamente na primeira criação do container

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Log de inicialização
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados portadeentrada inicializado com sucesso!';
END $$;