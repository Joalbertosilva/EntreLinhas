---
name: setup-docker
description: Configura e valida o ambiente Docker do tcc-sistema para desenvolvimento local com Supabase. Use ao configurar máquina nova, troubleshooting de containers ou ao mencionar Docker no projeto.
---

# Setup Docker — tcc-sistema

## Objetivo

Garantir Docker funcional para rodar Supabase local e ferramentas auxiliares.

## Pré-requisitos

- Docker Engine 24+ ou Docker Desktop
- Docker Compose v2

## Workflow

```
- [ ] Verificar Docker instalado e daemon rodando
- [ ] Verificar Supabase CLI instalado
- [ ] supabase start (containers Supabase)
- [ ] supabase db reset (migrations)
- [ ] (Opcional) docker compose --profile tools up -d
- [ ] Configurar .env.local a partir de .env.example
- [ ] Validar supabase status
```

## Comandos

```bash
# Verificar Docker
docker --version
docker compose version
docker info

# Backend Supabase (containers principais)
cd tcc-sistema
supabase start
supabase status

# Ferramentas auxiliares (Adminer)
docker compose --profile tools up -d
docker compose --profile tools ps

# Parar tudo
docker compose --profile tools down
supabase stop
```

## Validação

1. `docker info` — sem erro
2. `supabase status` — todos serviços healthy
3. Studio acessível: http://127.0.0.1:54323
4. API acessível: http://127.0.0.1:54321

## Troubleshooting

| Erro | Ação |
|------|------|
| Cannot connect to Docker daemon | Iniciar Docker Desktop |
| Port already allocated | `supabase stop`, verificar `docker ps` |
| Disco cheio | `docker system df`, prune se necessário |

## Regras

- PostgreSQL **sempre** via Supabase Docker — não instalar PG no host
- Não commitar `.env` ou volumes
- Documentação completa: `docs/docker.md`

## Próximo passo

Após Docker OK → skill `setup-supabase-local` para migrations e auth.
