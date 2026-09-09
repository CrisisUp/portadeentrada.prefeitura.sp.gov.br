# Changelog

Todos os notáveis mudanças neste projeto serão documentadas neste arquivo.

Baseado no [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e o versionamento adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- **SEC-04**: Content Security Policy (CSP) completo em `next.config.mjs`
- **SEC-05**: Sistema de audit logging com 21 eventos tipados e severidade mapeada (`lib/logger.ts`)
- **SEC-06**: Supply chain hardening:
  - GitHub Actions CI (lint, build, test, audit)
  - Trivy vulnerability scanning
  - SBOM generation (CycloneDX)
  - CodeQL analysis
  - Dependabot configuration
  - SECURITY.md com política de report
- **SEC-03**: Refresh token rotation com JWT maxAge 30min + session.maxAge 7d
- **SEC-07**: Fluxo completo de reset de senha:
  - `PasswordResetToken` model no Prisma
  - `lib/password-reset.ts` com token generation/validation
  - API routes: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
  - UI pages: `/auth/forgot-password`, `/auth/reset-password`
  - Link "Esqueci minha senha?" no login
- **DEV-03**: `vercel.json` com build config, security headers, cron jobs
- **DEV-04**: `DEPLOY.md` com documentação completa de deploy
- **DEV-05**: `SECRETS.md` com política de rotação de secrets
- **CONTRIBUTING.md**: Guia de contribuição com setup, convenções, PR template
- **ARC-03**: Error handling padronizado (`lib/api-error.ts` com `ApiError`, `withErrorHandling`, `handleApiError`)
- **ARC-04**: Validação CPF compartilhada (`lib/cpf.ts`)
- **ARC-05**: Validação CEP com ViaCEP (`lib/cep.ts`)
- **ARC-06**: Campo `slug` em ProgramaCultural + `lib/slugify.ts`
- **ARC-07**: Zod schemas com tipos inferidos (`lib/schemas.ts`)
- **ARC-10**: Soft delete via Prisma Client Extension (`lib/prisma.ts`)
- **UI-01**: Cadastro form refatorado com componentes UI (Card, Input, Button)
- **UI-02**: Login/Register refatorados com componentes UI
- **PERF-06**: Cache-Control headers para assets, API e páginas
- **PERF-07**: Bundle analyzer (`@next/bundle-analyzer`)

### Changed
- **ARC-01**: Middlewares unificados em `middleware.ts` único
- **ARC-09**: Índice composto `[programaId, status]` em Inscricao
- **SEC-08**: Session fixation previsto com JWT strategy
- **UI-04**: ThemeToggle hydration mismatch corrigido
- **UI-05**: Loading states nos botões de admin
- **UI-06**: Modal ESC close funcionando
- **UI-07**: Header search com debounce
- **UI-08**: Focus visible nos NavigationCards
- **UI-03**: Skeleton dark mode

### Fixed
- **UI-09**: Footer ano dinâmico
- **PERF-01**: Imagens otimizadas (Next.js Image)

## [0.1.0] - 2026-09-04

### Added
- Projeto inicial com Next.js 15 + Prisma + NextAuth v5
- Rotas: home, busca, cadastro, admin
- API: culturas, inscrições, auth
- Prisma schema: User, ProgramaCultural, Inscricao
- UI base com Tailwind CSS + dark mode
- Rate limiting com Upstash Redis
- Testes E2E com Playwright
- Testes unitários com Vitest
