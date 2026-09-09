# Auditoria UX Completa – Porta de Entrada (Prefeitura SP)

> Gerada em 2026-09-07 após varredura de todas as páginas, componentes, APIs e fluxos.

---

## 📊 Resumo Executivo

| Métrica | Status |
|---------|--------|
| **Páginas públicas** | 11 (Home, Busca, 6 programas, Cadastro, Login, Register, Docs) |
| **Páginas admin** | 2 (Dashboard, Inscrições) |
| **Componentes UI** | 12 (Button, Input, Card, Header, Footer, Banner, NavigationCard, ThemeToggle, ToastProvider, SessionProvider, ProgramaPage, Modal) |
| **API routes** | 9 |
| **Score heurístico** | **7.2/10** — Base sólida, gaps claros em onboarding, feedback, acessibilidade avançada e otimização móvel |

---

## 🎯 Top 10 Prioridades (Impacto × Esforço)

| # | Item | Impacto | Esforço | Categoria |
|---|------|---------|---------|-----------|
| 1 | **URL sync nos filtros (Busca + Admin)** | Alto | Baixo | UX Core |
| 2 | **Skeleton loaders em vez de spinners genéricos** | Alto | Baixo | Perceived Performance |
| 3 | **Autocomplete real no Header search** | Alto | Médio | Discovery |
| 4 | **Focus management no modal de detalhes (Admin)** | Alto | Baixo | A11y Crítico |
| 5 | **Auto-save draft no formulário de inscrição** | Alto | Médio | Form UX |
| 6 | **Empty states ilustrados + call-to-action** | Médio | Baixo | Content Design |
| 7 | **Validação inline + máscaras (CPF, telefone, CEP)** | Médio | Médio | Form UX |
| 8 | **Otimistic UI no bulk update (Admin)** | Médio | Médio | Feedback |
| 9 | **Skip link visível + landmark regions** | Médio | Baixo | A11y |
| 10 | **PWA: manifest + service worker offline** | Baixo | Médio | Engajamento |

---

## 🔍 Detalhamento por Área

### 1. Fluxo Público – Inscrição (`/cadastro`)

| Problema | Evidência | Solução |
|----------|-----------|---------|
| **Sem auto-save draft** | Usuário perde tudo se fechar aba / cair conexão | `localStorage` + `useEffect` debounced + banner "Rascunho salvo" |
| **Validação só no blur/submit** | `handleBlur` + `validateForm()` apenas | Validação inline ao digitar (debounced 300ms) + máscaras CPF/telefone/CEP |
| **Sem progress indicator** | Formulário longo (4 sections) sem stepper | Stepper visual (1. Programa → 2. Dados → 3. Endereço → 4. Complementares) |
| **CPF sem formatação automática** | `maxLength={14}` mas sem máscara | Input com máscara `999.999.999-99` (lib leve: `cleave.js` ou custom) |
| **CEP sem autocomplete de endereço** | Campo CEP isolado | Integração ViaCEP / Brasil API no `onBlur` do CEP → preenche rua/cidade/estado |
| **Erro de duplicate CPF só no submit** | API retorna 409 só no POST | Check assíncrono no `onBlur` do CPF (debounced) |
| **Botão "Enviar" disabled sem feedback** | `disabled={loading || !selectedProgramaId}` | Tooltip explicando "Selecione um programa primeiro" |
| **Success toast genérico** | `SUCCESS_MESSAGES.INSCRICAO` | Toast com link "Ver minha inscrição" → `/minhas-inscricoes` (nova rota) |
| **Sem confirmação visual de seleção** | Card border muda mas sutil | Checkmark overlay + aria-pressed no botão-carta |

### 2. Busca (`/busca`) – Já está bem!

| Ponto forte | Gap |
|-------------|-----|
| ✅ Server-side pagination com URL sync | ❌ Sem **skeleton cards** durante carregamento |
| ✅ Filtros acessíveis (label + select) | ❌ Sem **faceted search** (contagem por categoria/status) |
| ✅ ARIA na paginação | ❌ Enter no input não submete (precisa clicar "Filtrar") |
| ✅ Estados vazios ilustrados | ❌ Sem "Salvar busca" / alertas por email |

### 3. Admin – Inscrições (`/admin/inscricoes`)

