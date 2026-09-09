# Inconsistências para Resolver - Porta de Entrada

> Auditoria completa do projeto Porta de Entrada (Prefeitura de São Paulo).
> Gerada em 2026-09-07 com varredura de todos os arquivos, configs, componentes, rotas API, testes, estilos, segurança e deploy.

---

## 📋 Índice

1. [Bugs Críticos (Build/Runtime)](#-bugs-críticos)
2. [Segurança](#-segurança)
3. [Arquitetura e Código](#-arquitetura-e-código)
4. [Dark Mode e Tema](#-dark-mode-e-tema)
5. [UX/UI e Acessibilidade](#-uxui-e-acessibilidade)
6. [Testes e Qualidade](#-testes-e-qualidade)
7. [DevOps e Deploy](#-devops-e-deploy)
8. [Documentação](#-documentação)

---

## 🚨 Bugs Críticos

### **[ ] BUG-01**: Import de CPF com Case Mismatch (CRÍTICO - Quebra Build)

**Arquivo:** `app/api/inscricoes/route.ts` (linha 6)
**Problema:** O arquivo importa `isValidCPF` e `cleanCPF` (CPF maiúsculo), mas `lib/cpf.ts` exporta `isValidCpf` e `cleanCpf` (camelCase). JavaScript é case-sensitive — isso causa erro de import em runtime.
**Impacto:** Rota `POST /api/inscricoes` não funciona.
**Solução:** Corrigir imports para `isValidCpf` e `cleanCpf` em `app/api/inscricoes/route.ts`.
**Prioridade:** 🔴 CRÍTICA

---

### **[ ] BUG-02**: Dependência `zod` Ausente do package.json (CRÍTICO - Quebra Build)

**Arquivo:** `lib/schemas.ts` (linha 6), `lib/api-error.ts` (linha 8)
**Problema:** Ambos importam `from 'zod'`, mas `zod` não está em `dependencies` nem `devDependencies` no `package.json`. Não está instalado em `node_modules`.
**Impacto:** Se qualquer arquivo que usa `zod` for importado por código ativo, o build quebra. Atualmente `schemas.ts` e `api-error.ts` são dead code, mas `api-error.ts` é referenciada em docs como solucionadora.
**Solução:** Adicionar `zod` como production dependency (`npm i zod`) OU remover os imports se o código será descartado.
**Prioridade:** 🔴 CRÍTICA

---

### **[ ] BUG-03**: Dependabot YAML com Erro de Indentação

**Arquivo:** `.github/dependabot.yml` (linhas 23-29)
**Problema:** A segunda entrada `package-ecosystem: "npm"` (para security-only updates) está indentada dentro da primeira entrada, em vez de ser um item separado no array `updates`.
**Impacto:** O Dependabot pode não funcionar corretamente — updates de segurança podem ser ignorados.
**Solução:** Corrigir indentação YAML para que ambas as entradas `npm` sejam itens separados no array `updates`.
**Prioridade:** 🔴 CRÍTICA

---

## 🔒 Segurança

### **[ ] SEC-01**: MFA Não Implementado para ADMIN/EDITOR

**Arquivo:** `lib/auth.ts`
**Status:** ❌ Não implementado
**Problema:** NextAuth v5 suporta WebAuthn/FIDO2 mas não está configurado como obrigatório para roles privilegiadas.
**Impacto:** Credential stuffing → Account Takeover → Admin Panel Access.
**Solução:** Implementar `pages.signIn` customizada com step-up auth ou condição MFA obrigatória no callback JWT.
**Prioridade:** 🔴 ALTA

---

### **[ ] SEC-02**: Headers de Segurança Duplicados (next.config.mjs + vercel.json)

**Arquivos:** `next.config.mjs` (linhas 20-101) + `vercel.json` (linhas 7-15)
**Problema:** Ambos definem security headers para `/(.*)`. No Vercel, headers são mesclados, causando possíveis duplicatas ou conflitos.
**Impacto:** Headers HTTP duplicados em responses. `next.config.mjs` tem CSP/HSTS que `vercel.json` não tem — assets estáticos do CDN ficam sem CSP/HSTS.
**Solução:** Definir headers de segurança em UM único local. Recomendação: usar apenas `next.config.mjs` e remover de `vercel.json`, OU adicionar CSP/HSTS ao `vercel.json` para cobrir assets estáticos.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] SEC-03**: CSP com `unsafe-eval` e `unsafe-inline`

**Arquivo:** `next.config.mjs` (linhas 41-42)
**Problema:** `script-src` inclui `'unsafe-eval'` e `'unsafe-inline'`. `cdn.tailwindcss.com` está listado mas só é necessário em dev.
**Impacto:** Reduz proteção XSS. `'unsafe-eval'` permite execução de código arbitrário via eval().
**Solução:** Remover `cdn.tailwindcss.com` do CSP (não deve estar em produção). Considerar usar nonces/hashes em vez de `unsafe-inline`. `'unsafe-eval'` é difícil de remover com Next.js, mas deve ser avaliado.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] SEC-04**: Rate Limiting Não Aplicado em Rotas API Gerais

**Arquivo:** `lib/ratelimit.ts`, rotas API
**Problema:** `apiRateLimit` (100 req/min) é definido mas NUNCA importado por nenhuma rota. Apenas rotas de auth (login, register) têm rate limiting.
**Impacto:** Rotas de cultura, inscrições e admin não têm proteção contra abuso.
**Solução:** Aplicar `apiRateLimit` nas rotas de admin e mutations (POST/PUT/DELETE), ou aplicar via middleware para todas as rotas API.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] SEC-05**: `images.remotePatterns` Permite Todos os Hosts HTTPS

**Arquivo:** `next.config.mjs` (linhas 12-16)
**Problema:** `hostname: '**'` aceita imagens de qualquer host HTTPS. Imagens do projeto são todas locais (`/images/`).
**Impacto:** Potencial SSRF via endpoint de otimização de imagens do Next.js.
**Solução:** Restringir `remotePatterns` para apenas os hosts necessários, ou remover a config se todas as imagens são locais.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] SEC-06**: `portfolioUrl` Não Validado no Servidor

**Arquivo:** `app/api/inscricoes/route.ts` (POST)
**Problema:** O campo `portfolioUrl` é apenas `.trim()`-ed e salvo sem validação de URL. Um usuário pode enviar `javascript:alert(1)` como URL.
**Impacto:** XSS armazenado — se o valor for renderizado como `<a href>`, pode executar JavaScript.
**Solução:** Validar `portfolioUrl` com regex de URL ou usar o schema Zod (`z.string().url()`) antes de salvar.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] SEC-07**: Secret `CRON_SECRET` Ausente do .env.example

**Arquivo:** `DEPLOY.md`, `SECRETS.md`, `.env.example`
**Problema:** `CRON_SECRET` é documentado em DEPLOY.md e SECRETS.md mas não está listado no `.env.example`.
**Impacto:** Desenvolvedores não sabem que precisam configurar essa variável.
**Solução:** Adicionar `CRON_SECRET=your-cron-secret-here` ao `.env.example`.
**Prioridade:** 🟢 BAIXA

---

### **[ ] SEC-08**: `playwright-report/` e `test-results/` Rastreados no Git

**Arquivo:** `.gitignore`
**Problema:** Esses diretórios estão no `.gitignore` mas foram commitados antes da regra. Continuam rastreados.
**Impacto:** Artefatos de teste desnecessários no repositório.
**Solução:** Executar `git rm -r --cached playwright-report test-results` para parar de rastrear.
**Prioridade:** 🟢 BAIXA

---

## 🏗️ Arquitetura e Código

### **[ ] ARC-01**: Código Morte - `lib/schemas.ts` (210 linhas NUNCA Usado)

**Arquivo:** `lib/schemas.ts`
**Problema:** Arquivo inteiro (27+ exports de schemas Zod, helpers de validação, tipos inferidos) não é importado por nenhum outro arquivo do projeto.
**Impacto:** Código morto que confunde desenvolvedores e mantém dependência fantasma em `zod`.
**Solução:** OU integrar os schemas nas rotas API (substituindo validação manual) OU remover o arquivo se não há plano de uso.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] ARC-02**: Código Morte - `lib/api-error.ts` (NUNCA Usado)

**Arquivo:** `lib/api-error.ts`
**Problema:** `handleApiError`, `withErrorHandling`, `safeAsync`, `ApiError` class — nenhum é importado por nenhuma rota API. Documentado como "solução aplicada" mas não integrado.
**Impacto:** Erros de API continuam com formato inconsistente (ver ARC-04).
**Solução:** Integrar `withErrorHandling` em todas as rotas API OU remover o arquivo se abordagem alternativa será usada.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] ARC-03**: Código Morte - `lib/cep.ts` (NUNCA Usado)

**Arquivo:** `lib/cep.ts`
**Problema:** 5 funções exportadas (`cleanCep`, `isValidCepFormat`, `formatCep`, `fetchCep`, `validateCep`) não são importadas por nenhum arquivo. Documentado como resolvido mas não integrado ao cadastro ou API.
**Impacto:** Validação de CEP não está realmente aplicada em nenhum fluxo.
**Solução:** Integrar no `app/cadastro/page.tsx` e `app/api/inscricoes/route.ts`.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] ARC-04**: Formato de Resposta Inconsistente nas Rotas API

