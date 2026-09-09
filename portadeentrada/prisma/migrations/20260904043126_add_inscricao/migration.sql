-- CreateTable
CREATE TABLE "Inscricao" (
    "id" TEXT NOT NULL,
    "programaId" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "cep" TEXT,
    "portfolioUrl" TEXT,
    "cartaIntencao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inscricao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inscricao_programaId_idx" ON "Inscricao"("programaId");

-- CreateIndex
CREATE INDEX "Inscricao_email_idx" ON "Inscricao"("email");

-- AddForeignKey
ALTER TABLE "Inscricao" ADD CONSTRAINT "Inscricao_programaId_fkey" FOREIGN KEY ("programaId") REFERENCES "ProgramaCultural"("id") ON DELETE CASCADE ON UPDATE CASCADE;