| Problema | Evidência | Solução |
|----------|-----------|---------|
| **Modal sem focus trap** | `onKeyDown` só fecha no Escape | `focus-trap-react` ou implementação nativa (focus first/last, Tab cycle) |
| **Sem loading inline no bulk action** | Spinner só nos botões | Row-level loading + otimistic UI (atualiza status local, rollback se erro) |
| **URL não sincroniza filtros** | Filtros em state local | `useSearchParams` + `router.push` com `?search=&status=&page=` |
| **Tabela não responsiva** | `overflow-x-auto` em mobile | Card layout em < 768px (stack horizontal → vertical) |
| **Export CSV sem loading** | `exportCSV()` síncrono | `setExporting(true)` + blob streaming para datasets grandes |
| **Sem atalhos de teclado** | — | `a` = aprovar selecionadas, `r` = rejeitar, `/` = foco busca, `Esc` = limpar seleção |
| **Modal fecha ao clicar fora mas não ao clicar em link interno** | `onClick={(e) => e.target === e.currentTarget}` | OK, mas links no modal (`portfolioUrl`) não fecham — intencional? |
| **Sem "Ver detalhes" acessível por teclado** | `<button>` OK, mas sem `aria-describedby` | Adicionar `aria-describedby` apontando para região de detalhes |

### 4. Header & Navegação Global

| Problema | Evidência | Solução |
|----------|-----------|---------|
| **Search autocomplete comentado** | `useDebounce` hook existe mas não usado | Implementar `/api/search/suggest?q=` + dropdown com resultados (programas, categorias) |
| **Mobile menu não existe** | Header fixo, links somem em mobile | Drawer lateral (Sheet) com animação, foco no primeiro link ao abrir |
| **Skip link só no layout** | `<a href="#main-content" className="sr-only focus:not-sr-only">` | ✅ Existe! Mas testar se foco visível no Header fixo |
| **ThemeToggle sem persistência cross-tab** | `localStorage` apenas | `storage` event listener para sync entre abas |
| **Logo sem `width/height` fixos no Header** | `width={198} height={79}` OK | Verificar CLS (Cumulative Layout Shift) |

### 5. Home & Landing Pages

| Problema | Evidência | Solução |
|----------|-----------|---------|
| **Banner carrossel auto-play** | `SLIDE_INTERVAL = 5000`, pausa no hover/focus | ✅ WCAG 2.2.2 OK, mas adicionar botão "Pausar/Play" visível |
| **NavigationCard sem texto alternativo rico** | `alt="Fomento à Cultura"` apenas | `alt="Card Fomento à Cultura: programas de financiamento para artistas e coletivos"` |
| **Sem hero com CTA principal** | Home vai direto para cards | Hero section: headline + subhead + "Inscreva-se agora" → `/cadastro` |
| **Imagens sem `priority` acima da dobra** | Banner usa `priority={index === 0}` ✅ | NavigationCards sem `priority` — OK (abaixo da dobra) |
| **Sem seção "Programas em destaque" dinâmica** | Cards estáticos no `CARDS` array | Query `prisma.programaCultural.findMany({ where: { status: 'aberto' }, take: 6 })` |

### 6. Autenticação (Login / Register / Forgot / Reset)

| Problema | Evidência | Solução |
|----------|-----------|---------|
| **Login sem "Lembrar-me"** | Apenas email/senha | Checkbox "Manter conectado" → `maxAge` no JWT |
| **Register sem validação de senha** | `minLength={6}` apenas | Strength meter + requisitos visuais (maiúscula, número, especial) |
| **Forgot password sem feedback de rate limit** | API não expõe retry-after | Toast "Email enviado. Se não receber em 5min, tente novamente." |
| **Reset password sem verificação de token expirado** | Página assume token válido | Verificar token no `useEffect` inicial, redirect se inválido |
| **Sem social login (Gov.br)** | Apenas credentials | Integração Gov.br (OIDC) — prioridade alta para portal gov |

### 7. Acessibilidade (WCAG 2.1 AA)

