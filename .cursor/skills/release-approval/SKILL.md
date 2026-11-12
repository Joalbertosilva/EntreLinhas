---
name: release-approval
description: >-
  Auditoria objetiva antes de integrar develop em main. Calcula pontuação
  de 0–100; com ≥98 pontos o lote está apto para merge em main. Use com
  /aprovar, "aprovação para main", "posso mergear na main?", release, ou
  quando o usuário pedir /git para main após validação.
disable-model-invocation: true
---

# Aprovação para `main` (meta ≥ 98%)

`develop` recebe integração diária (`/git`). **`main`** é release estável — só entra o que passa nesta auditoria.

## Quando usar

1. Usuário quer **merge `develop` → `main`** (direto, PR ou após `/git`).
2. Usuário invoca **`/aprovar`** ou pede "está apto para main?".
3. Agente ia fazer push/merge em **`main`** sem o usuário ter pedido só `/git`.

**Não** substitui revisão humana em dados sensíveis (LGPD, RLS, migrations destrutivas). Em dúvida, marque **0** no critério e bloqueie.

## Escala (total 100 pontos)

| # | Critério | Pts | Como verificar |
|---|----------|-----|----------------|
| 1 | Sem secrets no diff (`git diff`, `.env`, keys) | 15 | `git status`; nada sensível staged |
| 2 | Escopo MVP (`docs/mvp-scope.md`) — sem feature fora do escopo não pedida | 10 | Ler diff vs escopo |
| 3 | TypeScript / build do escopo tocado | 15 | `pnpm --filter web exec tsc --noEmit` e/ou mobile se mexeu |
| 4 | Migrations novas: SQL aditivo, sem drops destrutivos; nuvem alinhada se aplicável | 10 | Ler `supabase/migrations/`; `migration list --linked` se backend |
| 5 | RLS / segurança: sem service role no client; padrões `docs/security.md` | 10 | Grep + leitura das policies novas |
| 6 | Formulários: RHF + Zod se houve form novo/alterado | 5 | Não usar Yup/Formik |
| 7 | UI: `docs/design-system.md` nas telas alteradas | 10 | Revisão visual lógica do diff |
| 8 | Commits: conventional commits (`/.github/COMMITS.md`) | 5 | `git log develop..HEAD` ou commits do lote |
| 9 | `session/current.md` ou docs atualizados se decisão/fluxo mudou | 5 | Só se a mudança exigir |
| 10 | Testes/schemas: `pnpm test` ou `test:schemas` se mexeu em `packages/schemas` | 10 | Rodar quando relevante |
| 11 | Nenhum bloqueador conhecido aberto (bug crítico citado na conversa) | 5 | Histórico da sessão |

**Pontuação** = soma dos critérios atendidos (critério não verificado ou falhou = **0** naquele item).

**Limiar:** **≥ 98** → **APTO para merge em `main`**.  
**&lt; 98** → **NÃO APTO** — listar itens com 0 e o que corrigir.

Critérios **não aplicáveis** (ex.: sem migration no lote): conceda os pontos **somente** se o diff confirmar que não há trabalho naquele eixo; caso contrário, 0.

## Passo a passo do agente

1. `git fetch origin develop main`
2. Definir o **lote**: commits em `develop` que ainda não estão em `main` (`git log main..develop --oneline`) ou a branch de feature se o merge ainda não ocorreu.
3. `git diff main...develop --stat` (ou `main...HEAD` na feature).
4. Percorrir a tabela acima; executar comandos objetivos (tsc, test, migration list).
5. Emitir o **relatório** (template abaixo).
6. Se **≥ 98** e o usuário pediu merge: pode prosseguir com merge `develop` → `main` e push (como fluxo combinado com `/git` + main explícito).
7. Se **&lt; 98**: **não** mergear em `main`; corrigir ou pedir decisão do usuário.

## Template de relatório

```markdown
## Aprovação release — develop → main

**Pontuação:** XX / 100 — **APTO** | **NÃO APTO** (meta ≥ 98)

| Critério | Pts poss. | Obtidos | Nota |
|----------|-----------|---------|------|
| … | … | … | … |

### Bloqueadores (se NÃO APTO)
- …

### Recomendação
- [ ] Merge em `main` autorizado
- [ ] Aguardar correções
```

## Relação com `/git`

| Comando | Destino |
|---------|---------|
| `/git` sozinho | feature → `develop` (skill `git/SKILL.md`) |
| `/git` + "na main também" | `/git` **depois** desta skill; só merge `main` se **≥ 98** ou usuário **aceitar risco** por escrito na conversa |

## Proibido

- Dar **100** sem rodar verificações do escopo tocado.
- Merge em `main` com **&lt; 98** sem o usuário assumir explicitamente o risco.
- `db reset --linked` ou migrations destrutivas como "correção" antes da release.