**Arquivos:** Todas as rotas em `app/api/`
**Problema:** Formatos de resposta variam entre rotas:

| Rota | Sucesso | Erro |
| ---- | ------- | ---- |
| `GET /api/cultura` | Array direto `[]` | `{ error: string }` |
| `POST /api/cultura` | Objeto direto | `{ error: string }` |
| `POST /api/inscricoes` | `{ message, inscricao: {...} }` | `{ error: string }` |
| `GET /api/admin/inscricoes` | `{ inscricoes, programas, pagination }` | `{ error: string }` |
| `GET /api/admin/stats` | `{ programas, categorias, usuarios, inscricoes }` | `{ error: string }` |

**Solução:** Padronizar formato: `{ data: ..., message?: string }` para sucesso e `{ error: string, details?: any }` para erro. Usar o `ApiError` e `withErrorHandling` já existentes.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] ARC-05**: Validação Manual nas Rotas API vs Zod Schemas

**Arquivos:** `app/api/auth/register/route.ts`, `app/api/inscricoes/route.ts`, etc.
**Problema:** As rotas usam validação manual com regex e strings hardcoded, enquanto `lib/schemas.ts` define schemas completos que não são usados. Lógica de validação duplicada pode divergir.
**Impacto:** Bugs de validação que passam despercebidos; manutenção em dois lugares.
**Solução:** Migrar rotas para usar Zod schemas (e integrar `withErrorHandling` para tratar `ZodError`).
**Prioridade:** 🟡 MÉDIA

