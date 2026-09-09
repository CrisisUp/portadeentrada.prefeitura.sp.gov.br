# Política de Segurança — Porta de Entrada

A Prefeitura de São Paulo leva a segurança deste projeto a sério. Agradecemos esforços responsáveis para proteger nossos usuários.

## Como Reportar

**NÃO abra issues públicas para vulnerabilidades de segurança.**

Envie um email para a equipe de segurança com:

- Descrição da vulnerabilidade
- Passos para reproduzir
- Impacto potencial
- Sugestão de correção (se tiver)

## Escopo

| Dentro do escopo | Fora do escopo |
| --- | --- |
| XSS, CSRF, SQL Injection | Denial of Service |
| Authentication/Authorization flaws | Social engineering |
| Sensitive data exposure | Vulnerabilidades em dependências de terceiros não relacionadas |
| Rate limiting bypass | Reports automáticos de scanner sem contexto |
| IDOR (Insecure Direct Object Reference) | |

## Processo

1. **Recebemos** o report em até 24h
2. **Confirmamos** o recebimento e classificamos a severidade
3. **Trabalhamos** na correção (timeline baseada na severidade)
4. **Notificamos** o reporter sobre a correção
5. **Publicamos** o fix e reconhecemos o reporter (com permissão)

## Severidade e Timeline

| Severidade | Exemplo | Timeline de Fix |
| --- | --- | --- |
| **Crítica** | RCE, SQL injection com dados | 24-48h |
| **Alta** | XSS stored, auth bypass | 3-5 dias |
| **Média** | CSRF, information disclosure | 1-2 semanas |
| **Baixa** | Missing headers, minor issues | Próximo sprint |

## Reconhecimento

Reporters qualificados receberão:

- Menção no CHANGELOG.md
- Reconhecimento no README.md (com permissão)
- Credite no GitHub Security Advisories (se aplicável)

## Busca de Vulnerabilidades

Não autorizamos testes de penetração não solicitados. Por favor, entre em contato primeiro para combinarmos um escopo adequado.

## GPG Key

Para comunicação segura, utilize o GPG key da equipe (se disponível).

---

Obrigado por ajudar a manter a Porta de Entrada segura para todos os paulistanos.
