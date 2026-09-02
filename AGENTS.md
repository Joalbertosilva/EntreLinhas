# AGENTS.md — tcc-sistema

Orientação geral para agentes de IA que atuam neste repositório.

## Projeto

**tcc-sistema** (nome provisório) é uma plataforma de estímulo à leitura, reflexão e produção textual voltada a adolescentes privados de liberdade. O MVP inclui:

- **App mobile** (`apps/mobile`) — React Native + Expo
- **Website e gerenciador** (`apps/web`) — React + Vite (uma única aplicação web)
- **Backend** (`supabase/`) — Supabase + PostgreSQL

## Regras obrigatórias

1. **TypeScript em todo o projeto.** Não introduzir JavaScript como stack separada.
2. **Consultar a documentação em `docs/`** antes de implementar qualquer funcionalidade.
3. **Seguir a stack definida** em `docs/architecture.md`. Não substituir bibliotecas essenciais sem justificativa documentada.
4. **Respeitar o escopo do MVP** em `docs/mvp-scope.md`. Não implementar funcionalidades fora do escopo sem solicitação explícita.
5. **Segurança primeiro:** RLS no PostgreSQL, validação no servidor, LGPD para dados de adolescentes (`docs/security.md`).
6. **Monorepo pnpm workspaces.** Pacotes compartilhados em `packages/`.
7. **Autenticação:** Nome de Usuário + Senha na interface; UUID internamente (`docs/security.md`).
8. **Sem cadastro público.** Criação de usuários somente pelo Administrador via Edge Function.
9. **Soft delete:** preferir `status = inativo` em vez de exclusão definitiva quando houver histórico.
10. **Formulários:** React Hook Form + Zod. Não usar Formik + Yup.
11. **Ambiente Supabase:** modo atual é **nuvem** (`docs/supabase-nuvem.md`) — site local com `pnpm web:dev`. Docker local é opcional (`docs/docker.md`). **Nunca** `db:reset` / `supabase db reset --linked` no projeto nuvem.
12. **Design UI:** seguir **obrigatoriamente** `docs/design-system.md` — interface natural, cores CESMAC, **proibido** aspecto genérico de template/IA em qualquer tela (gerenciador, plataforma, mobile).

## Estrutura do monorepo

```
tcc-sistema/
├── apps/mobile/          # App React Native + Expo
├── apps/web/             # Website + gerenciador (React + Vite)
├── packages/types/       # Tipos TypeScript compartilhados
├── packages/schemas/     # Schemas Zod compartilhados
├── packages/config/      # Configurações compartilhadas (ESLint, TS, etc.)
├── supabase/migrations/  # Migrations PostgreSQL
├── supabase/functions/   # Edge Functions
├── docs/                 # Documentação funcional e técnica
├── session/              # Estado atual do projeto (nunca perder contexto)
├── skills/               # Procedimentos reutilizáveis para agentes
└── .cursor/rules/        # Regras específicas do Cursor
```

## Perfis de usuário

| Perfil | Acesso principal |
|--------|------------------|
| Aluno | App e web: conteúdos, interações, leitura, produções |
| Professor | Web (gerenciador): conteúdos, temas, acompanhamento de alunos |
| Administrador | Web (gerenciador): usuários, visão geral, supervisão |

## Fluxo de trabalho recomendado

1. Ler `session/current.md` — estado atual e próximo passo
2. Ler o requisito funcional em `docs/requirements.md`
2. Verificar permissões em `docs/permissions.md`
3. Consultar entidades em `docs/database.md`
4. Implementar com RLS e validação Zod
5. Seguir regras de `.cursor/rules/` para a camada afetada
6. Usar skills em `skills/` para tarefas recorrentes
7. **Atualizar `session/current.md`** ao concluir etapas ou tomar decisões

## Prioridades de implementação (MVP)

Ordem adotada: **Backend → Web (validar) → Mobile** (ver `session/current.md`)

1. Backend: Supabase nuvem, migrations, auth, RLS — ✅
2. Web: gerenciador + área aluno — implementado; **validar manualmente** antes de avançar
3. Lacunas web: busca, testes, a11y (conforme validação)
4. Mobile: paridade aluno — **só após critério “web validado”** (Passo 7)

## O que NÃO fazer

- Cadastro público de usuários
- Diagnósticos psicológicos automáticos a partir de interações
- Ranking, medalhas ou desafios diários (fora do MVP)
- Exclusão definitiva de registros com histórico
- Expor dados pessoais em erros ou logs públicos
- Bypass de RLS no client

## Referências

- `docs/requirements.md` — RF001 a RF015, RNF, RS
- `docs/architecture.md` — stack e divisão de aplicações
- `docs/database.md` — entidades e relações
- `docs/permissions.md` — matriz de permissões
- `docs/security.md` — RLS, auth, LGPD
- `docs/mvp-scope.md` — escopo da primeira versão
- `docs/user-flows.md` — fluxos principais
- `docs/design-system.md` — **obrigatório** — cores CESMAC, tom de voz, anti-“IA”
- `docs/gerenciador-checklist.md` — checklist gerenciador
- `docs/supabase-nuvem.md` — nuvem, preservar dados, o que nunca rodar
- `docs/roteiro-validacao-aluno.md` — validação manual aluno
- `session/current.md` — **passo a passo atual** (sempre ler primeiro)
- `docs/docker.md` — Docker / Supabase local (opcional)
