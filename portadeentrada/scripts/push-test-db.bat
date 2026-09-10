@echo off
set DATABASE_URL=file:./prisma/test.db
set PRISMA_CLI_BINARY_TARGETS=windows
npx prisma db push --schema=prisma/schema.test.prisma --force-reset --accept-data-loss