---

### **[ ] ARC-06**: Mensagens de Erro Inline vs Catálogo Centralizado

**Arquivos:** `app/api/auth/register/route.ts`, `app/api/cron/cleanup-tokens/route.ts`, `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx`
**Problema:** `lib/errors.ts` define um catálogo completo de mensagens, mas várias rotas usam strings inline:

- `register/route.ts`: `'Nome, email e senha sao obrigatorios'`, `'Email invalido'`, etc. (5 strings inline)
- `cleanup-tokens/route.ts`: `'Unauthorized'` (em inglês!)
- `forgot-password/page.tsx`: `'Erro ao enviar email. Tente novamente.'`
- `reset-password/page.tsx`: 4 strings inline

**Impacto:** Inconsistência de texto, uma mensagem em inglês em projeto todo em português.
**Solução:** Substituir todas as strings inline por imports de `lib/errors.ts`. Traduzir `'Unauthorized'` para português.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] ARC-07**: Fraseamento Inconsistente do Content-Type Check

**Arquivos:** `app/api/cultura/route.ts` (linha 39), `app/api/auth/register/route.ts` (linha 33)
**Problema:** Mesma validação com frases diferentes:

- Cultura: `'Formato de dados invalido. Envie os dados em JSON.'`
- Register: `'Content-Type deve ser application/json'`
**Solução:** Usar `SYSTEM_ERRORS.CONTENT_TYPE` de `lib/errors.ts` em ambos.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-08**: Nomes de Props Misturados (Português vs Inglês)

**Arquivos:** Diversos componentes
**Problema:** Props de componentes misturam idiomas:

- Português: `titulo`, `categoriaLabel`, `fallbackDescricao`, `fallbackConteudo`
- Inglês: `variant`, `size`, `loading`, `label`, `error`, `hint`
**Solução:** Padronizar: usar inglês para props genéricas de UI e português para dados de domínio específicos (que já é o padrão parcial). Documentar a convenção.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-09**: Export Default + Named Duplos em `lib/cpf.ts` e `lib/cep.ts`

**Arquivos:** `lib/cpf.ts`, `lib/cep.ts`
**Problema:** Ambos exportam funções nomeadas E um `export default { func1, func2, ... }`. O default export não é usado em lugar nenhum.
**Impacto:** Confusão sobre qual padrão de import usar.
**Solução:** Remover o `export default` e manter apenas exports nomeados (padrão do resto do projeto).
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-10**: Export Default não Usado em `lib/prisma.ts`

