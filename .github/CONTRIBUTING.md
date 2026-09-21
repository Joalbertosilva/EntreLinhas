# Contribuindo — EntreLinhas (tcc-sistema)

## Antes de codar

1. Leia `docs/` e `session/current.md`
2. Siga as regras em `.cursor/rules/`
3. Monorepo: `pnpm install` na raiz

## Branches

- `main` — estável, integrável
- Features: `feat/nome-curto` ou `fix/nome-curto` (opcional em trabalho solo)

## Commits

Siga **`.github/COMMITS.md`** (Conventional Commits).

Checklist rápido:

- [ ] Mensagem no formato `tipo(escopo): descrição`
- [ ] Apenas arquivos relacionados no stage
- [ ] Sem secrets ou `.env`
- [ ] Typecheck/lint ok quando aplicável

## Pull requests

Use o template em `.github/pull_request_template.md`.

1. Título = mesma linha do commit principal ou resumo do PR
2. Descreva **por quê**, não só **o quê**
3. Test plan com passos reproduzíveis

## Comandos úteis

```bash
pnpm mobile:dev          # Expo Go (tunnel — padrão)
pnpm mobile:dev:lan      # mesma rede Wi‑Fi
pnpm web:dev             # site local :5173
pnpm test                # schemas
git status && git diff   # antes de commitar
```

## Agente Cursor

Ao pedir commit ou push, o agente deve:

1. Ler `.github/COMMITS.md`
2. Seguir a skill `.cursor/skills/github-workflow/SKILL.md`
3. Criar commits separados por área lógica
4. Só dar `git push` quando você pedir explicitamente
