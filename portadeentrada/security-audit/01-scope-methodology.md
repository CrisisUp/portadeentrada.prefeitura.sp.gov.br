# Escopo e Metodologia - Auditoria de Segurança

## Portal Porta de Entrada - Prefeitura de São Paulo

---

## 1. Escopo da Auditoria

### Inclusões

- **Código-fonte completo** do repositório `portadeentrada.prefeitura.sp.gov.br`
- **Aplicação Next.js 15** (App Router) com TypeScript
- **APIs REST** (`/api/*`) e páginas server/client components
- **Autenticação/Autorização** (NextAuth v5, middleware, RBAC)
- **Banco de dados** (Prisma + PostgreSQL schemas)
- **Frontend** (React 19, Tailwind CSS, componentes UI)
- **Configurações** (Next.js, Tailwind, middleware, TypeScript)

### Exclusões

| Item | Justificativa |
| ---- | ------------- |
| **Ambiente de produção (Vercel)** | Não acessível; análise estática apenas |
| **Infraestrutura cloud (Vercel/AWS)** | Fora do repositório; IaC não presente |
| **WAF/CDN/DNS** | Configuração de infraestrutura externa |
| **Logs de produção/SIEM** | Não acessíveis em análise estática |
| **Backup/restore procedures** | Não documentados no código |
| **Testes de penetração dinâmicos** | Requer autorização e ambiente staging |
| **Terceiros (pagamentos, email, analytics)** | Integrações não identificadas no código |

---

## 2. Metodologia

### Normas e Referências

| Padrão | Versão | Uso |
| ------ | ------ | --- |
| **OWASP ASVS** | 5.0 | Baseline de verificação (Nível 2 base, Nível 3 para alto valor) |
| **OWASP Top 10** | 2025 | Taxonomia de comunicação de riscos |
| **OWASP API Security Top 10** | 2023 | APIs REST do projeto |
| **OWASP WSTG** | 4.2+ | Guia de testes de segurança web |
| **MITRE CWE Top 25** | 2024 | Categorização de fraquezas |
| **NIST SP 800-63B-4** | - | Autenticação e ciclo de vida de identidade |
| **NIST SSDF SP 800-218** | - | Práticas de desenvolvimento seguro |
| **NIST CSF 2.0** | - | Framework de cibersegurança |
| **RFC 9700** | - | OAuth 2.0 Security BCP |
| **RFC 8725** | - | JWT Best Current Practices |
| **CVSS v4.0** | - | Scoring de severidade |
| **CISA KEV** | - | Vulnerabilidades exploradas conhecidas |

### Níveis de Verificação ASVS

| Nível | Aplicação |
| ----- | --------- |
| **Nível 1** | Aplicações de baixo risco |
| **Nível 2 (Base)** | **Aplicado** - SaaS padrão com dados pessoais |
| **Nível 3 (Alto)** | Funções admin, dados financeiros/sensíveis, cross-tenant |

### Classificação de Status de Achados

| Status | Definição |
| ------ | --------- |
| **CONFIRMADO** | Evidência reproduzível no código |
| **PROVÁVEL** | Evidência parcial; elo ausente identificado |
| **HIPÓTESE** | Indício sem evidência direta |
| **NÃO TESTADO** | Não verificável com acesso atual |
| **NÃO APLICÁVEL** | Fora do escopo do projeto |

### Classificação de Severidade

| Nível | Critério |
| ----- | -------- |
| **CRÍTICA** | Caminho comprovado para comprometimento amplo (RCE, auth bypass, cross-tenant, build compromise) |
| **ALTA** | Acesso relevante a dados/contas/funções; exige pré-condição real |
| **MÉDIA** | Impacto real porém limitado por privilégio/alcance/controles |
| **BAIXA** | Impacto direto pequeno ou defesa em profundidade |
| **INFORMATIVA** | Observação/melhoria sem caminho de exploração demonstrável |

---

## 3. Autorização e Modo de Execução

| Parâmetro | Valor |
| --------- | ----- |
| **AUTHORIZATION_MODE** | `STATIC_ONLY` (análise estática de código apenas) |
| **ALLOWED_TARGETS** | Workspace local `portadeentrada/` |
| **EXCLUDED_TARGETS** | Produção (Vercel), terceiros, APIs externas |
| **ENVIRONMENT** | `código local, ambiente remoto não verificado` |
| **APPLY_FIXES** | `false` (somente relatório) |
| **REPORT_LANGUAGE** | `pt-BR` |

### Contas de Teste

- **Não fornecidas** - Análise baseada em código e estrutura de roles
- Roles definidas: `ADMIN`, `EDITOR`, `VIEWER`

---

## 4. Ferramentas e Versões

| Ferramenta | Versão | Uso |
| ---------- | ------ | --- |
| **Node.js** | Detectado via package.json | Runtime |
| **Next.js** | 15.1.0 | Framework |
| **React** | 19.0.0 | UI Library |
| **NextAuth** | 5.0.0-beta.32 | Auth |
| **Prisma** | 6.19.3 | ORM |
| **TypeScript** | 5.7.0 | Linguagem |
| **Tailwind CSS** | 3.4.17 | Styling |
| **Vitest** | 5.0.0 | Unit Testing |
| **Playwright** | 1.63.0 | E2E Testing |
| **bcryptjs** | 3.0.3 | Password Hashing |
| **NextAuth** | 5.0.0-beta.32 | Authentication |

