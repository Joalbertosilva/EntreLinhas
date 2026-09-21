# Convenção de commits — EntreLinhas

Usamos **[Conventional Commits](https://www.conventionalcommits.org/)** em português, no imperativo.

## Formato

```
<tipo>(<escopo opcional>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

**Exemplos:**

```
feat(mobile): adicionar modo leitura da tela com botões de áudio
fix(web): corrigir tela em branco por React duplicado no Vite
docs(github): documentar fluxo de commit e pull request
chore(deps): atualizar async-storage para SDK 57
```

## Tipos permitidos

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de bug |
| `docs` | Só documentação |
| `style` | Formatação, sem mudança de lógica |
| `refactor` | Refatoração sem feat/fix |
| `perf` | Melhoria de performance |
| `test` | Testes |
| `build` | Build, dependências, lockfile |
| `ci` | GitHub Actions, pipelines |
| `chore` | Tarefas auxiliares (scripts, configs) |
| `revert` | Reverter commit anterior |

## Escopos comuns neste monorepo

- `mobile` — `apps/mobile`
- `web` — `apps/web`
- `supabase` — migrations, functions, RLS
- `schemas` — `packages/schemas`
- `github` — `.github/`, templates, CI
- `deps` — dependências em geral

## Regras

1. **Imperativo e presente**: "adicionar", não "adicionado" ou "adicionando"
2. **Linha de assunto ≤ 72 caracteres**
3. **Um assunto por commit** — prefira commits pequenos e revisáveis
4. **Corpo** quando a mudança não for óbvia pelo título
5. **Não commitar** `.env`, secrets, `node_modules`, builds locais
6. **Rodapé** `BREAKING CHANGE:` se houver quebra de compatibilidade

## Fluxo recomendado

```bash
# 1. Ver o que mudou
git status
git diff

# 2. Adicionar arquivos relacionados ao commit
git add caminho/dos/arquivos

# 3. Commitar
git commit -m "$(cat <<'EOF'
feat(mobile): descrever a mudança aqui

EOF
)"

# 4. Enviar (quando estiver pronto)
git push origin main
```

## Agrupamento

- **Não misturar** mobile + web + docs no mesmo commit, salvo mudança transversal mínima (ex.: lockfile após deps)
- **Docs de processo** (este arquivo, rules, skills) → commit `docs(github): ...` separado
- **Correção urgente** → `fix(...)` isolado, fácil de reverter

## Referências

- `.github/CONTRIBUTING.md` — fluxo completo
- `.cursor/rules/git-conventional-commits.mdc` — regra para o agente Cursor
- `.cursor/skills/github-workflow/SKILL.md` — skill de commit/push
