# Stack, ferramentas e como o sistema é construído

> **Projeto:** EntreLinhas (nome provisório) — plataforma de estímulo à leitura, reflexão e produção textual  
> **Contexto:** Trabalho de Conclusão de Curso (TCC) — CESMAC  
> **Repositório:** monorepo `tcc-sistema`  
> **Última atualização:** setembro/2026

Este documento descreve **quais tecnologias usamos**, **como o código está organizado** e **como as partes se comunicam** — tanto na **plataforma web** (já em desenvolvimento) quanto no **app mobile** (fase planejada). Serve como referência para o TCC, para a banca e para quem for continuar o projeto.

---

## 1. Visão geral

O EntreLinhas é composto por **três camadas** no mesmo monorepo:

| Camada | Pasta | Público | Status |
|--------|-------|---------|--------|
| **Website + gerenciador** | `apps/web` | Alunos (`/app`) + staff (`/admin`) | ✅ em desenvolvimento |
| **App mobile** | `apps/mobile` | Alunos (Android/iOS) | ⏳ planejado (Fase 3) |
| **Backend** | `supabase/` | Todas as plataformas | ✅ pronto |

### Web vs mobile — quem usa o quê

| Funcionalidade | Web (`/app`) | Web (`/admin`) | App mobile |
|----------------|:------------:|:--------------:|:----------:|
| Login | ✅ | ✅ | ⏳ planejado |
| Vitrines (livros, crônicas…) | ✅ | — | ⏳ |
| Leitura e reflexão | ✅ | — | ⏳ |
| Comentários e curtidas | ✅ | — | ⏳ |
| Perfil do aluno | ✅ | — | ⏳ |
| CRUD de conteúdos | — | ✅ | — |
| Gestão de usuários | — | ✅ | — |
| Auditoria | — | ✅ | — |

O **gerenciador existe só na web** — professores e administradores trabalham no navegador. O **app mobile** será exclusivo para o **fluxo do aluno**, com paridade funcional em relação à área `/app` da web (requisito RNF09: consistência entre app e web).

### Arquitetura (web + mobile + backend)

```
┌──────────────────────┐     ┌──────────────────────┐
│   apps/mobile        │     │      apps/web         │
│   React Native       │     │   React + Vite          │
│   Expo · iOS/Android │     │   /app (aluno)          │
│   Público: alunos    │     │   /admin (staff)        │
└──────────┬───────────┘     └──────────┬─────────────┘
           │                            │
           │    @supabase/supabase-js   │
           │    TanStack Query          │
           │    @tcc-sistema/types      │
           │    @tcc-sistema/schemas    │
           └────────────┬───────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase                                                        │
│  · PostgreSQL (dados)                                            │
│  · Auth (login JWT)                                              │
│  · Storage (capas de livros)                                     │
│  · Edge Functions (operações privilegiadas)                      │
│  · RLS — Row Level Security (quem vê o quê)                      │
└─────────────────────────────────────────────────────────────────┘
```

**Ordem de entrega:** Backend → Web → Mobile (ver seção 10).

---

## 2. Linguagem principal: TypeScript

**Todo o frontend e as Edge Functions são TypeScript.** Não há JavaScript “solto” como stack paralela.

| Onde | Linguagem |
|------|-----------|
| Frontend web | TypeScript + TSX (React) |
| App mobile | TypeScript + TSX (React Native) |
| Pacotes compartilhados | TypeScript |
| Edge Functions (Supabase) | TypeScript (runtime Deno) |
| Banco de dados | SQL (migrations) |
| Scripts auxiliares | JavaScript (Node) |

**Por quê TypeScript?** Tipos estáticos reduzem erros, facilitam refatoração e permitem compartilhar contratos (`types`, `schemas`) entre **web, mobile e backend**.

---

## 3. Monorepo com pnpm workspaces

O projeto vive em um **único repositório** com vários pacotes:

```
tcc-sistema/
├── apps/
│   ├── web/              # Website + gerenciador (React/Vite)
│   └── mobile/           # App aluno (React Native/Expo) — Fase 3
├── packages/
│   ├── types/            # Tipos TypeScript (Perfil, Conteudo, Tema…)
│   └── schemas/          # Validação Zod (formulários)
├── supabase/
│   ├── migrations/       # SQL versionado (estrutura do banco)
│   └── functions/        # Edge Functions
├── docs/                 # Documentação do projeto
└── session/              # Estado atual do desenvolvimento
```

