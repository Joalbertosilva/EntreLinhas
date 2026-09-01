# Quando rodar cada comando — tcc-sistema

Guia rápido: o que é **uma vez**, **por sessão** ou **só quando necessário**.

---

## Resumo visual

| Comando | Quando usar |
|---------|-------------|
| `pnpm install` | **Uma vez** (ou quando adicionar dependências) |
| `pnpm db:start` | **Cada sessão de dev** (se Docker/Supabase parou) |
| `pnpm web:dev` | **Cada sessão de dev** (subir o gerenciador web) |
| `pnpm functions:serve` | **Quando for cadastrar usuários** pelo gerenciador |
| `pnpm db:reset` | **Só ao alterar migrations** |
| `pnpm db:seed-admin` | **Primeira vez** ou após `db:reset` (cria o admin) |
| `pnpm db:stop` | Ao encerrar o dia (opcional) |

---

## Rotina diária (desenvolvimento)

Abra **3 terminais** (ou 2 se não for cadastrar usuários):

```bash
# Terminal 1 — Backend (Docker)
cd /home/joao/Documentos/Projeto-tcc/tcc-sistema
pnpm db:start          # só se não estiver rodando

# Terminal 2 — Edge Functions (necessário para criar usuários)
pnpm functions:serve

# Terminal 3 — Gerenciador Web
pnpm web:dev           # → http://localhost:5173
```

**Login dev:** usuário `admin` / senha `Admin@123456`

---

## O que NÃO precisa rodar sempre

| Comando | Motivo |
|---------|--------|
| `pnpm db:reset` | Apaga e recria o banco — só quando mudar migrations |
| `pnpm db:seed-admin` | Só depois de reset (senão o admin some) |
| `pnpm install` | Só na primeira vez ou ao mudar pacotes |
| `supabase init` | Já foi feito |

---

## Como interagir com o banco de dados

Você **não** manipula o banco só pelo gerenciador. Existem **4 formas**:

### 1. Gerenciador Web (produção do dia a dia) ← principal
- **URL:** http://localhost:5173
- **Para quê:** cadastrar usuários, conteúdos, gerenciar a plataforma
- **Quem usa:** admin, professor
- **É a interface oficial** do sistema para operações do negócio

### 2. Supabase Studio (desenvolvimento/debug)
- **URL:** http://127.0.0.1:54323
- **Para quê:** ver tabelas, dados, auth, storage, testar queries visualmente
- **Quem usa:** você (desenvolvedor) durante o dev
- **Não é** para o cliente final — é ferramenta técnica

### 3. Adminer (SQL direto — opcional)
```bash
docker compose --profile tools up -d
# http://localhost:8080
```
- **Para quê:** rodar SQL manual, inspecionar tabelas
- **Quem usa:** desenvolvedor

### 4. psql (terminal)
```bash
PGPASSWORD=postgres psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
```
- **Para quê:** queries SQL no terminal
- **Quem usa:** desenvolvedor

---

## Fluxo correto

```
Desenvolvedor (Studio/Adminer)  →  debug e migrations
Gerenciador Web                 →  admin cadastra usuários e conteúdos
App/Web Aluno (futuro)          →  alunos usam o sistema
```

**Usuários finais nunca acessam o Studio** — só o gerenciador (admin/professor) e depois a área do aluno.

---

## Se algo não funcionar

```bash
docker info                    # Docker rodando?
pnpm db:status                 # Supabase up?
pnpm db:start                  # Subir se parado
pnpm functions:serve           # Necessário para criar usuários
```

Ver também: [dev-commands.md](./dev-commands.md) | [docker.md](./docker.md)