| Checklist | Status | Ação |
|-----------|--------|------|
| Skip link | ✅ | Testar foco visível |
| Landmarks (`main`, `nav`, `header`, `footer`) | ✅ | `role="main"` no layout |
| Heading hierarchy (h1→h2→h3) | ⚠️ Parcial | Verificar: Home tem h1 no Banner? ProgramaPage tem h1 |
| Color contrast (dark mode) | ❓ Não testado | Auditar `dark:` classes no Tailwind |
| Focus visible em todos interativos | ⚠️ Parcial | Button/Input têm `focus:ring-2` mas links no Banner não |
| ARIA labels em ícones | ✅ Maioria | Verificar `ThemeToggle`, `Header` search button |
| Live region para toasts | ✅ `ToastProvider` (sonner) | Confirmar `aria-live="polite"` |
| Form labels associados | ✅ `htmlFor` + `id` | Input component faz isso |
| Error announcements | ✅ `role="alert"` no Input | Confirmar `aria-invalid` + `aria-describedby` |
| Modal focus trap | ❌ **Falta** | **Crítico** no AdminInscricoesPage |
| Carousel pausável | ✅ Pausa hover/focus | Adicionar botão pause visível |
| Language declaration | ✅ `<html lang="pt-BR">` | |

### 8. Performance & Core Web Vitals

| Métrica | Atual | Meta | Ação |
|---------|-------|------|------|
| **LCP** | Banner `priority` ✅ | < 2.5s | Otimizar imagens (WebP/AVIF), `sizes` corretos |
| **CLS** | Imagens com `fill` + `sizes` ✅ | < 0.1 | Verificar fonts (preload `Abril_Fatface`, `Oswald`, `Open_Sans`) |
| **INP** | Client components hidratados | < 200ms | `useTransition` em filtros pesados, `React.memo` em rows |
| **Bundle** | Não analisado | < 170KB JS | `next-bundle-analyzer` + dynamic imports (Modal, Chart) |
| **ISR/SSG** | Busca = SSR, ProgramaPage = SSR | ISR 60s | `export const revalidate = 60` em páginas de programa |
| **Image optimization** | Next/Image ✅ | — | Verificar `loader` custom para CDN próprio |

### 9. Mobile & Touch

| Problema | Evidência | Solução |
|----------|-----------|---------|
| **Touch targets < 44px** | Inputs `py-3` (12px) + border = ~38px | Aumentar `py-4` (16px) → 44px mínimo |
| **Hover-only states** | `hover:opacity-90` no NavigationCard | `active:` states + `touch-action: manipulation` |
| **Tabela admin não usável mobile** | `overflow-x-auto` | Card layout responsivo (ver seção 3) |
| **Modal não full-screen mobile** | `max-w-2xl` | `max-w-full sm:max-w-2xl` + `rounded-t-2xl sm:rounded-2xl` |
| **Banner altura fixa `h-[85vh]`** | Pode cortar conteúdo em mobile curto | `min-h-[85vh]` + `max-h-[90vh]` |

### 10. Content Design & Microcopy

| Local | Atual | Sugestão |
|-------|-------|----------|
| Empty state Busca | "Tente ajustar os filtros" | "Nenhum programa encontrado para **'termo'**. [Limpar filtros] [Ver todos]" |
| Empty state Admin | "Ajuste os filtros ou aguarde" | "Nenhuma inscrição pendente. [Ver aprovadas] [Ver rejeitadas]" |
| Loading genérico | "Carregando..." | "Buscando inscrições..." / "Carregando programas abertos..." |
| Erro 404 | Não verificado | Página 404 amigável + busca inline |
| Erro 500 | `error.tsx` genérico | `error.tsx` com "Tente novamente" + link suporte |
| Toast success | "Inscrição realizada" | "Inscrição no **'Programa X'** enviada! Número: **#12345**" |

### 11. Internacionalização (i18n) — Futuro

| Item | Status |
|------|--------|
| `next-intl` ou `next-i18next` | Não configurado |
| Strings hardcoded em PT-BR | 100% |
| Datas `toLocaleDateString('pt-BR')` | Hardcoded locale |
| Preparação: extrair para `messages/pt-BR.json` | Recomendado se expansão prevista |

### 12. Observabilidade & Erros

| Gap | Solução |
|-----|---------|
| **Error Boundary** | Não existe — adicionar `app/error.tsx` por rota + `app/global-error.tsx` |
| **Client-side error logging** | `logger` só server — adicionar Sentry/LogRocket no client |
| **Web Vitals reporting** | Não implementado — `next/web-vitals` + enviar para Analytics |
| **API error codes consistentes** | Parcial — padronizar `{ error, code, details? }` |