| Ferramenta | Função |
|------------|--------|
| **pnpm** | Gerenciador de pacotes (mais rápido que npm, monorepo nativo) |
| **pnpm workspaces** | `@tcc-sistema/types` e `@tcc-sistema/schemas` importados pelo `apps/web` |
| **Node.js ≥ 20** | Runtime para desenvolvimento e build |

**Comandos frequentes:**

```bash
pnpm web:dev          # Sobe o frontend em http://localhost:5173
pnpm web:build        # Build de produção
pnpm db:start         # Sobe Supabase local (Docker)
pnpm db:migrate       # Aplica migrations SQL pendentes
pnpm functions:serve  # Edge Functions locais (senha, criar usuário)
```

---

## 4. Frontend web (`apps/web`)

### 4.1 Framework e build

| Tecnologia | Versão (aprox.) | Papel |
|------------|-----------------|-------|
| **React** | 19.x | Interface em componentes |
| **Vite** | 8.x | Dev server rápido + bundler de produção |
| **TypeScript** | 6.x | Tipagem estática |

O Vite substitui Create React App / Webpack: hot reload instantâneo e builds enxutos.

### 4.2 Roteamento — TanStack Router

Rotas **baseadas em arquivos** em `apps/web/src/routes/`:

| Rota | Descrição |
|------|-----------|
| `/login` | Entrada no sistema |
| `/app` | Home do aluno |
| `/app/livros`, `/app/cronicas`, … | Vitrines por tipo |
| `/app/conteudos/$id` | Detalhe do conteúdo (leitura, reflexão, comentários) |
| `/app/perfil` | Conta do aluno |
| `/admin` | Dashboard staff |
| `/admin/conteudos` | CRUD de conteúdos |
| `/admin/usuarios` | Gestão de usuários |

Guards de autenticação redirecionam aluno → `/app`, staff → `/admin`.

### 4.3 Dados no cliente — TanStack Query

Toda leitura/escrita ao Supabase passa por **hooks** com TanStack Query (React Query):

- **Cache** automático (ex.: lista de livros não refaz request a cada navegação)
- **Mutations** para salvar reflexão, curtir, marcar leitura
- **Invalidação** de cache após editar conteúdo no admin

Exemplos no código: `useConteudos.ts`, `useConteudoDetail.ts`, `useConteudoEngagement.ts`.

### 4.4 Formulários e validação

| Biblioteca | Uso |
|------------|-----|
| **React Hook Form** | Formulários performáticos (admin: criar conteúdo, usuário, tema) |
| **Zod** | Regras de validação em `@tcc-sistema/schemas` |
| **@hookform/resolvers** | Liga Zod ao React Hook Form |

Mesmo schema Zod pode ser reutilizado no mobile (quando existir) e validar payloads nas Edge Functions.

### 4.5 Estilo visual

| Tecnologia | Uso |
|------------|-----|
| **Tailwind CSS 4** | Utility-first CSS (`className="flex gap-4 …"`) |
| **CSS customizado** | Tokens de marca, animações de livro, leitor paginado (`index.css`) |
| **Lucide React** | Ícones (livro, cadeado, menu, etc.) |
| **Sonner** | Toasts de feedback (“Reflexão salva”, erros) |

Componentes de UI próprios em `apps/web/src/components/ui/` (Button, Card, Dialog, Input…) — inspirados no padrão shadcn/ui, adaptados ao design EntreLinhas.

### 4.6 Organização do código frontend

```
apps/web/src/
├── routes/           # Páginas (TanStack Router)
├── components/       # Layout (AppLayout, AdminLayout), UI genérica
├── features/         # Lógica por domínio
│   ├── app/          # Plataforma aluno (vitrines, detalhe, leitor de livro)
│   ├── conteudos/    # Formulários e helpers do admin
│   └── auth/         # Login, sessão, marca
└── lib/              # Supabase client, labels, utils
```

Padrão **feature-based**: cada funcionalidade agrupa componentes + hooks + helpers.

---

## 5. App mobile (`apps/mobile`) — planejado

> **Status:** Fase 3 do projeto. A pasta `apps/mobile` será criada após a plataforma web do aluno (`/app`) estar funcional. O backend Supabase **já atende** web e mobile — não será necessário outro servidor.

