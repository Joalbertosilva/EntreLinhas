# Quando rodar cada comando — tcc-sistema

Guia rápido: o que é **uma vez**, **por sessão** ou **só quando necessário**.

> **Modo atual:** Supabase **nuvem** + site **local**. Preservar dados: [`supabase-nuvem.md`](./supabase-nuvem.md)

---

## Resumo visual — nuvem (rotina atual)

| Comando | Quando usar |
|---------|-------------|
| `pnpm install` | Primeira vez ou ao mudar dependências |
| `pnpm web:dev` | **Cada sessão** — único comando obrigatório |
| `pnpm web:build` | Validar build antes de commit / após mudanças grandes |
| `supabase db push` | **Só** nova migration — **ler SQL antes** |
| `supabase functions deploy` | Alterou código em `supabase/functions/` |

### ⚠️ Não usar na nuvem (apaga ou arrisca dados)

| Comando | Motivo |
|---------|--------|
| `pnpm db:reset` | Recria banco do zero |
| `supabase db reset --linked` | Apaga projeto cloud |
| `pnpm db:seed-admin` | Só se souber que precisa recriar admin |

---

## Rotina diária (nuvem)

```bash
cd ~/Documentos/Projeto-tcc/tcc-sistema
pnpm web:dev           # → http://localhost:5173
```

**Login:** `admin` / `Admin@123456` (ou aluno criado no gerenciador)

**Dashboard dados:** [Supabase Dashboard](https://supabase.com/dashboard/project/xiplrnkeghrsmkfmrnhh)

---

## Resumo visual — Docker local (opcional, legado)

Use **apenas** se voltar a desenvolver com Supabase local (banco **separado** da nuvem).

| Comando | Quando usar |
|---------|-------------|
| `pnpm db:start` | Subir Supabase local (Docker) |
| `pnpm functions:serve` | Testar Edge Functions localmente |
| `pnpm db:reset` | **Só local** — apaga banco local |
| `pnpm db:seed-admin` | Após reset local |

Ver [`docker.md`](./docker.md)

---

## Como interagir com o banco

### 1. Gerenciador Web ← principal (dia a dia)

- **URL:** http://localhost:5173
- Cadastrar usuários, conteúdos, acompanhar alunos

### 2. Plataforma aluno

- **URL:** http://localhost:5173/app
- Fluxo do aluno

### 3. Supabase Dashboard (nuvem)

- **URL:** dashboard do projeto `xiplrnkeghrsmkfmrnhh`
- Ver tabelas, auth, storage — **cuidado ao editar/apagar**

### 4. Supabase Studio local (só se `pnpm db:start`)

- **URL:** http://127.0.0.1:54323
- Banco **local**, não mistura com nuvem

---

## Fluxo correto (hoje)

```
Nuvem Supabase     →  dados reais (usuários, conteúdos, obras)
localhost:5173     →  gerenciador + plataforma aluno
Dashboard Supabase →  debug / inspeção (sem apagar)
Docker local       →  opcional, outro banco
```

---

## Se algo não funcionar

1. `.env.local` aponta para nuvem?
2. `pnpm web:dev` sem erro no terminal?
3. Logout + login (limpa sessão antiga de outro projeto)
4. Ctrl+Shift+R no browser
5. Ver [`supabase-nuvem.md`](./supabase-nuvem.md)

Ver também: [`dev-commands.md`](./dev-commands.md) · [`session/current.md`](../session/current.md)