**Arquivo:** `lib/prisma.ts`
**Problema:** O arquivo exporta `export const prisma` (nomeado) e `export default prisma`. Todos os consumidores usam o export nomeado.
**Solução:** Remover `export default prisma`.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-11**: Bloco de Logo Duplicado 5x nas Páginas de Auth

**Arquivos:** `app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `app/auth/forgot-password/page.tsx`, `app/auth/reset-password/page.tsx`
**Problema:** O mesmo bloco `<Link href="/"><img src="/images/logo-portadeentrada-white-low.png" ... className="invert" /></Link>` está copiado 5 vezes (2x em reset-password) em 4 arquivos.
**Solução:** Extrair para um componente compartilhado `AuthLogo`.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-12**: Componentes Skeleton NÃO Usados em Lugar Nenhum

**Arquivo:** `components/ui/Skeleton.tsx`
**Problema:** `CardSkeleton`, `TableRowSkeleton`, `FormSkeleton`, `StatsSkeleton`, `BadgeSkeleton`, `ImageSkeleton` — todos exportados mas nenhum é importado.
**Impacto:** Páginas implementam loading states inline duplicados em vez de usar esses componentes.
**Solução:** Usar os Skeletons nas páginas correspondentes ou removê-los.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-13**: Variável `searchTimeoutRef` Não Usada

**Arquivo:** `components/Header.tsx` (linha 32)
**Problema:** `useRef` declarado mas nunca lido ou atribuído em outro lugar.
**Solução:** Remover a declaração.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-14**: Hook `useDebounce` Inline Duplicável

**Arquivo:** `components/Header.tsx` (linhas 11-25)
**Problema:** `useDebounce` é definido inline dentro do componente. Não existe diretório `hooks/` no projeto.
**Solução:** Mover para `hooks/useDebounce.ts` para reutilização.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-15**: Constantes Definidas Dentro da Função Handler

**Arquivo:** `app/api/admin/inscricoes/route.ts` (linhas 16-17 do GET handler)
**Problema:** `ALLOWED_SORT_FIELDS` e `ALLOWED_SORT_ORDERS` são recriados a cada request porque estão dentro da função GET.
**Solução:** Mover para escopo do módulo (topo do arquivo).
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-16**: Duplo Fetch na Montagem do Admin Inscricoes

**Arquivo:** `app/admin/inscricoes/page.tsx`
**Problema:** Dois `useEffect` chamam `fetchInscricoes(1)` — um no mount (session/status), outro em search/filter. Na primeira carga, ambos disparam, causando request duplicado.
**Solução:** Consolidar em um único `useEffect` ou usar `useRef` para evitar duplo fetch no mount.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-17**: Cache ausente para Programas Culturais

**Arquivo:** `components/ProgramaPage.tsx`
**Problema:** Componente server-side faz `prisma.programaCultural.findFirst()` a cada renderização (6 páginas × 1 query cada). Sem cache.
**Solução:** Adicionar `unstable_cache` do Next.js ou `revalidate` para cache de 60s+.
**Prioridade:** 🟢 BAIXA

---

### **[ ] ARC-18**: Prisma Migrations Fora de Sincronia com o Schema

**Arquivo:** `prisma/schema.prisma` + `prisma/migrations/`
**Problema:** O schema declara features sem migração correspondente:

- `deletedAt` em `ProgramaCultural` e `Inscricao`
- `slug` + `@@index([slug])` em `ProgramaCultural`
- `@@index([programaId, status])` em `Inscricao`
- `@@index([deletedAt])` e `@@index([createdAt])` em `Inscricao`
- Model `PasswordResetToken`
- Tipo `StatusInscricao` enum (migração cria como TEXT)

**Impacto:** O schema Prisma está à frente das migrações reais. Rodar `prisma generate` pode gerar código que não corresponde ao banco.
**Solução:** Criar migração consolidada (`prisma migrate dev --create-only`) para aplicar todas as features pendentes.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] ARC-19**: Admin Auth Check Duplicado (Middleware + Client)

**Arquivos:** `app/admin/page.tsx`, `app/admin/inscricoes/page.tsx`
**Problema:** O middleware já protege `/admin/*` verificando JWT. Mas ambas as páginas admin implementam verificação client-side redundante (`useSession` + redirect para `/auth/login`).
**Impacto:** Lógica de auth duplicada; pode causar flash de redirect desnecessário.
**Solução:** Confiar no middleware e remover checks client-side redundantes, OU manter como defense-in-depth mas documentar.
**Prioridade:** 🟢 BAIXA

---

## 🌙 Dark Mode e Tema

### **[ ] DM-01**: Dark Mode Não Funciona (Flash + CSS Variables Não Usadas)

**Arquivo:** `app/layout.tsx`, `components/ui/ThemeToggle.tsx`, `app/globals.css`
**Problema:** O tema dark sofre de flash-of-wrong-theme (FOWT) no carregamento. O `<html>` não tem `suppressHydrationWarning` nem script inline para ler `localStorage` antes da hidratação. O `ThemeToggle` aplica a classe `dark` apenas no `useEffect` (client-side).
**Impacto:** Usuários do dark mode veem o tema light por um momento antes de mudar.
**Solução:** Adicionar script inline no `<head>` do `layout.tsx` que lê `localStorage('theme')` e aplica a classe `dark` antes do React hidratar. Adicionar `suppressHydrationWarning` no `<html>`.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-02**: Variáveis CSS de Tema Definidas mas NÃO Consumidas

**Arquivo:** `app/globals.css`
**Problema:** `globals.css` define variáveis completas (`--bg-primary`, `--text-primary`, `--border-primary`, etc.) para light e dark. NENHUM componente usa essas variáveis — todos usam classes Tailwind hardcoded (`bg-gray-50`, `text-gray-600`, etc.).
**Impacto:** O sistema de variáveis CSS é inerte. Dark mode não funciona na maioria dos componentes.
**Solução:** Migrar componentes para usar as variáveis CSS (`bg-[var(--bg-primary)]`), OU remover as variáveis e usar apenas `dark:` do Tailwind consistentemente.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-03**: `text-dark` Sempre Escuro

**Arquivo:** `app/globals.css`, `tailwind.config.cjs`
**Problema:** `--color-dark: #1a1a1a` tem o MESMO valor em `:root` e `.dark`. A classe `text-dark` (usada em 30+ locais) sempre resolve para quase-preto.
**Impacto:** Texto escuro em fundo escuro = ilegível.
**Solução:** Adicionar valor claro para `--color-dark` no bloco `.dark` (ex: `--color-dark: #f0f0f0`).
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-04**: Toasts Ignoram Dark Mode

**Arquivo:** `components/ToastProvider.tsx` (linhas 14-17)
**Problema:** Inline styles fixos: `background: '#fff'`, `color: '#1a1a1a'`, `border: '1px solid #e5e5e5'`. Não respondem ao tema.
**Impacto:** Toasts sempre aparecem com visual light.
**Solução:** Usar CSS variables ou classes Tailwind dinâmicas baseadas no tema atual.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-05**: Skeleton Shimmer Sempre Claro

**Arquivo:** `app/animations.css` (linhas 59-66)
**Problema:** `.skeleton-shimmer` usa `#f0f0f0` e `#e0e0e0` — cores claras que ficam "cegas" em dark mode.
**Impacto:** Skeletons aparecem como blocos claros sobre fundo escuro.
**Solução:** Usar CSS variables ou classes dark para ajustar as cores do shimmer.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-06**: `loading.tsx` Sem Dark Mode

**Arquivo:** `app/loading.tsx`
**Problema:** Usa `bg-gray-50`, `bg-gray-200`, `bg-white/10` sem variantes `dark:`.
**Impacto:** Tela de loading sempre visual light.
**Solução:** Adicionar classes `dark:bg-gray-800`, `dark:bg-gray-600`, etc.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-07**: `error.tsx` Sem Dark Mode

**Arquivo:** `app/error.tsx` (linhas 22-27)
**Problema:** Usa `bg-gray-50`, `text-gray-600` sem variantes `dark:`.
**Impacto:** Tela de erro sempre visual light.
**Solução:** Adicionar classes `dark:` correspondentes.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-08**: `Card.tsx` Sem Dark Mode

**Arquivo:** `components/ui/Card.tsx`
**Problema:** Base class `bg-white` sem `dark:bg-gray-800`.
**Impacto:** Cards sempre com fundo branco.
**Solução:** Adicionar `dark:bg-gray-800` (ou usar variável CSS).
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DM-09**: `.focus-ring` hardcoded

**Arquivo:** `app/animations.css` (linha 86)
**Problema:** `box-shadow: 0 0 0 3px rgba(64, 84, 178, 0.3)` usa cor primária hardcoded em vez de variável CSS.
**Solução:** Usar `var(--color-primary)` ou equivalente.
**Prioridade:** 🟢 BAIXA

---

## 🎨 UX/UI e Acessibilidade

### **[ ] A11Y-01**: Ícones SVG Inline Sem Acessibilidade

**Arquivos:** `components/Header.tsx`, `app/admin/page.tsx`, `app/admin/inscricoes/page.tsx`
**Problema:** Ícones SVG inline não têm `aria-hidden="true"` nem `role="img"` com `aria-label`.
**Impacto:** Leitores de tela ignore ou verbalizam SVGs de forma inesperada.
**Solução:** Adicionar `aria-hidden="true"` a todos os ícones decorativos. Para ícones informativos, adicionar `role="img"` + `aria-label`.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] A11Y-02**: Tabela Admin Sem Roles ARIA

**Arquivo:** `app/admin/inscricoes/page.tsx`
**Problema:** Tabela não usa `role="table"`, `role="row"`, `role="columnheader"`, `role="cell"`. Colunas ordenáveis não têm `aria-sort`. Botão "Ver detalhes" não identifica qual inscrição abre.
**Solução:** Usar semântica HTML correta (`<table>`, `<th>`, `<td>`) ou adicionar roles ARIA. Adicionar `aria-sort` nas colunas ordenáveis. Adicionar `aria-label` descritivo no botão.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] A11Y-03**: `<img>` ao Invés de `<Image>` nas Páginas de Auth

**Arquivos:** `app/auth/login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`
**Problema:** Usam `<img>` raw em vez do componente `<Image>` do Next.js.
**Impacto:** Perde otimização automática (WebP, lazy loading, responsive sizing).
**Solução:** Substituir por `<Image>` do `next/image` com width/height/priority.
**Prioridade:** 🟢 BAIXA

---

### **[ ] A11Y-04**: `role="main"` Redundante

**Arquivo:** `app/layout.tsx` (linha 39)
**Problema:** `<main>` já implica `role="main"` semanticamente.
**Solução:** Remover `role="main"` (redundante).
**Prioridade:** 🟢 BAIXA

---

### **[ ] UI-01**: `next-auth` em Versão Beta

**Arquivo:** `package.json` (linha 31)
**Problema:** `"next-auth": "^5.0.0-beta.32"` — o `^` pode puxar betas com breaking changes.
**Impacto:** Atualização automática pode quebrar o projeto.
**Solução:** Fixar versão exata (`"5.0.0-beta.32"` sem `^`) ou monitorar releases ativamente.
**Prioridade:** 🟢 BAIXA

---

### **[ ] UI-02**: Selects HTML em Vez de Componente UI Compartilhado

**Arquivos:** `app/admin/inscricoes/page.tsx`, `app/busca/page.tsx`
**Problema:** Usam `<select>` HTML raw com Tailwind inline em vez de usar o componente `Input` ou criar um `Select` compartilhado.
**Impacto:** Estilo inconsistente entre selects e campos de texto.
**Solução:** Criar componente `Select` em `components/ui/` ou estender `Input` para suportar `<select>`.
**Prioridade:** 🟢 BAIXA

---

### **[ ] UI-03**: Espaçamento de Conteúdo Inconsistente

**Arquivos:** Diversas páginas
**Problema:** `max-width` varia entre páginas sem padrão claro:

- `busca/page.tsx`: `max-w-[900px]`
- `cadastro/page.tsx`: `max-w-[900px]`
- `admin/page.tsx`: `max-w-4xl` (896px — 4px diferente)
- `admin/inscricoes/page.tsx`: `max-w-7xl`
- Auth pages: `max-w-md`
**Solução:** Definir constantes de layout em `lib/constants.ts` (CONTENT_WIDTH, ADMIN_WIDTH, AUTH_WIDTH).
**Prioridade:** 🟢 BAIXA

---

## 🧪 Testes e Qualidade

### **[ ] TEST-01**: Sem Testes para Rotas API

**Problema:** NENHUMA rota API (`app/api/**/route.ts`) tem teste unitário ou de integração. O `vitest.config.ts` referencia `tests/integration/**/*.test.ts` mas esse diretório não existe.
**Solução:** Criar testes de integração para rotas críticas: POST /api/inscricoes, POST /api/auth/register, GET/POST /api/cultura, PATCH /api/admin/inscricoes.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] TEST-02**: Sem Testes para Componentes React

**Problema:** Nenhum componente React tem teste unitário ou de integração.
**Solução:** Criar testes com `@testing-library/react` para componentes críticos: Header, Banner, NavigationCard, ThemeToggle, Button, Input, Card.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] TEST-03**: Sem Testes para Middleware

**Arquivo:** `middleware.ts`
**Problema:** O middleware de auth e rate limiting não tem cobertura de teste.
**Solução:** Testar cenários: acesso não autenticado a `/admin`, rate limit excedido, token JWT inválido/expirado.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] TEST-04**: Sem Testes para Lógica de Auth (`lib/auth.ts`)

**Arquivo:** `lib/auth.ts`
**Problema:** Token rotation, JWT callbacks, role extraction — nenhuma dessas funcionalidades tem teste.
**Solução:** Criar testes para: token rotation (jti muda), role embedding, token expiry, session callbacks.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] TEST-05**: Sem Testes para Rate Limiting (`lib/ratelimit.ts`)

**Arquivo:** `lib/ratelimit.ts`
**Problema:** Comportamento do rate limiting não testado.
**Solução:** Testar com mock do Upstash Redis: verify rate limit returns `{ success: true/false }`, reset window behavior.
**Prioridade:** 🟢 BAIXA

---

### **[ ] TEST-06**: Sem Testes para Soft Delete (`lib/prisma.ts`)

**Arquivo:** `lib/prisma.ts`
**Problema:** A extensão Prisma de soft delete (intercepta findMany, delete, etc.) não tem testes.
**Solução:** Testar que: `delete()` converta para `update(deletedAt)`, queries filtram `deletedAt: null`.
**Prioridade:** 🟢 BAIXA

---

## 🚀 DevOps e Deploy

### **[ ] DEV-01**: `vercel.json` buildCommand sem `prisma migrate deploy`

**Arquivo:** `vercel.json`
**Problema:** Build roda `prisma generate && npm run build` mas NÃO `prisma migrate deploy`. Migrations devem ser rodadas separadamente antes do deploy.
**Impacto:** Se alguém esquecer de rodar migration antes, o deploy usa schema desatualizado.
**Solução:** Adicionar `npx prisma migrate deploy` ao buildCommand OU documentar que migrations são responsabilidade do deployer.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DEV-02**: Swagger URL Hardcoded como `localhost:3000`

**Arquivo:** `lib/swagger.ts` (linha 14)
**Problema:** Server URL fixa em `http://localhost:3000`.
**Solução:** Usar `process.env.NEXTAUTH_URL || 'http://localhost:3000'`.
**Prioridade:** 🟢 BAIXA