---

## 🛠 Plano de Ação Sugerido (3 Sprints)

### Sprint 1 — "Quick Wins" (1 semana)
- [ ] URL sync filtros (Busca + Admin)
- [ ] Skeleton loaders (Busca, Admin, Cadastro)
- [ ] Focus trap no modal Admin
- [ ] Enter submete busca no Header + Busca
- [ ] Empty states com CTA
- [ ] Touch targets 44px (Input, Button)
- [ ] Botão pause visível no Banner

### Sprint 2 — "Form & Feedback" (2 semanas)
- [ ] Auto-save draft no Cadastro
- [ ] Validação inline + máscaras (CPF, telefone, CEP)
- [ ] CEP autocomplete (ViaCEP)
- [ ] Otimistic UI no bulk update Admin
- [ ] Atalhos teclado Admin (`a`, `r`, `/`, `Esc`)
- [ ] Tabela responsiva mobile (cards)
- [ ] Progress stepper no Cadastro

### Sprint 3 — "Polish & Scale" (2 semanas)
- [ ] Search autocomplete real (Header)
- [ ] Mobile drawer menu
- [ ] PWA manifest + SW offline
- [ ] ISR nas páginas de programa
- [ ] Bundle analysis + dynamic imports
- [ ] Gov.br login (OIDC)
- [ ] Error Boundaries + Sentry client
- [ ] Dark mode contrast audit

---

## 📁 Arquivos-chave para Intervenção

```
portadeentrada/
├── app/
│   ├── cadastro/page.tsx              # Auto-save, stepper, máscaras, CEP autocomplete
│   ├── busca/page.tsx                 # Skeleton, faceted counts, Enter submit
│   ├── admin/inscricoes/page.tsx      # URL sync, focus trap, otimistic UI, mobile cards, shortcuts
│   ├── auth/login/page.tsx            # Remember me, Gov.br button
│   ├── auth/register/page.tsx         # Password strength
│   ├── layout.tsx                     # Error Boundary, skip link test
│   ├── error.tsx                      # Friendly error page
│   └── globals.css                    # Focus visible, touch targets
├── components/
│   ├── Header.tsx                     # Autocomplete, mobile drawer, theme sync
│   ├── Banner.tsx                     # Pause button visível
│   ├── NavigationCard.tsx             # Alt text rico
│   ├── ui/
│   │   ├── Input.tsx                  # Máscaras, validação inline, aria
│   │   ├── Button.tsx                 # Touch target, loading states
│   │   ├── Card.tsx                   # —
│   │   └── ThemeToggle.tsx            # Cross-tab sync
│   └── ProgramaPage.tsx               # ISR revalidate, hero CTA
├── lib/
│   ├── cpf.ts                         # Máscara + validação
│   ├── phone.ts                       # Máscara
│   └── cep.ts                         # ViaCEP integration (novo)
└── types/
    └── domain.ts                      # —
```

---

## 🎨 Design Tokens Check (Tailwind)

| Token | Uso | Consistência |
|-------|-----|--------------|
| `primary` / `primary-hover` | ✅ Botões, links, badges | Verificar dark mode |
| `dark` (texto) | ✅ Headings | — |
| `gray-50` → `gray-900` | ✅ Superfícies | — |
| Status colors (green/yellow/red) | ✅ Badges | Semantic tokens? |
| Spacing scale | ✅ `p-6`, `gap-4`, `mb-4` | — |
| Border radius | ✅ `rounded-lg`, `rounded-xl` | — |
| Shadows | ✅ `shadow-sm`, `shadow-lg` | — |
| Fonts | ✅ Variables CSS | Preload no `<head>` |

---

## ✅ Próximos Passos Imediatos

1. **Criar issues/github projects** para cada item do Sprint 1
2. **Pair programming** nas mudanças de `Input` (máscaras) + `Cadastro` (auto-save)
3. **Teste de usabilidade** com 3-5 usuários reais no fluxo de inscrição
4. **Lighthouse CI** no PR pipeline (budget: LCP < 2.5s, CLS < 0.1, TBT < 200ms)

---

> **Nota**: Esta auditoria foca em UX/UI, acessibilidade e perceived performance. Questões de segurança, arquitetura e testes já cobertas no `INCONSISTENCIAS-PARA-RESOLVER.md`.