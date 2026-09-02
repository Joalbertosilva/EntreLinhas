# EntreLinhas · tcc-sistema

Plataforma de estímulo à leitura, reflexão e produção textual — **MVP do TCC (CESMAC)**.

> Nome provisório (*EntreLinhas*). Monorepo TypeScript com backend Supabase, website para alunos e staff, e app mobile planejado para a Fase 3.

---

## Sumário

- [O que é](#o-que-é)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e primeiro uso](#instalação-e-primeiro-uso)
- [Comandos do dia a dia](#comandos-do-dia-a-dia)
- [Rotas principais](#rotas-principais)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Ordem de entrega](#ordem-de-entrega)
- [Status do projeto](#status-do-projeto)
- [Documentação](#documentação)
- [Segurança e LGPD](#segurança-e-lgpd)
- [Publicar no GitHub](#publicar-no-github)

---

## O que é

Sistema educacional com **três camadas** no mesmo repositório:

| Camada | Pasta | Público | Tecnologia |
|--------|-------|---------|------------|
| **Website + gerenciador** | `apps/web` | Alunos (`/app`) e staff (`/admin`) | React 19, Vite, TanStack Router, Tailwind |
| **App mobile** | `apps/mobile` | Alunos (Android/iOS) — *Fase 3* | React Native, Expo, NativeWind |
| **Backend** | `supabase/` | Todas as plataformas | PostgreSQL, Auth, Storage, RLS, Edge Functions |

O backend **não** é um servidor customizado: usamos **Supabase** (PostgreSQL + Auth + Storage), com regras de acesso no banco via **Row Level Security (RLS)**.

---

## Funcionalidades

### Gerenciador web (`/admin`) — staff

- Login e controle de sessão por perfil (administrador, professor)
- CRUD de conteúdos (livros, crônicas, poemas, músicas) com capa, texto e reflexão orientada
- Gestão de usuários (criação via Edge Function — sem cadastro público)
- Recuperação de senha (fluxo aluno → staff → redefinição)
- Acompanhamento de alunos e auditoria de ações

### Plataforma do aluno (`/app`) — web

- Home com vitrines por tipo de conteúdo e destaques
- Detalhe do conteúdo: leitura, materiais complementares, reflexão orientada e comentários
- Leitor paginado para livros (uma seção por página, layout imersivo)
- Curtidas, progresso de leitura (em andamento / concluída)
- Perfil e alteração de senha

### App mobile (`apps/mobile`) — planejado

- Paridade com a área `/app` da web (login, vitrines, leitura, reflexão, comentários, perfil)
- Mesmo backend Supabase; pacotes `@tcc-sistema/types` e `@tcc-sistema/schemas` compartilhados
- Gerenciador permanece **somente na web**

Detalhes de stack e mobile: [`docs/stack-e-ferramentas.md`](./docs/stack-e-ferramentas.md)

---

## Arquitetura

```
┌─────────────────────┐     ┌─────────────────────┐
│   apps/mobile       │     │      apps/web        │
│   (Fase 3)          │     │   /app + /admin      │
└──────────┬──────────┘     └──────────┬───────────┘
           │                           │
           │   Supabase JS · TanStack Query · types/schemas
           └─────────────┬─────────────┘
                         │ HTTPS
                         ▼
              ┌──────────────────────┐
              │  Supabase            │
              │  PostgreSQL · Auth     │
              │  Storage · RLS         │
              │  Edge Functions        │
              └──────────────────────┘
```

Mais detalhes: [`docs/architecture.md`](./docs/architecture.md)

---

## Stack tecnológica

| Área | Tecnologias |
|------|-------------|
| **Linguagem** | TypeScript (web, mobile, Edge Functions) + SQL (migrations) |
| **Frontend web** | React 19, Vite 8, TanStack Router, TanStack Query, Tailwind CSS 4 |
| **Formulários** | React Hook Form + Zod (`@tcc-sistema/schemas`) |
| **Backend** | Supabase (PostgREST, Auth JWT, Storage, Edge Functions Deno) |
| **Mobile (previsto)** | React Native, Expo, Expo Router, NativeWind |
| **Monorepo** | pnpm workspaces |
| **Dev local** | Docker (Supabase CLI), Node.js ≥ 20 |
| **Testes** | Vitest (schemas); RTL / RNTL (planejado) |

---

## Estrutura do repositório

```
tcc-sistema/
├── apps/
│   └── web/                 # Website aluno + gerenciador
├── packages/
│   ├── types/               # Tipos TypeScript compartilhados
│   └── schemas/             # Validação Zod compartilhada
├── supabase/
│   ├── migrations/          # SQL versionado (schema + RLS)
│   └── functions/           # Edge Functions (create-user, senha…)
├── docs/                    # Documentação técnica e de produto
├── scripts/                 # Seeds, utilitários
├── session/                 # Estado atual do desenvolvimento
├── package.json             # Scripts raiz (db:*, web:*)
├── pnpm-workspace.yaml
└── docker-compose.yml       # Ferramentas auxiliares (Adminer)
```

---

## Pré-requisitos

Instale antes de clonar:

| Ferramenta | Versão mínima | Para quê |
|------------|---------------|----------|
| [Node.js](https://nodejs.org/) | 20+ | Apps frontend e scripts |
| [pnpm](https://pnpm.io/) | 9+ (projeto usa 11.x) | Monorepo |
| [Docker](https://docs.docker.com/) + Compose | Atual | Supabase **local** (opcional) |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | Atual | Migrations, functions, `db:start` |

Verificar:

```bash
node -v          # v20+
pnpm -v
docker info      # daemon rodando
supabase --version
```

---

## Instalação e primeiro uso

**Modo atual (Supabase nuvem + site local):**

```bash
git clone <url-do-repositorio>
cd tcc-sistema
pnpm install
cp .env.example apps/web/.env.local   # preencher com credenciais da nuvem
pnpm web:dev                          # → http://localhost:5173
```

Ver [`docs/supabase-nuvem.md`](./docs/supabase-nuvem.md) — **não** rodar `db:reset` na nuvem.

<details>
<summary>Modo Docker local (opcional — banco separado)</summary>

```bash
pnpm db:start
pnpm db:migrate
cp .env.example apps/web/.env.local   # chaves de pnpm db:status
pnpm db:seed-admin
pnpm functions:serve   # terminal separado
pnpm web:dev
```

</details>

**Login de desenvolvimento (após seed):**

| Perfil | Usuário | Senha |
|--------|---------|-------|
| Administrador | `admin` | `Admin@123456` |

Alunos são criados pelo gerenciador (`/admin/usuarios`).

**URLs úteis em dev:**

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Supabase Studio | http://127.0.0.1:54323 |
| API Supabase | http://127.0.0.1:54321 |

Guia completo: [`docs/dev-commands.md`](./docs/dev-commands.md) · [`docs/quando-rodar-comandos.md`](./docs/quando-rodar-comandos.md)

---

## Comandos do dia a dia

**Modo atual (Supabase nuvem + site local):**

```bash
pnpm web:dev    # → http://localhost:5173
```

Ver [`docs/quando-rodar-comandos.md`](./docs/quando-rodar-comandos.md) e [`docs/supabase-nuvem.md`](./docs/supabase-nuvem.md).

<details>
<summary>Modo Docker local (opcional — banco separado da nuvem)</summary>

```bash
pnpm db:start
pnpm functions:serve   # terminal separado
pnpm web:dev
```

</details>

| Comando | Descrição |
|---------|-----------|
| `pnpm install` | Instalar dependências (após clone ou mudança de pacotes) |
| `pnpm db:start` | Subir Supabase local (Docker) |
| `pnpm db:stop` | Parar containers Supabase |
| `pnpm db:status` | URLs e chaves do ambiente local |
| `pnpm db:migrate` | Aplicar migrations pendentes |
| `pnpm db:reset` | Recriar banco do zero (**apaga dados locais**) |
| `pnpm db:seed-admin` | Criar usuário admin (após reset) |
| `pnpm functions:serve` | Edge Functions locais |
| `pnpm web:dev` | Dev server Vite |
| `pnpm web:build` | Build de produção |
| `pnpm test:schemas` | Testes Vitest dos schemas Zod |

---

## Rotas principais

### Web — aluno (`/app`)

| Rota | Descrição |
|------|-----------|
| `/login` | Autenticação |
| `/app` | Home — vitrines e destaques |
| `/app/livros`, `/app/cronicas`, … | Listagem por tipo |
| `/app/conteudos/$id` | Detalhe — leitura, reflexão, comentários |
| `/app/perfil` | Conta do aluno |

### Web — gerenciador (`/admin`)

| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard |
| `/admin/conteudos` | Gestão de conteúdos |
| `/admin/usuarios` | Usuários |
| `/admin/alunos` | Acompanhamento |
| `/admin/auditoria` | Logs administrativos |

Guards redirecionam: aluno → `/app`, staff → `/admin`.

---

## Variáveis de ambiente

Copie [`.env.example`](./.env.example) — **nunca commite** `.env` ou `.env.local`.

| Variável | Onde | Descrição |
|----------|------|-----------|
| `VITE_SUPABASE_URL` | `apps/web/.env.local` | URL da API Supabase |
| `VITE_SUPABASE_ANON_KEY` | `apps/web/.env.local` | Chave pública (anon) |
| `EXPO_PUBLIC_SUPABASE_*` | `apps/mobile/.env` | Mesmo par, para mobile (Fase 3) |

Obter valores locais: `pnpm db:status`

---

## Ordem de entrega

```
1. Backend  →  2. Web  →  3. Mobile
```

| Fase | Conteúdo |
|------|----------|
| **1 — Backend** | Migrations, RLS, Auth, Storage, Edge Functions |
| **2 — Web** | Gerenciador + plataforma aluno |
| **3 — Mobile** | App Expo com paridade aluno |
| **4 — Qualidade** | Testes, acessibilidade, performance |

Escopo MVP: [`docs/mvp-scope.md`](./docs/mvp-scope.md)

---

## Status do projeto

| Módulo | Status |
|--------|--------|
| Backend Supabase (nuvem) | ✅ |
| Login + recuperação de senha | ✅ |
| Gerenciador `/admin` | ✅ |
| Plataforma aluno `/app` | 🔄 implementada — **validar manualmente** |
| Minha obra, leituras, interações, obras públicas | ✅ |
| Busca global no header | ⏳ |
| Testes automatizados | ⏳ |
| App mobile (`apps/mobile`) | ⏳ após web validado |
| Deploy público | ⏳ longe |

**Próximo passo:** [`session/current.md`](./session/current.md) — Passos 0–2 (validação).

---

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [`docs/stack-e-ferramentas.md`](./docs/stack-e-ferramentas.md) | Stack completa — web, mobile, Supabase |
| [`docs/architecture.md`](./docs/architecture.md) | Arquitetura e divisão das apps |
| [`docs/requirements.md`](./docs/requirements.md) | Requisitos funcionais e não funcionais |
| [`docs/database.md`](./docs/database.md) | Modelo de dados |
| [`docs/permissions.md`](./docs/permissions.md) | Permissões por perfil |
| [`docs/security.md`](./docs/security.md) | Segurança, RLS e LGPD |
| [`docs/design-system.md`](./docs/design-system.md) | UI — identidade CESMAC |
| [`docs/mvp-scope.md`](./docs/mvp-scope.md) | Escopo da primeira versão |
| [`docs/user-flows.md`](./docs/user-flows.md) | Fluxos de uso |
| [`docs/dev-commands.md`](./docs/dev-commands.md) | Todos os comandos |
| [`docs/quando-rodar-comandos.md`](./docs/quando-rodar-comandos.md) | O que rodar sempre vs uma vez |
| [`docs/supabase-nuvem.md`](./docs/supabase-nuvem.md) | Nuvem + preservar dados |
| [`docs/roteiro-validacao-aluno.md`](./docs/roteiro-validacao-aluno.md) | Checklist manual aluno |
| [`session/current.md`](./session/current.md) | **Passo a passo atual** |
| [`docs/docker.md`](./docs/docker.md) | Docker local (opcional) |
| [`AGENTS.md`](./AGENTS.md) | Orientação para agentes de IA (Cursor) |

---

## Segurança e LGPD

- **Sem cadastro público** — usuários criados pelo administrador
- **RLS** no PostgreSQL como fonte de verdade de permissões
- Reflexões **privadas**; comentários **públicos** entre alunos
- Não commitar `.env`, chaves `service_role` ou credenciais
- Detalhes: [`docs/security.md`](./docs/security.md)

---

## Publicar no GitHub

Se ainda não inicializou o repositório:

```bash
cd tcc-sistema

git init
git add .
git commit -m "Initial commit — EntreLinhas MVP TCC"

# Crie o repositório vazio no GitHub, depois:
git remote add origin https://github.com/<usuario>/<repo>.git
git branch -M main
git push -u origin main
```

**Antes do push, confira:**

- [ ] `apps/web/.env.local` **não** está no commit (está no `.gitignore`)
- [ ] Nenhuma chave secreta em arquivos rastreados
- [ ] `pnpm web:build` passa localmente (opcional, recomendado)

---

## Licença e contexto acadêmico

Projeto desenvolvido como **Trabalho de Conclusão de Curso (TCC)** — CESMAC.  
Uso e redistribuição conforme orientação da banca e instituição.
