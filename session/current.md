# Sessão atual — tcc-sistema / EntreLinhas

> Última atualização: **2026-09-02**  
> **Fase:** 2e — Validar web local → fechar lacunas → depois mobile  
> **Deploy:** fora do escopo por enquanto (site roda em `localhost` + Supabase nuvem)

---

## Fase atual

```
Backend ✅  →  Web 🔄 (validar + lacunas)  →  Mobile ⏳  →  Deploy ⏳ (longe)
```

Você está no **fim da construção web**. O próximo trabalho real é **validar tudo manualmente**, corrigir o que quebrar e só então **iniciar o app mobile**.

---

## Infraestrutura (como usamos hoje)

| Item | Situação |
|------|----------|
| Supabase **nuvem** | Projeto `xiplrnkeghrsmkfmrnhh` — **dados reais aqui** |
| Frontend | Local: `pnpm web:dev` → http://localhost:5173 |
| `.env.local` | Aponta para a **nuvem** (não local) |
| Admin nuvem | `admin` / `Admin@123456` |
| Docker local | Opcional — só se voltar a dev com `pnpm db:start` |

**Comando do dia a dia (único obrigatório):**

```bash
cd ~/Documentos/Projeto-tcc/tcc-sistema
pnpm web:dev
```

---

## ⚠️ Regras de ouro — NÃO perder dados da nuvem

Leia antes de qualquer comando de banco.

### Nunca executar no projeto linkado à nuvem

| Comando / ação | Por quê |
|----------------|---------|
| `pnpm db:reset` | Apaga e recria o banco |
| `supabase db reset --linked` | Idem, na nuvem |
| `TRUNCATE` / `DROP` manual no Studio | Remove dados permanentemente |
| Migration destrutiva sem revisar | Pode apagar colunas/tabelas |
| `pnpm db:seed-admin` na nuvem | Sobrescreve/cria admin — só se souber o que faz |
| Desvincular e recriar projeto Supabase | Perde tudo |

### Seguro no dia a dia

| Ação | Seguro? |
|------|---------|
| `pnpm web:dev` | ✅ |
| `pnpm web:build` | ✅ |
| Cadastrar/editar via gerenciador (`/admin`) | ✅ |
| Usar plataforma aluno (`/app`) | ✅ |
| Supabase Dashboard → ver dados | ✅ |
| `supabase functions deploy` | ✅ (não apaga dados) |
| Nova migration **aditiva** + `supabase db push` | ✅ **depois de ler o SQL** |

### Antes de qualquer `db push` no futuro

1. Abrir o arquivo `.sql` da migration e ler o conteúdo  
2. Confirmar que não há `DROP`, `TRUNCATE`, `DELETE` em massa  
3. Se possível, anotar o que existe hoje (conteúdos, usuários)  
4. Só então: `supabase db push`

Detalhes: [`docs/supabase-nuvem.md`](../docs/supabase-nuvem.md)

---

## O que já está pronto ✅

### Gerenciador `/admin` — MVP concluído
Usuários, conteúdos, temas, materiais, alunos, obras, recuperação de senha, auditoria (parcial), perfil.

Roteiro: [`docs/gerenciador-roteiro-teste.md`](../docs/gerenciador-roteiro-teste.md)

### Plataforma aluno `/app` — implementada (falta validar)
Home, vitrines, destaques, detalhe de conteúdo, leituras, minha obra, obras públicas, perfil, senha, interações/comentários, curtidas.

Roteiro: [`docs/roteiro-validacao-aluno.md`](../docs/roteiro-validacao-aluno.md)

### Auth + institucional
Login (split + logo animada), esqueci/redefinir senha, `/privacidade`.

### Polish recente
Navbar animado, ícones Lucide, cache conteúdos (admin ↔ aluno), fix sessão Supabase.

---

## Passo a passo — do retorno até o app mobile

> **Não pule a validação.** Só avance quando o passo anterior estiver ok ou os bugs anotados.

### Passo 0 — Retomar ambiente (5 min)

- [x] `cd ~/Documentos/Projeto-tcc/tcc-sistema`
- [x] Confirmar `apps/web/.env.local` aponta para nuvem (`xiplrnkeghrsmkfmrnhh.supabase.co`)
- [x] `pnpm web:dev`
- [x] Login admin → `/admin` ok
- [x] Login aluno (se existir) → `/app` ok
- [x] Conteúdo cadastrado (ex.: *O Pequeno Príncipe*) aparece na home

**Não rodar:** `db:reset`, `db:start`, migrations destrutivas.

**Aplicar migration nova (aditiva):** `supabase db push` — coluna `deve_trocar_senha` + RPC `clear_deve_trocar_senha`. Depois: `supabase functions deploy` (create-user, admin-reset-password, admin-set-user-password).

---

### Passo 1 — Validar gerenciador (1–2 h) 🔄

- [ ] Seguir [`docs/gerenciador-roteiro-teste.md`](../docs/gerenciador-roteiro-teste.md) completo
- [ ] Anotar bugs em lista (issue ou bloco abaixo em “Pendências da validação”)
- [ ] Testar como **admin** e, se possível, como **professor**

