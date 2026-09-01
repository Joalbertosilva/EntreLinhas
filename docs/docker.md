# Docker — tcc-sistema

Docker é **obrigatório** no ambiente de desenvolvimento deste projeto.

## Por que Docker

| Uso | Descrição |
|-----|-----------|
| **Supabase local** | PostgreSQL, Auth, Storage, Edge Functions e Studio rodam em containers |
| **Ambiente reproduzível** | Mesma stack para todos os desenvolvedores |
| **Isolamento** | Backend separado do SO host |
| **Ferramentas auxiliares** | Adminer (inspeção do banco) via `docker compose` |

## Arquitetura local com Docker

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Engine                         │
├─────────────────────────────────────────────────────────┤
│  Supabase CLI (supabase start)                          │
│  ├── supabase_db          PostgreSQL                    │
│  ├── supabase_auth        GoTrue (Auth)                 │
│  ├── supabase_storage     Storage API                   │
│  ├── supabase_kong        API Gateway                   │
│  ├── supabase_studio      Dashboard (porta 54323)       │
│  └── supabase_edge_runtime Edge Functions               │
├─────────────────────────────────────────────────────────┤
│  docker compose (opcional, profile tools)               │
│  └── adminer              UI do banco (porta 8080)      │
└─────────────────────────────────────────────────────────┘

Fora do Docker (host):
├── apps/web      → pnpm dev (Vite)
└── apps/mobile   → pnpm start (Expo)
```

Apps frontend rodam no host (hot reload). Backend Supabase roda em Docker.

## Pré-requisitos

1. **Docker Engine** 24+ ou **Docker Desktop**
2. **Docker Compose** v2 (incluso no Docker Desktop)
3. Supabase CLI
4. Node.js + pnpm

### Verificar instalação

```bash
docker --version
docker compose version
docker info          # Docker daemon rodando
```

Se `docker info` falhar, inicie o Docker Desktop ou o serviço Docker.

## Comandos principais

### 1. Subir backend Supabase (Docker)

```bash
cd tcc-sistema
supabase start
```

Cria e inicia todos os containers do Supabase. Na primeira execução, baixa as imagens.

```bash
supabase status      # URLs, portas e keys
supabase stop        # Para containers (preserva dados)
supabase stop --no-backup  # Para e remove volumes
```

### 2. Ferramentas auxiliares (opcional)

```bash
docker compose --profile tools up -d adminer
# Acesse http://localhost:8080
# Servidor: host.docker.internal ou 172.17.0.1
# Porta: 54322 (PostgreSQL do Supabase)
```

### 3. Aplicar migrations

```bash
supabase db reset    # Recria banco e aplica migrations/
```

### 4. Edge Functions

```bash
supabase functions serve
```

## Portas padrão (Supabase local)

| Serviço | Porta |
|---------|-------|
| API (Kong) | 54321 |
| PostgreSQL | 54322 |
| Studio | 54323 |
| Inbucket (email) | 54324 |
| Adminer (tools) | 8080 |

## Variáveis de ambiente

Copie `.env.example` para `.env.local` nas apps após `supabase start`:

```bash
supabase status -o env >> .env.supabase
```

Keys ficam em `.env.local` (gitignored). **Nunca** commitar service role key.

## Fluxo diário de desenvolvimento

```bash
# 1. Verificar Docker
docker info

# 2. Subir backend
supabase start

# 3. Aplicar/atualizar banco (se necessário)
supabase db reset

# 4. Subir frontend(s)
pnpm --filter web dev
pnpm --filter mobile start

# 5. Ao encerrar
supabase stop
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `Cannot connect to Docker daemon` | Iniciar Docker Desktop/serviço |
| Porta 54321 em uso | `supabase stop` ou alterar portas em `supabase/config.toml` |
| Containers órfãos | `docker ps -a`, `supabase stop --no-backup`, `supabase start` |
| Migrations falham | `supabase db reset`, verificar logs: `supabase logs` |
| Sem espaço em disco | `docker system prune` (cuidado: remove imagens não usadas) |

## Produção (futuro)

Fora do escopo do MVP local, mas previsto:

- Dockerfile para `apps/web` (build estático ou SSR)
- Supabase Cloud ou self-hosted em produção
- CI/CD com imagens Docker para testes

## Regras

1. **Sempre usar Supabase local via Docker** — não instalar PostgreSQL no host
2. **Não commitar** `.env`, volumes ou dados de containers
3. **Service role key** apenas em Edge Functions, nunca no client
4. Documentar novos serviços Docker em `docker-compose.yml` e neste arquivo

## Referências

- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- Skill `setup-supabase-local`
- Skill `setup-docker`
- `docker-compose.yml` na raiz do projeto
