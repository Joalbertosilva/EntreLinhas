---
name: setup-supabase-local
description: Configura ambiente Supabase local para o tcc-sistema, incluindo CLI, migrations e variáveis de ambiente. Use ao iniciar backend, configurar dev local ou supabase/.
---

# Setup Supabase Local — tcc-sistema

## Pré-requisitos

- **Docker Engine/Desktop rodando** (obrigatório — ver skill `setup-docker`)
- Supabase CLI instalado (`npm i -g supabase` ou via package manager)
- Node.js + pnpm

## Workflow

```
- [ ] docker info (Docker OK)
- [ ] supabase init (se ainda não feito)
- [ ] supabase start (sobe containers Docker do backend)
- [ ] Aplicar migrations: supabase db reset
- [ ] Configurar .env.local em apps/web e apps/mobile
- [ ] Criar usuário admin inicial (seed ou Edge Function)
- [ ] Verificar RLS com usuários de teste
```

## Comandos

```bash
cd tcc-sistema

# Inicializar (primeira vez)
supabase init

# Subir stack local
supabase start

# Aplicar migrations
supabase db reset

# Servir Edge Functions localmente
supabase functions serve

# Status e URLs/keys
supabase status
```

## Variáveis de ambiente

Criar `.env.local` (nunca commitar):

```env
# apps/web/.env.local e apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key do supabase status>

VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key do supabase status>
```

**Nunca** incluir `SUPABASE_SERVICE_ROLE_KEY` no client.

## Estrutura esperada

```
supabase/
├── config.toml
├── migrations/
│   └── YYYYMMDDHHMMSS_*.sql
└── functions/
    └── create-user/
        └── index.ts
```

## Seed inicial (sugestão)

Após migrations, criar administrador via Edge Function ou seed SQL para desenvolvimento.

## Validação

1. `supabase status` — todos os serviços UP
2. Login com usuário de teste
3. Query respeitando RLS por perfil
4. Storage buckets acessíveis conforme policy

## Referências

- `docs/docker.md` — Docker e Supabase local
- `docs/database.md` — entidades
- `docs/security.md` — RLS e auth
- Skill `setup-docker` — validar Docker antes de iniciar
- Skill `create-migration` — novas migrations
- Skill `create-edge-function` — funções privilegiadas