### 5.1 Público e escopo

| Item | Definição |
|------|-----------|
| **Público** | Alunos (Android e iOS) |
| **Fora do app** | Gerenciador — permanece só na web (`/admin`) |
| **Paridade** | Mesmo fluxo da área `/app`: login, vitrines, leitura, reflexão, comentários, curtidas, perfil |
| **Requisito** | RNF09 — consistência visual e funcional entre app e web |

### 5.2 Stack mobile

| Tecnologia | Papel |
|------------|-------|
| **React Native** | Componentes nativos iOS/Android |
| **Expo** | Toolchain, build, Expo Go para testes |
| **Expo Router** | Rotas baseadas em arquivos (como TanStack Router na web) |
| **TypeScript** | Mesma linguagem do restante do monorepo |
| **NativeWind** | Estilo utility-first (equivalente ao Tailwind no mobile) |
| **TanStack Query** | Cache e requisições ao Supabase (mesmo padrão da web) |
| **React Hook Form + Zod** | Formulários — schemas de `@tcc-sistema/schemas` |
| **Lucide React Native** | Ícones (mesma família da web) |
| **expo-secure-store** | Sessão JWT armazenada com segurança no dispositivo |
| **expo-image** | Carregamento otimizado de capas |
| **date-fns** | Formatação de datas |
| **Zustand** | Estado local (opcional — filtros, preferências UI) |

### 5.3 Estrutura de rotas prevista (Expo Router)

```
apps/mobile/app/
├── (auth)/
│   └── login.tsx              # Entrada — nome de usuário + senha
└── (aluno)/
    ├── index.tsx              # Home — vitrines e destaques
    ├── conteudos/
    │   ├── index.tsx          # Lista por tipo
    │   └── [id].tsx           # Detalhe — leitura, reflexão, comentários
    ├── leitura/               # Progresso de leitura
    ├── producoes/             # Produções textuais do aluno (RF011)
    └── perfil.tsx             # Conta e preferências
```

Guards de rota: `(auth)/*` só para não autenticados; `(aluno)/*` só para perfil aluno.

### 5.4 Como o mobile se conecta ao backend

O app **não terá API própria**. Usará o **mesmo Supabase** que a web:

```
App mobile  →  @supabase/supabase-js  →  PostgREST  →  PostgreSQL + RLS
```

| Aspecto | Implementação |
|---------|---------------|
| Autenticação | Nome de usuário + senha → JWT (igual à web) |
| Dados | TanStack Query + hooks espelhando `apps/web/src/features/app/` |
| Validação | `@tcc-sistema/schemas` (Zod) |
| Tipos | `@tcc-sistema/types` |
| Capas | URLs do Supabase Storage (`conteudos.capa_url`) |
| Segurança | RLS no PostgreSQL — mesmas políticas da web |

Variáveis de ambiente no mobile:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

### 5.5 O que será reutilizado vs reescrito

| Camada | Reutilização |
|--------|--------------|
| `packages/types` | ✅ 100% compartilhado |
| `packages/schemas` | ✅ 100% compartilhado |
| Lógica de negócio (hooks Supabase) | 🔄 Mesmas queries/mutations; adaptar para RN |
| Componentes de UI | ❌ Reescritos em React Native (NativeWind) |
| Layout / navegação | ❌ Expo Router (estrutura diferente da web) |
| Design | 🔄 Mesmos tokens de marca (`docs/design-system.md`) |

### 5.6 Desenvolvimento e testes (quando iniciar)

```bash
pnpm db:start                    # Terminal 1 — Supabase local
pnpm --filter mobile start       # Terminal 2 — Expo Dev Tools
```

- Teste manual: Expo Go (QR code) ou emulador Android/iOS
- Testes automatizados: **React Native Testing Library**
- Fluxo de validação: mesmo do aluno na web (login → conteúdo → reflexão → comentário)

Detalhes: [`docs/dev-commands.md`](./dev-commands.md) — seção Fase 3.

### 5.7 Distribuição ao público (visão futura)

| Etapa | Ferramenta |
|-------|------------|
| Desenvolvimento | Expo Go + emuladores |
| Build Android | EAS Build (Expo Application Services) → `.apk` / Google Play |
| Build iOS | EAS Build → TestFlight / App Store |
| Backend produção | Supabase hospedado (mesmo projeto da web) |