---

### **[ ] DEV-03**: Root `node_modules/` Sem package.json

**Arquivo:** Diretório raiz do repositório
**Problema:** Existe `node_modules/` no diretório raiz, mas NÃO há `package.json` no root. Parece artefato de execução de `npm install` no diretório errado.
**Solução:** Remover `node_modules/` do root e garantir que `.gitignore` cobre.
**Prioridade:** 🟢 BAIXA

---

### **[ ] DEV-04**: DEV-02 no Documento Antigo Desatualizado

**Arquivo:** `INCONSISTENCIAS-PARA-RESOLVER.md` (documento dentro de `portadeentrada/`)
**Problema:** O item DEV-02 diz "Status: Sem `.github/workflows/`" mas os workflows `ci.yml` e `security.yml` já existem.
**Solução:** Atualizar status para RESOLVIDO no documento antigo.
**Prioridade:** 🟢 BAIXA

---

## 📚 Documentação

### **[ ] DOC-01**: README Não Menciona Scripts de Teste

**Arquivo:** `README.md`
**Problema:** Tabela de scripts não inclui `test`, `test:watch`, `test:coverage`, `test:e2e` que existem no `package.json`.
**Solução:** Adicionar scripts de teste à documentação.
**Prioridade:** 🟢 BAIXA

