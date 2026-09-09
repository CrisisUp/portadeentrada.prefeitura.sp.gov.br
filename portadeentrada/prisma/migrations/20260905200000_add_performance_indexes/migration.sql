-- CreateIndex
CREATE INDEX "Inscricao_status_idx" ON "Inscricao"("status");

-- CreateIndex
CREATE INDEX "Inscricao_cpf_idx" ON "Inscricao"("cpf");

-- CreateIndex
CREATE INDEX "Inscricao_createdAt_idx" ON "Inscricao"("createdAt");

-- CreateIndex
CREATE INDEX "ProgramaCultural_status_idx" ON "ProgramaCultural"("status");

-- CreateIndex
CREATE INDEX "ProgramaCultural_categoria_idx" ON "ProgramaCultural"("categoria");