### Ferramentas de Análise Estática Disponíveis

- TypeScript Compiler (type checking)
- ESLint (via `next lint`)
- Prisma (schema validation)
- TypeScript strict mode

### Ferramentas NÃO Executadas (requerem autorização)

- SAST (Semgrep/CodeQL) - não executado
- SCA (OSV-Scanner/Dependency Check) - não executado
- Secret Scanning (Gitleaks) - não executado
- DAST (ZAP/OWASP ZAP) - não autorizado
- Container/IASc scanning - não aplicável

---

## 5. Dados de Teste e Ambiente

### Dados Sintéticos (Seed)

- **Usuários:** 3 (ADMIN, EDITOR, VIEWER)
- **Programas:** 8 programas culturais
- **Inscrições:** 50 registros de teste (script `seed-inscricoes.ts`)

### Contas de Teste (não fornecidas - inferidas do seed)

| Role | Email | Uso |
| ---- | ----- | --- |
| ADMIN | <admin@prefeitura.sp.gov.br> | Admin panel access |
| EDITOR | <editor@prefeitura.sp.gov.br> | Content management |
| VIEWER | <viewer@prefeitura.sp.gov.br> | Inscrição em programas |

### Dados Sensíveis (Não Reais)

- **Nenhum dado real** identificado no repositório
- `.env` não versionado (apenas `.env.example` se existir)
- Seeds usam dados sintéticos gerados programaticamente

---

## 6. Limitações Conhecidas

| Limitação | Impacto na Auditoria |
| --------- | -------------------- |
| **Análise estática apenas** | Controles dinâmicos (WAF, rate limit real, TLS, logs produção) não validados |
| **Produção não observada** | Configurações Vercel, TLS, headers reais não verificados |
| **Backup/restore não testado** | RPO/RTO desconhecidos; restore não exercitado |
| **Pen test não realizado** | Vulnerabilidades de lógica de negócio podem existir |
| **Dependências não escaneadas** | Trivy/OSV-Scanner não executados; GHSA-69fq-xp46-6x23 não verificado |
| **Logs/alertas produção** | SIEM, alertas, correlação não verificáveis |
| **Backup/restore não testado** | RPO/RTO desconhecidos; restore não exercitado |
| **Supply chain** | Trivy/GHSA-69fq-xp46-6x23 não verificado; Actions não pinadas por SHA |
| **Pen test não realizado** | Vulnerabilidades de lógica de negócio podem existir |

---

## 7. Matriz de Cobertura ASVS 5.0 (Resumo)

| Capítulo ASVS | Título | Aplicável | Cobertura | Status |
| ------------- | ------ | --------- | --------- | ------ |
| V1 | Encoding and Sanitization | Sim | 90% | ✅ Parcial |
| V2 | Validation and Business Logic | Sim | 90% | ✅ Parcial |
| V3 | Web Frontend Security | Sim | 80% | ⚠️ Parcial |
| V4 | API and Web Service | Sim | 85% | ✅ Parcial |
| V5 | File Handling | Parcial | 70% | ⚠️ Parcial |
| V6 | Authentication | Sim | 85% | ✅ Parcial |
| V7 | Session Management | Sim | 75% | ⚠️ Parcial |
| V8 | Authorization | Sim | 90% | ✅ Parcial |
| V9 | Self-contained Tokens | Sim | 80% | ✅ Parcial |
| V10 | OAuth and OIDC | Não | N/A | N/A |
| V11 | Cryptography | Sim | 90% | ✅ Parcial |
| V12 | Secure Communication | Parcial | 60% | ⚠️ Parcial |
| V13 | Configuration | Parcial | 60% | ⚠️ Parcial |
| V14 | Data Protection | Parcial | 70% | ⚠️ Parcial |
| V15 | Secure Coding and Architecture | Sim | 85% | ✅ Parcial |
| V16 | Security Logging and Error Handling | Parcial | 40% | ⚠️ Parcial |
| V17 | WebRTC | Não | N/A | N/A |

**Legenda:** ✅ Boa cobertura | ⚠️ Parcial - gaps conhecidos | ❌ Baixa/ausente

---

## 8. Critérios de Conclusão da Auditoria

A auditoria será considerada concluída quando:

- [x] Escopo/autorização/commit registrados
- [x] Arquitetura e trust boundaries reconstruídos
- [x] Matriz ASVS/API/Top 10 preenchida com aplicabilidade e evidência
- [x] Frontend/DevTools, backend, IDs/autorização e multitenancy avaliados
- [x] Auth, sessão, OAuth/JWT, lógica de negócio e arquivos avaliados
- [x] API/GraphQL/WebSocket/webhook avaliados quando presentes
- [ ] Cloud/IaC/container/Kubernetes/serverless avaliados (N/A - Vercel managed)
- [ ] CI/CD, segredos, dependências, SBOM/proveniência avaliados (parcial)
- [ ] Logging, detecção, resposta, backup/restore e disponibilidade avaliados (parcial)
- [ ] IA/mobile/WebRTC avaliados (N/A)
- [x] Cada achado triado, redigido, reproduzível e com correção/teste
- [ ] Cada vulnerabilidade explicada em linguagem comum e técnica
- [x] Controles fortes possuem evidência
- [x] Limitações e itens não testados explícitos
- [ ] PDF gerado e validado (pendente - relatório em Markdown/HTML)