---

### **[ ] DOC-02**: README Não Menciona Todas as Rotas API

**Arquivo:** `README.md`
**Problema:** Seção de API routes não lista: `/api/admin/inscricoes`, `/api/admin/stats`, `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/cron/cleanup-tokens`.
**Solução:** Atualizar documentação com todas as rotas.
**Prioridade:** 🟢 BAIXA

---

### **[ ] DOC-03**: DEPLOY.md Referencia `/api/health` Inexistente

**Arquivo:** `DEPLOY.md` (linha 113)
**Problema:** Cita `curl https://portadeentrada.prefeitura.sp.gov.br/api/health` mas nenhum endpoint de health check existe.
**Solução:** Criar endpoint `/api/health` OU remover a referência do DEPLOY.md.
**Prioridade:** 🟢 BAIXA

---

### **[ ] DOC-04**: Variáveis de Ambiente Incompletas no `.env.example`

**Arquivo:** `.env.example`
**Problema:** Faltam variáveis que existem no código:

- `CRON_SECRET` (usada em `/api/cron/cleanup-tokens`)
- `SEED_ADMIN_PASSWORD`, `SEED_EDITOR_PASSWORD`, `SEED_VIEWER_PASSWORD` (usadas em `prisma/seed.ts`)
**Solução:** Adicionar todas as variáveis ao `.env.example` com comentários.
**Prioridade:** 🟡 MÉDIA

