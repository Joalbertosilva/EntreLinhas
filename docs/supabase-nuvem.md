# Supabase na nuvem — uso seguro

Projeto atual: **`xiplrnkeghrsmkfmrnhh`**  
URL: `https://xiplrnkeghrsmkfmrnhh.supabase.co`

O frontend roda **local** (`pnpm web:dev`). O banco, auth, storage e Edge Functions estão **na nuvem**. Os dados cadastrados (usuários, conteúdos, obras, etc.) **vivem na nuvem** — não no Docker local.

---

## Configuração web

Arquivo: `apps/web/.env.local`

```env
VITE_SUPABASE_URL=https://xiplrnkeghrsmkfmrnhh.supabase.co
VITE_SUPABASE_ANON_KEY=<sua chave anon>
```

**Nunca commitar** este arquivo.

---

## Rotina de desenvolvimento (nuvem)

```bash
cd ~/Documentos/Projeto-tcc/tcc-sistema
pnpm web:dev
```

**Não precisa** de `pnpm db:start` nem `pnpm functions:serve` no dia a dia — as Edge Functions já estão deployadas na nuvem.

---

## O que NÃO fazer (preservar dados)

| Ação | Risco |
|------|-------|
| `pnpm db:reset` | Apaga banco local; se linkado errado, **catástrofe na nuvem** |
| `supabase db reset --linked` | **Apaga todos os dados do projeto cloud** |
| Migration com `DROP TABLE`, `TRUNCATE`, `DELETE FROM` sem `WHERE` | Perda de dados |
| Apagar projeto no dashboard Supabase | Perda total |
| Rodar seed scripts contra produção sem entender | Sobrescreve usuários |

---

## O que é seguro

| Ação | Efeito |
|------|--------|
| Usar gerenciador e plataforma aluno | CRUD normal via RLS |
| `pnpm web:dev` / `pnpm web:build` | Só frontend |
| Ver/editar dados no Supabase Dashboard | Manual, com cuidado |
| `supabase functions deploy` | Atualiza functions; **não apaga tabelas** |
| Nova migration **aditiva** + `supabase db push` | Ex.: `ALTER TABLE ADD COLUMN` — revisar SQL antes |

---

## Antes de `supabase db push`

1. Abrir o arquivo em `supabase/migrations/`
2. Ler todo o SQL
3. Confirmar que não há drops destrutivos
4. Se migration altera dados existentes, planejar backup mental (o que existe hoje)
5. Executar push

---

## Backup (recomendado antes de mudanças grandes)

No [Supabase Dashboard](https://supabase.com/dashboard/project/xiplrnkeghrsmkfmrnhh):

- **Database → Backups** (plano Pro) ou export manual de tabelas críticas via SQL
- Anotar conteúdos/usuários importantes antes de migrations arriscadas

---

## Docker local vs nuvem

| | Docker local | Nuvem (atual) |
|---|--------------|---------------|
| Comando | `pnpm db:start` | (nada — já está no ar) |
| Dados | Separados da nuvem | **Produção de dev** |
| Quando usar | Testar migration isolada, offline | **Sempre no TCC agora** |

Se um dia rodar local **e** nuvem, são **dois bancos diferentes**. `.env.local` define qual o site usa.

---

## Deploy futuro (longe)

Quando for publicar:

1. **Backend:** já está na nuvem (Supabase)
2. **Frontend:** build estático (`pnpm web:build` → pasta `dist/`) hospedado em Vercel, Cloudflare Pages, etc.
3. **Domínio:** opcional; configurar CORS/redirect URLs no Supabase Auth se necessário

Não confundir: Vercel hospeda só o **site estático**; os dados continuam no Supabase.

---

## Edge Functions deployadas

- `create-user`
- `request-password-reset`
- `admin-reset-password`
- `admin-set-user-password`

Redeploy só se alterar código em `supabase/functions/`.