> A publicação nas lojas (Google Play / App Store) está **fora do escopo imediato** do MVP, mas a stack Expo foi escolhida justamente para facilitar esse caminho.

---

## 6. Supabase — backend como serviço

### 6.1 O que é o Supabase

Plataforma open-source built on PostgreSQL que entrega:

1. **Banco PostgreSQL** — tabelas relacionais
2. **API REST automática (PostgREST)** — o client JS fala direto com tabelas permitidas
3. **Auth** — login, JWT, sessão
4. **Storage** — arquivos (capas de livros)
5. **Edge Functions** — código TypeScript/Deno para operações que não podem ficar só no cliente
6. **RLS** — políticas SQL que filtram linhas por usuário/perfil

### 6.2 Desenvolvimento local

```bash
pnpm db:start    # Docker: Postgres + Auth + Storage + Studio
pnpm db:migrate  # Aplica arquivos em supabase/migrations/
```

O **Supabase Studio** local (porta padrão do CLI) permite ver tabelas, testar SQL e inspecionar Auth.

### 6.3 Migrations (SQL versionado)

Cada alteração de schema é um arquivo em `supabase/migrations/`, por exemplo:

| Migration | Conteúdo |
|-----------|----------|
| `20260825120000_enums_and_helpers.sql` | Enums (perfil, tipo_conteudo), funções auxiliares |
| `20260825120100_profiles.sql` | Perfil do usuário |
| `20260825120200_conteudos.sql` | Conteúdos, temas, materiais |
| `20260825120300_interacoes_leituras.sql` | Interações, progresso de leitura |
| `20260831180000_curtidas_interacoes_publicas.sql` | Curtidas, comentários públicos |

**Fluxo:** editar migration → `pnpm db:migrate` → banco local atualizado → mesmo arquivo sobe para produção no deploy.

### 6.4 Principais tabelas

| Tabela | Finalidade |
|--------|------------|
| `profiles` | Nome, nome_usuario (login), perfil (aluno/professor/admin) |
| `conteudos` | Livros, crônicas, poemas — texto, capa, metadados |
| `temas` | Reflexão orientada (frase, orientação, pergunta) |
| `materiais_complementares` | Links, vídeos, áudios |
| `interacoes` | Reflexões privadas e comentários públicos |
| `leituras` | Status em_andamento / concluido |
| `conteudo_curtidas` | Curtidas para seção Destaques |
| `audit_logs` | Auditoria de ações administrativas |
| `password_reset_requests` | Fluxo de recuperação de senha |

Detalhes: [`docs/database.md`](./database.md).

### 6.5 Row Level Security (RLS)

Regras **no PostgreSQL** definem o que cada usuário pode ler/escrever:

- **Aluno** lê conteúdos ativos; vê só **suas** reflexões; vê comentários **públicos** de outros
- **Staff** gerencia conteúdos, usuários, vê reflexões dos alunos para acompanhamento
- **Storage** — bucket de capas: upload só staff, leitura pública ou autenticada conforme política

Isso evita confiar apenas no frontend para esconder dados sensíveis.

### 6.6 Autenticação

- Login na interface: **nome de usuário + senha** (mapeado para Supabase Auth)
- Sessão: **JWT** guardado pelo client Supabase
- **Não há cadastro público** — administrador cria usuários via Edge Function `create-user`
- Recuperação de senha: fluxo com `request-password-reset` e `admin-reset-password`

### 6.7 Storage

- Bucket para **capas** de conteúdos
- Upload no gerenciador → URL salva em `conteudos.capa_url`
- Imagens servidas por URL pública ou assinada conforme política do bucket

### 6.8 Edge Functions

Código em `supabase/functions/` (Deno + TypeScript):

| Function | Quando usar |
|----------|-------------|
| `create-user` | Admin cadastra aluno/professor |
| `request-password-reset` | Aluno solicita redefinição |
| `admin-reset-password` | Staff aprova e define senha temporária |

Rodar localmente: `pnpm functions:serve` (necessário para testar recuperação de senha e criação de usuário).

---

## 7. Pacotes compartilhados

### `@tcc-sistema/types`

Tipos TypeScript espelhando o banco e regras de negócio:

- `Conteudo`, `Tema`, `Interacao`, `Profile`
- Enums: `TipoConteudo`, `StatusLeitura`, `TipoInteracao`

### `@tcc-sistema/schemas`

Schemas **Zod** para validação:

- `conteudoFormSchema` — criar/editar conteúdo + campos de reflexão
- `temaFormSchema` — tema reflexivo
- `loginSchema`, schemas de usuário, etc.

Testes unitários dos schemas: `pnpm test:schemas` (Vitest).

---

## 8. Como uma funcionalidade é construída (exemplo)

**Cadastrar reflexão de um livro e o aluno responder:**

1. **Admin** preenche formulário (`ContentFormDialog.tsx`) — React Hook Form + Zod
2. **Save** grava `conteudos` e sincroniza `temas` (`conteudoReflexao.ts`: frase → `questionamento`, orientação → `descricao`, pergunta → `ensinamento`)
3. **Aluno** abre `/app/conteudos/$id` — `useConteudoDetail` busca conteúdo + temas via Supabase
4. **Leitor paginado** (`LivroDetailPage`, `BookPaginatedReader`) — uma seção por página, tamanho fixo, scroll interno
5. **Reflexão** — `useSalvarInteracao` grava em `interacoes` com `tipo_interacao = reflexao_orientada`; RLS garante privacidade
6. **Comentário** — mesma tabela, tipo `comentario_livre`, visível entre alunos

---

## 9. Ferramentas de desenvolvimento e qualidade

| Ferramenta | Uso |
|------------|-----|
| **Docker** | Supabase local (obrigatório para backend) |
| **Supabase CLI** | Migrations, functions, status |
| **Git** | Versionamento |
| **oxlint** | Linter rápido no `apps/web` |
| **Vitest** | Testes dos schemas Zod |
| **React Native Testing Library** | Testes de componentes mobile (Fase 3) |
| **Cursor** | IDE com assistência de IA (`AGENTS.md`, rules) |

Documentação complementar:

- [`docs/dev-commands.md`](./dev-commands.md) — todos os comandos
- [`docs/quando-rodar-comandos.md`](./quando-rodar-comandos.md) — o que rodar no dia a dia
- [`docs/security.md`](./security.md) — LGPD, RLS, boas práticas
- [`docs/permissions.md`](./permissions.md) — o que cada perfil pode fazer

---

## 10. Estado atual do desenvolvimento (resumo)

| Módulo | Status |
|--------|--------|
| Backend (migrations, RLS, storage) | ✅ |
| Login + recuperação de senha | ✅ |
| Gerenciador `/admin` (conteúdos, usuários, alunos, auditoria) | ✅ |
| Plataforma aluno `/app` (vitrines, detalhe, leitura, reflexão, comentários, curtidas) | ✅ em evolução |
| Leitor de livro paginado + layout imersivo | ✅ (testes em andamento) |
| App mobile (`apps/mobile`) | ⏳ planejado |
| Busca global, evolução do aluno, produções/obras | ⏳ roadmap |

Estado detalhado: [`session/current.md`](../session/current.md).

---

## 11. Por que essas escolhas? (síntese para o TCC)

| Decisão | Motivo |
|---------|--------|
| **Supabase** | PostgreSQL robusto + Auth + Storage + RLS sem montar backend do zero; adequado a prazo de TCC |
| **React + Vite** | Ecossistema maduro, performance, fácil deploy estático |
| **TypeScript + Zod** | Segurança de tipos e validação compartilhada |
| **Monorepo** | Web e mobile compartilham `types` e `schemas` |
| **React Native + Expo** | App nativo iOS/Android com paridade aluno; publicação futura via EAS |
| **TanStack Router/Query** | Rotas tipadas e cache de dados sem Redux desnecessário |
| **Tailwind** | UI consistente, responsiva, alinhada ao design system EntreLinhas |

---

## 12. Referências rápidas

- [Supabase Docs](https://supabase.com/docs)
- [React](https://react.dev)
- [React Native](https://reactnative.dev)
- [Expo](https://docs.expo.dev)
- [Vite](https://vite.dev)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com)
- [Zod](https://zod.dev)

---

*Documento vivo — atualize conforme novas tecnologias entrarem no projeto (ex.: scaffold do `apps/mobile`, deploy em produção, CI/CD, publicação nas lojas).*