---

### **[ ] DOC-05**: TODOs Pendentes no Código

**Arquivo:** `lib/logger.ts` (linhas 116, 176)
**Problema:** Dois TODOs:

- `// TODO: Enviar para Sentry em producao`
- `// TODO: Em producao, enviar para servico de auditoria`
**Solução:** Criar issues para implementar Sentry e serviço de auditoria, ou remover os TODOs se não são prioridade.
**Prioridade:** 🟢 BAIXA

---

## 📊 Resumo por Prioridade

| Prioridade | Quantidade | IDs |
| ---------- | ---------- | --- |
| 🔴 **CRÍTICA** | 3 | BUG-01, BUG-02, BUG-03 |
| 🔴 **ALTA** | 1 | SEC-01 |
| 🟡 **MÉDIA** | 24 | SEC-02 a SEC-06, ARC-01 a ARC-06, ARC-18, DM-01 a DM-08, A11Y-01, A11Y-02, TEST-01 a TEST-04, DEV-01, DOC-04 |
| 🟢 **BAIXA** | 18 | SEC-07, SEC-08, ARC-07 a ARC-17, ARC-19, DM-09, A11Y-03, A11Y-04, UI-01 a UI-03, TEST-05, TEST-06, DEV-02 a DEV-04, DOC-01 a DOC-03, DOC-05 |

