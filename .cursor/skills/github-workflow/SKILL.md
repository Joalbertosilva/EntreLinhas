---
name: github-workflow
description: >-
  Commitar e enviar alterações ao GitHub com Conventional Commits em português.
  Use quando o usuário pedir commit, push, salvar no GitHub, ou seguir feat/fix/docs.
disable-model-invocation: true
---

# GitHub workflow — EntreLinhas

## Quando usar

- Usuário pede commit, push, salvar no GitHub, ou PR
- Antes de finalizar trabalho que deve ser versionado

## Leitura obrigatória

1. `.github/COMMITS.md` — tipos, escopos, exemplos
2. `.github/CONTRIBUTING.md` — fluxo geral

## Passos para commit

1. Em paralelo:
   - `git status`
   - `git diff` (staged + unstaged)
   - `git log -5 --oneline` (estilo do repo)
2. Separar mudanças em commits lógicos (não um commit gigante)
3. Verificar: sem `.env`, secrets, artefatos de build
4. `git add` apenas arquivos do commit atual
5. Commit:

```bash
git commit -m "$(cat <<'EOF'
tipo(escopo): descrição imperativa

Corpo opcional se necessário.

EOF
)"
```

6. `git status` após cada commit

## Passos para push (só se pedido)

```bash
git push origin HEAD
```

Para PR: `gh pr create` conforme regra do usuário.

## Agrupamento típico neste monorepo

| Commit | Arquivos |
|--------|----------|
| `docs(github): ...` | `.github/`, `.cursor/rules/git-*`, `.cursor/skills/github-workflow/` |
| `feat(mobile): ...` | features em `apps/mobile/` |
| `fix(web): ...` | `apps/web/` |
| `build(deps): ...` | `package.json`, `pnpm-lock.yaml` quando só deps |

## Proibido

- `git push --force` em `main` sem pedido explícito
- `--no-verify`, `--amend` salvo exceções das user rules
- Atualizar `git config`
