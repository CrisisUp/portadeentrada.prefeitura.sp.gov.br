# Contribuindo com o Porta de Entrada

Obrigado por contribuir! Este guia explica como configurar o ambiente e enviar alterações.

## Setup do Ambiente

```bash
# 1. Clonar o repositório
git clone https://github.com/prefeitura-sp/portadeentrada.git
cd portadeentrada

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais locais

# 4. Rodar migrations
npx prisma migrate dev

# 5. Iniciar dev server
npm run dev
```

## Desenvolvimento

### Comandos úteis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Dev server com hot reload |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint check |
| `npm run test` | Rodar testes unitários (Vitest) |
| `npm run test:watch` | Testes em watch mode |
| `npm run test:e2e` | Testes E2E (Playwright) |
| `npm run analyze` | Analisar bundle size |
| `npx prisma studio` | GUI do banco de dados |
| `npx prisma migrate dev` | Criar nova migration |

### Estrutura do Projeto

```
portadeentrada/
├── app/              # Next.js App Router (rotas)
│   ├── api/          # API routes
│   ├── admin/        # Painel administrativo
│   ├── auth/         # Login, register, forgot/reset password
│   ├── cadastro/     # Formulário de inscrição
│   └── busca/        # Busca de programas
├── components/       # React components
│   ├── ui/           # Componentes base (Button, Input, Card, etc.)
│   └── ...           # Componentes de negócio
├── lib/              # Utilitários compartilhados
│   ├── auth.ts       # NextAuth config
│   ├── prisma.ts     # Prisma client singleton
│   ├── logger.ts     # Logger estruturado + audit
│   ├── errors.ts     # Catálogo de erros
│   └── ...           # Validação, schemas, etc.
├── prisma/
│   ├── schema.prisma # Database schema
│   └── migrations/   # SQL migrations
├── tests/            # Testes
│   ├── unit/         # Unit tests
│   └── e2e/          # End-to-end tests
└── types/            # TypeScript type definitions
```

## Convenções de Código

### Commits

Formato: `<tipo>(escopo): descrição`

Tipos:
- `feat` — Nova feature
- `fix` — Bug fix
- `docs` — Documentação
- `style` — Formatação (não afeta lógica)
- `refactor` — Refatoração sem mudança de comportamento
- `test` — Adicionar/corrigir testes
- `chore` — Build, CI, configs

Exemplos:
```
feat(cadastro): adicionar validação de CPF
fix(auth): corrigir redirect após login
docs: atualizar README com variáveis de ambiente
```

### TypeScript

- Usar tipos explícitos para funções públicas
- Preferir `interface` para props de componentes
- Evitar `any` — usar `unknown` quando necessário

### Componentes

- Components em `components/ui/` são base (genéricos, reutilizáveis)
- Components em `components/` são de negócio (específicos do projeto)
- Usar `forwardRef` para componentes de input
- Props obrigatórias primeiro, opcionais depois

### Estilos

- Tailwind CSS para estilos
- Dark mode: usar classes `dark:` do Tailwind
- Fontes: `font-inter` (com `font-bold`, `font-semibold`, `font-medium`, `font-normal` para pesos)

## Enviando Pull Requests

1. Criar branch da feature: `git checkout -b feat/nome-da-feature`
2. Fazer commits mensagens descritivas
3. Rodar lint e testes antes de enviar
4. Abrir PR com descrição clara do que foi feito
5. Aguardar review

### Checklist do PR

- [ ] Código compila sem erros (`npm run build`)
- [ ] Lint passa (`npm run lint`)
- [ ] Testes passam (`npm run test`)
- [ ] Commit messages seguem o formato
- [ ] Mudanças documentadas (se aplicável)

## Reportando Bugs

1. Verificar se já existe issue aberta
2. Criar issue com:
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Stack trace (se aplicável)

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto.