**Correções já aplicadas nesta sessão:**
- Redirect staff → `/admin` (estava indo para `/app`)
- Auditoria ampliada (usuários, temas, materiais, status conteúdo)
- Troca obrigatória de senha (`deve_trocar_senha`) — requer migration na nuvem

---

### Passo 1 — Validar gerenciador (1–2 h)

- [ ] Seguir [`docs/gerenciador-roteiro-teste.md`](../docs/gerenciador-roteiro-teste.md) completo
- [ ] Anotar bugs em lista (issue ou bloco abaixo em “Pendências da validação”)
- [ ] Testar como **admin** e, se possível, como **professor**

---

### Passo 2 — Validar plataforma aluno (1–2 h)

- [ ] Seguir [`docs/roteiro-validacao-aluno.md`](../docs/roteiro-validacao-aluno.md) completo
- [ ] Fluxos críticos:
  - Ver conteúdo na home e abrir livro
  - Marcar leitura (em andamento / concluída)
  - Comentar / reflexão (se aplicável)
  - Minha obra: criar, capítulo, capa, publicar
  - Obras da comunidade
  - Perfil e alterar senha
- [ ] Anotar bugs

---

### Passo 3 — Corrigir bugs da validação (tempo variável)

- [ ] Priorizar: dados não aparecem, login, RLS, fluxos quebrados
- [ ] Depois: visual/responsivo
- [ ] Após cada fix: `pnpm web:build`
- [ ] **Não** fazer migration destrutiva para corrigir bug de front

---

### Passo 4 — Busca funcional (1 sessão)

- [x] Implementar busca no header
- [x] Buscar conteúdos ativos por título/autor
- [x] Página `/app/busca` para resultados completos
- [ ] Validar com aluno logado

---

### Passo 5 — Lacunas web acordadas (opcional, por prioridade)

Fazer só o que a validação exigir ou o TCC pedir:

| Item | Prioridade | Notas |
|------|------------|-------|
| Auditoria completa (todas ações admin) | Média | RS007 — ampliada nesta sessão |
| `deve_trocar_senha` no 1º login | Média | RF002 — implementado; falta `db push` na nuvem |
| Exportação dados aluno (LGPD) | Baixa | RS005 |
| Revisão responsivo admin + aluno | Média | RNF03 |
| Revisão acessibilidade (Tab, leitor) | Média | RNF11 |

---

### Passo 6 — Testes automatizados mínimos (1–2 sessões)

- [ ] `pnpm test:schemas` — schemas Zod
- [ ] RTL: `LoginForm`, `ContentCard` (ou equivalentes)
- [ ] Não bloquear mobile por falta de E2E

---

### Passo 7 — Critério “web validado” ✅

Marcar concluído quando **todos** passarem:

- [ ] Admin cria aluno → aluno loga → vê conteúdo na home
- [ ] Aluno abre livro, marca leitura, interage
- [ ] Aluno usa minha obra e publica
- [ ] Professor/admin acompanha aluno
- [ ] Recuperação de senha funciona
- [ ] `pnpm web:build` sem erro
- [ ] Matriz [`docs/validacao-requisitos.md`](../docs/validacao-requisitos.md) revisada

---

### Passo 8 — Início do app mobile (Fase 3)

**Só começar após Passo 7.**

- [ ] Ler `skills/create-feature-mobile/SKILL.md`
- [ ] Scaffold Expo em `apps/mobile`
- [ ] Mesmo Supabase nuvem (`.env` com `EXPO_PUBLIC_SUPABASE_*`)
- [ ] Paridade mínima: login → home → listagem → detalhe → leituras
- [ ] Reutilizar `@tcc-sistema/types` e `@tcc-sistema/schemas`

---

### Passo 9 — Deploy (quando você decidir — longe)

Não é prioridade agora. Quando chegar a hora:

- Frontend estático (Vite build) + Supabase já na nuvem + domínio/Cloudflare
- Ver [`docs/supabase-nuvem.md`](../docs/supabase-nuvem.md) seção “Deploy futuro”

---

## Pendências da validação

_(preencher ao rodar Passos 1 e 2)_

| # | Onde | Descrição | Status |
|---|------|-----------|--------|
| — | — | — | — |

---

## Comandos úteis (nuvem)

```bash
pnpm web:dev          # subir site local
pnpm web:build        # validar build

# Só quando houver NOVA migration (ler SQL antes!)
supabase db push
supabase functions deploy
```

---

## Referências

| Doc | Conteúdo |
|-----|----------|
| [`docs/validacao-requisitos.md`](../docs/validacao-requisitos.md) | Matriz RF/RS atualizada |
| [`docs/supabase-nuvem.md`](../docs/supabase-nuvem.md) | Nuvem + preservar dados |
| [`docs/roteiro-validacao-aluno.md`](../docs/roteiro-validacao-aluno.md) | Teste manual aluno |
| [`docs/gerenciador-roteiro-teste.md`](../docs/gerenciador-roteiro-teste.md) | Teste manual admin |
| [`docs/mvp-scope.md`](../docs/mvp-scope.md) | Escopo MVP |
| [`AGENTS.md`](../AGENTS.md) | Regras para agentes |