**Total: 46 inconsistências** (3 críticas, 1 alta, 24 médias, 18 baixas)

---

## 🎯 Plano de Ação Sugerido

### Sprint 1 — Urgente (1-2 dias)

1. ⬜ **BUG-01**: Corrigir imports `isValidCPF`/`cleanCPF` → `isValidCpf`/`cleanCpf`
2. ⬜ **BUG-02**: Decidir: integrar Zod ou remover dead code (`schemas.ts`, `api-error.ts`)
3. ⬜ **BUG-03**: Corrigir indentação do `dependabot.yml`
4. ⬜ **SEC-01**: Implementar MFA para ADMIN/EDITOR

### Sprint 2 — Arquitetura (3-5 dias)

1. ⬜ **ARC-01/02/03**: Integrar ou remover código morto (schemas, api-error, cep)
2. ⬜ **ARC-04**: Padronizar formato de respostas API
3. ⬜ **ARC-05/06**: Migrar validação para Zod + catálogo de erros
4. ⬜ **ARC-18**: Criar migração Prisma consolidada

### Sprint 3 — Dark Mode (2-3 dias)

1. ⬜ **DM-01/02**: Fixar flash + integrar variáveis CSS
2. ⬜ **DM-03 a DM-08**: Adicionar dark mode em todos os componentes

### Sprint 4 — Qualidade (2-3 dias)

1. ⬜ **TEST-01 a TEST-04**: Testes de API, componentes, middleware e auth
2. ⬜ **A11Y-01/02**: Ícones SVG e tabela admin
3. ⬜ **ARC-11/12**: Extrair componentes compartilhados

### Sprint 5 — Polish (Contínuo)

1. ⬜ Itens restantes de BAIXA prioridade
2. ⬜ Segurança (SEC-02 a SEC-08)
3. ⬜ Documentação (DOC-01 a DOC-05)

---

> **Nota:** Este documento deve ser atualizado conforme itens são resolvidos. Marcar como ✅ com data e commit de referência.
