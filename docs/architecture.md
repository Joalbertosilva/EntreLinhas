# Arquitetura — tcc-sistema

## 1. Visão geral

Solução em **TypeScript** com monorepo **pnpm workspaces**:

```
┌─────────────────────────────────────────────────────────┐
│                     tcc-sistema                          │
├──────────────┬──────────────────┬───────────────────────┤
│  apps/mobile │     apps/web     │      supabase/        │
│  (Expo/RN)   │  (React/Vite)    │  (PostgreSQL/Auth)    │
├──────────────┴──────────────────┴───────────────────────┤
│              packages/types · schemas · config           │
└─────────────────────────────────────────────────────────┘
```

## 2. Divisão das aplicações

### apps/mobile — Aplicativo mobile

| Item | Definição |
|------|-----------|
| Público | Alunos (principalmente) |
| Stack | React Native, Expo, Expo Router, TypeScript, NativeWind |
| Navegação | Expo Router (file-based routing) |
| Estilo | NativeWind (Tailwind-like) |
| Ícones | Lucide React Native |
| Dados | Supabase JS + TanStack Query |
| Formulários | React Hook Form + Zod |
| Estado local | Zustand (somente quando necessário) |
| Sessão | expo-secure-store |
| Imagens | expo-image |
| Datas | date-fns |

### apps/web — Website e gerenciador

**Uma única aplicação React** com rotas distintas por perfil:

| Área | Rota (sugestão) | Público |
|------|-----------------|---------|
| Website (aluno) | `/`, `/conteudos`, `/leitura`, `/producoes` | Aluno |
| Gerenciador | `/admin/*`, `/professor/*` | Professor, Administrador |

| Item | Definição |
|------|-----------|
| Stack | React, Vite, TanStack Router, TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Ícones | Lucide React |
| Tabelas | TanStack Table (usuários, conteúdos, acompanhamento) |
| Feedback | Sonner (toasts) |
| Dados | Supabase JS + TanStack Query |
| Formulários | React Hook Form + Zod |
| Estado local | Zustand (somente quando necessário) |
| Datas | date-fns |

### supabase/ — Backend

| Componente | Uso |
|------------|-----|
| PostgreSQL | Banco relacional principal |
| Supabase Auth | Autenticação e sessão |
| Supabase Storage | Capas, imagens, arquivos |
| RLS | Controle de acesso no banco |
| Edge Functions | Criação administrativa de usuários, operações privilegiadas |
| Supabase CLI | Migrations e dev local |

## 3. Pacotes compartilhados

### packages/types

Tipos TypeScript compartilhados entre mobile, web e backend:

- Enums (Perfil, TipoConteudo, TipoInteracao, etc.)
- Interfaces de entidades
- Tipos de resposta da API

### packages/schemas

Schemas Zod compartilhados:

- Validação de formulários (web e mobile)
- Validação de payloads (Edge Functions)
- Mesmas regras de negócio em todas as camadas

### packages/config

Configurações compartilhadas:

- ESLint
- Prettier
- TypeScript (tsconfig base)
- Tailwind (tokens compartilhados, se aplicável)

## 4. Autenticação

```
Usuário digita: NomeUsuario + Senha
         ↓
Supabase Auth (custom ou email mapeado)
         ↓
Sessão JWT + perfil (Aluno | Professor | Administrador)
         ↓
RLS filtra dados conforme perfil e usuario_id
```

- **Interface:** Nome de Usuário + Senha
- **Interno:** UUID (`auth.users.id` → `profiles.id`)
- **Criação de conta:** Edge Function chamada pelo Administrador (sem signup público)

## 5. Fluxo de dados

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐
│  Mobile  │────▶│ TanStack     │────▶│  Supabase   │
│  ou Web  │     │ Query        │     │  (PostgREST)│
└──────────┘     └──────────────┘     └──────┬──────┘
                                              │
                                     ┌────────▼────────┐
                                     │  PostgreSQL     │
                                     │  + RLS          │
                                     └─────────────────┘
```

- Leituras: TanStack Query (cache, refetch)
- Escritas: mutations via TanStack Query
- Validação client: Zod (packages/schemas)
- Validação server: RLS + constraints + Edge Functions

## 6. Armazenamento de arquivos

| Tipo | Bucket (sugestão) | Quem envia |
|------|-------------------|------------|
| Capas de conteúdo | `covers` | Professor/Admin |
| Imagens autorizadas | `media` | Conforme regra |

Políticas de Storage espelham RLS do banco.

## 7. Testes

| Ferramenta | Escopo |
|------------|--------|
| Vitest | Unitários, regras de negócio, schemas |
| React Testing Library | Componentes web |
| React Native Testing Library | Componentes mobile |

## 8. Ferramentas de desenvolvimento

| Ferramenta | Uso |
|------------|-----|
| **Docker + Docker Compose** | **Backend local (Supabase) em containers — obrigatório** |
| Node.js | Runtime (apps frontend no host) |
| pnpm | Gerenciador de pacotes |
| pnpm workspaces | Monorepo |
| Supabase CLI | Migrations, Edge Functions, `supabase start` (Docker) |
| Git + GitHub | Versionamento |
| ESLint + Prettier | Qualidade de código |
| Cursor | Desenvolvimento assistido (AGENTS.md + rules + skills) |

### Docker no desenvolvimento

```
Docker (supabase start)          Host (pnpm)
├── PostgreSQL                   ├── apps/web (Vite)
├── Auth / Storage / Studio      └── apps/mobile (Expo)
└── Edge Functions runtime
```

- `supabase start` — sobe containers do backend
- `docker compose --profile tools up` — ferramentas auxiliares (Adminer)
- Detalhes: `docs/docker.md`, `docker-compose.yml`

## 9. Diretrizes

1. **TypeScript em todo o projeto** — JavaScript não é stack separada
2. **MVP prioriza tecnologias essenciais e recomendadas** — opcionais só com necessidade concreta
3. **Formik + Yup não serão usados** — React Hook Form + Zod
4. **Consistência visual** entre app e web (RNF09)
5. **Responsividade** no web (RNF03)

## 10. Estrutura de rotas (referência)

### Mobile (Expo Router)

```
app/
├── (auth)/login.tsx
├── (aluno)/
│   ├── index.tsx              # Home
│   ├── conteudos/
│   │   ├── index.tsx          # Lista/busca
│   │   └── [id].tsx           # Detalhe
│   ├── leitura/
│   ├── producoes/
│   └── perfil.tsx
```

### Web (TanStack Router)

```
routes/
├── __root.tsx
├── login.tsx
├── _aluno/                    # Layout aluno
│   ├── index.tsx
│   ├── conteudos/
│   ├── producoes/
│   └── perfil.tsx
├── _professor/               # Layout professor
│   ├── conteudos/
│   ├── temas/
│   └── alunos/
└── _admin/                   # Layout admin
    ├── usuarios/
    ├── dashboard/
    └── conteudos/
```

Rotas protegidas por guard de autenticação + perfil.
