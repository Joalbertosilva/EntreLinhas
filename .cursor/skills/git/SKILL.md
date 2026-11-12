---
name: git
description: >-
  Comando /git — commitar, enviar branch de feature e integrar em develop.
  Use quando o usuário escrever /git, pedir subir no git com fluxo develop,
  ou integrar feature em develop após o trabalho.
disable-model-invocation: true
---

# /git — publicar feature em develop

Fluxo **obrigatório** quando o usuário invoca **`/git`** (ou pede explicitamente o fluxo develop).

**Não** integrar em `main`. O usuário abre PR **develop → main** quando quiser.

## Pré-checks

1. Repositório limpo de secrets: nunca `.env`, credenciais, `node_modules`, builds locais.
2. Branch atual:
   - **`main`**: parar e criar branch de feature a partir de `develop` (regra `.cursor/rules/git-branch-workflow.mdc`); não commitar em `main`.
   - **`develop`**: se há mudanças, criar branch retroativamente (`git checkout -b tipo/escopo-slug`) antes de commitar.
   - **Feature** (`feat/...`, `fix/...`, etc.): seguir abaixo.

## Passo 1 — Inspecionar

Em paralelo:

```bash
git branch --show-current
git status
git diff
git diff --staged
git log -5 --oneline
```

Ler `.github/COMMITS.md`. Agrupar em **um ou mais commits** lógicos (não um commit gigante).

## Passo 2 — Commitar (se houver mudanças)

Para cada commit:

```bash
git add <arquivos do grupo>
git commit -m "$(cat <<'EOF'
tipo(escopo): descrição imperativa

EOF
)"
git status
```

Rodar lint/typecheck **só se** já for prática do escopo tocado e rápido; não bloquear `/git` por tarefa não relacionada.

## Passo 3 — Push da feature

```bash
FEATURE="$(git branch --show-current)"
git push -u origin "$FEATURE"
```

## Passo 4 — Integrar em develop

```bash
git fetch origin develop
git checkout develop
git pull origin develop
git merge --no-ff "$FEATURE" -m "$(cat <<EOF
merge($FEATURE): integrar alterações da branch de feature
EOF
)"
git push origin develop
```

- Se `develop` ainda não existir no remoto: `git push -u origin develop` após o primeiro merge local.
- Conflitos: resolver, `git add`, `git commit` (merge), depois `git push origin develop`.

## Passo 5 — Encerramento

```bash
git checkout develop
git status
```

Informar ao usuário:

- Branch de feature e commit(s) enviados
- `develop` atualizado no remoto
- Próximo passo manual: PR **develop → main** quando for release

Opcional (só se o usuário pedir): apagar branch local/remota da feature após merge.

## Proibido

- `git push --force` em `main` ou `develop` sem pedido explícito
- `--no-verify`, `commit --amend` salvo exceções das user rules
- Alterar `git config`
- Push direto para `main` neste fluxo

## Relacionado

- Branches e nomes: `.cursor/rules/git-branch-workflow.mdc`
- Commit sem integrar develop: `.cursor/skills/github-workflow/SKILL.md`
