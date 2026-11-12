# Sessão atual — tcc-sistema / EntreLinhas

> Última atualização: **2026-11-05**  
> **Fase:** MVP completo (web + mobile) → **ensaio de apresentação**  
> **Deploy:** pós-apresentação (site roda em `localhost` + Supabase nuvem)

---

## Fase atual

```
Backend ✅  →  Web ✅  →  Mobile ✅  →  Apresentação 🔄  →  Deploy ⏳
```

**Foco imediato (retomar):** splash **nativa** mobile + handoff para `AnimatedSplash` — branch `feat/mobile-melhorar-splash-nativa` (**alterações locais, ainda sem commit**).

**Foco geral:** ensaio com [`docs/roteiro-apresentacao.md`](../docs/roteiro-apresentacao.md); matriz em [`docs/validacao-requisitos.md`](../docs/validacao-requisitos.md).

---

## 🔄 Em andamento — splash nativa mobile (EntreLinhas)

### Objetivo do usuário

Melhorar só a **launch screen nativa** (`expo-splash-screen`), **sem** reescrever a splash animada em `app/index.tsx` + `src/components/splash/*`. Ideal: sensação de que a **animação de carregamento** (livro + dots) começa na abertura.

### Limite técnico (importante na próxima sessão)

Antes do JavaScript carregar, iOS/Android só permitem **cor sólida ou imagem estática** — não roda Reanimated/Lottie na launch screen nativa. A animação real continua sendo a **`AnimatedSplash`** assim que o bundle sobe; a estratégia é **manter a nativa visível por cima** até a animação estar pintada e então `hideAsync`.

### O que já foi feito (código local)

| Área | Mudança |
|------|---------|
| `apps/mobile/src/lib/brandTheme.ts` | `SPLASH_NATIVE_BG = '#f8fbfe'` (topo do gradiente da splash animada) |
| `apps/mobile/src/lib/nativeSplash.ts` | **Novo** — `hideNativeSplashOnce()`, `configureNativeSplashFade()` |
| `apps/mobile/app.json` | `expo.splash` + plugin `expo-splash-screen` com logo e `#f8fbfe`; `icon` / manifest |
| `apps/mobile/app/_layout.tsx` | `preventAutoHideAsync`; **não** chama mais `hideAsync` aqui; fundo `SPLASH_NATIVE_BG` |
| `apps/mobile/app/index.tsx` | Fundo alinhado à handoff |
| `AnimatedSplash.tsx` | `hideNativeSplashOnce` no `onLayout` da tela; fallback 8s |
| `SplashBookHero.tsx` | Prop `launchHandoff` — livro visível no 1º frame + loops de carregamento |
| `SplashLoadingCaption.tsx` | Dots/caption aparecem mais cedo (delay 200ms) |
| `assets/images/app-icon-manifest.png` | Ícone 1024 para manifest (favicon sobre `#f8fbfe`) |

### Problema reportado pelo usuário

“Ainda não está indo” — quer animação na launch screen. Handoff foi ajustado; **falta validar cold start** no dispositivo (Expo Go vs dev build).

**2026-11-06 — causa comum “tudo branco + EntreLinhas no meio”:** no **Expo Go** a splash **não** segue o `app.json` do projeto; o cliente mostra **ícone + nome do app** no centro. Para ver logo + cor da nativa, usar **dev build** (`expo prebuild` + `expo run:android` / `run:ios`). O `app.json` foi atualizado com **imagem** (`entrelinhas-logo.png`) + plugin para builds nativos.

**2026-11-06 — ícone “invisível” no Expo Go:** `favicon.png` tem **muita transparência**; **`app-icon-manifest.png`** (favicon sobre **`#f8fbfe`**) para manifest. O Go ainda pode **cachear** — build nativo garante.

**2026-11-06 — atraso Expo Go → `AnimatedSplash`:** o `_layout` bloqueava o **`Stack` até as fontes** — a rota `/` não montava. Corrigido com **`FontsProvider`** (fontes em paralelo, sem bloquear rotas).

**2026-11-06 — ritmo final (pedido do usuário):** tela do **Expo Go** some **logo** ao montar `/` (`hideNativeSplashOnce`); **`AnimatedSplash` no mínimo 3 s** antes de `exiting` (`MIN_ANIMATED_SPLASH_VISIBLE_MS`); saída com **marca/textos mais rápidos** (`AnimatedSplash`).

**2026-11-06 — Expo Go “tela branca + EntreLinhas”:** não é `splash.image`; o Go usa **`icon` do manifest** (nome muda sempre; ícone vem de **URL**, sujeito a **cache**). Asset **`app-icon-manifest.png`** = **favicon** sobre **`#f8fbfe`** (ícone do app, não wordmark); novo **nome de arquivo** para bust de cache; `version` **1.0.6**.

**2026-11-06 — Resolução definitiva (qualquer celular):** Expo Go **não** garante ícone/splash nativos como produto final. Documentado [`docs/mobile-dev-build.md`](../docs/mobile-dev-build.md) + scripts raiz `pnpm mobile:run:ios` / `pnpm mobile:run:android` (build nativo; ícone + splash do `app.json` embutidos).

### Próximos passos (checklist)

- [ ] Cold start: `pnpm mobile:dev -- --clear` — fechar app por completo e reabrir
- [ ] Se ainda aparecer splash antiga com ícone: `cd apps/mobile && npx expo prebuild --clean && npx expo run:android` (ou `run:ios`)
- [ ] Confirmar sequência: fundo `#f8fbfe` → livro virando + “Abrindo sua biblioteca” + dots (sem flash branco)
- [ ] **Expo Go:** plugin customizado pode não refletir tudo; dev build para launch screen “de produção”
- [ ] Opcional (se quiser frame estático antes do JS): PNG do livro na nativa + animação em seguida (art/script)
- [x] PNGs experimentais removidos do repo (`splash-icon` raíz, `expo-go-icon` não referenciado)
- [ ] Commit / merge na branch conforme fluxo `/git`

### Comandos de teste

```bash
cd ~/Documentos/Projeto-tcc/tcc-sistema
pnpm mobile:dev -- --clear
```

Rebuild nativo (se necessário):

```bash
cd apps/mobile
npx expo prebuild --clean
npx expo run:android   # ou run:ios
```

### Git

- Branch: `feat/mobile-melhorar-splash-nativa` (base `develop`)
- Status: modificações listadas acima + arquivos untracked — **sem commit/push**

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
Usuários, conteúdos, temas, materiais, alunos, obras, recuperação de senha, **auditoria painel completo** (cards, gráficos, timeline, fluxo, CSV), perfil.

Roteiro: [`docs/gerenciador-roteiro-teste.md`](../docs/gerenciador-roteiro-teste.md)

### Plataforma aluno `/app` — ✅
Home, vitrines, destaques, detalhe de conteúdo, leituras, minha obra, obras públicas, perfil, senha, interações/comentários, curtidas, busca.

Roteiro: [`docs/roteiro-validacao-aluno.md`](../docs/roteiro-validacao-aluno.md)

### App mobile `apps/mobile` — ✅ (splash nativa 🔄)
Tabs (Início, Explorar, Leituras, Pesquisa), leitor paginado, engajamento, minha obra, progresso, acessibilidade (TTS, font scale), **splash animada** (`AnimatedSplash`), handoff com splash nativa em ajuste (ver seção acima), navegação stack + voltar.

Ver: [`apps/mobile/README.md`](../apps/mobile/README.md)

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
| Auditoria completa (todas ações admin) | ✅ | RS007 — painel Fase 2 (cards, gráficos, timeline, fluxo senha, CSV, detalhe lateral) |
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

- [x] Admin cria aluno → aluno loga → vê conteúdo na home — **agente:** código + browser (`/admin`, `/app`, O Pequeno Príncipe); **usuário:** validando
- [x] Aluno abre livro, marca leitura, interage — **agente:** leitor paginado 5 pág., reflexão, comentários, curtir; **usuário:** validando
- [x] Aluno usa minha obra e publica — **agente:** wiring completo (`MinhaObraEditorPage`, migration categoria); obra “Obra de Joao” na comunidade; **usuário:** validando
- [x] Professor/admin acompanha aluno — **agente:** `/admin/alunos` lista ayres.aluno + joao.exemplo; **usuário:** validando
- [x] Recuperação de senha funciona — **agente:** fluxo `esqueci-senha` → Edge Function + `/admin/requerimentos-senha`; **usuário:** validando
- [x] `pnpm web:build` sem erro — **agente:** 2026-09-11 ✅
- [x] `pnpm test:schemas` — **agente:** 8 testes ✅ (2026-09-11)
- [x] Matriz [`docs/validacao-requisitos.md`](../docs/validacao-requisitos.md) revisada — **agente:** 2026-09-11

**Passo 7:** ✅ Web validado + painel auditoria Fase 2 → **iniciar Passo 8 (mobile)**.

---

### Passo 8 — Início do app mobile (Fase 3) 🔄

- [x] Ler `skills/create-feature-mobile/SKILL.md`
- [x] Scaffold Expo SDK **57** em `apps/mobile` (NativeWind, Expo Router, hoisted pnpm — alinhado ao Expo Go 57 no iPhone)
- [x] Mesmo Supabase nuvem (`.env` com `EXPO_PUBLIC_SUPABASE_*`)
- [x] Splash animado + login + tabs inferiores + assets (logo/favicon)
- [x] Home com vitrines (destaques, livros, crônicas, músicas, poemas)
- [x] Detalhe básico de conteúdo (`/(aluno)/conteudo/[id]`)
- [ ] Explorar / Leituras / Perfil com paridade web
- [ ] Leitor paginado (livros) + trocar senha + esqueci senha
- [ ] Testar no dispositivo com **Expo Go 57.x** (`pnpm mobile:dev`)

**Comando mobile:**

```bash
pnpm mobile:dev
```

---

### Passo 9 — Deploy (quando você decidir — longe)

Não é prioridade agora. Quando chegar a hora:

- Frontend estático (Vite build) + Supabase já na nuvem + domínio/Cloudflare
- Ver [`docs/supabase-nuvem.md`](../docs/supabase-nuvem.md) seção “Deploy futuro”

---

## Pendências da validação

| # | Onde | Descrição | Status |
|---|------|-----------|--------|
| S1 | Segurança | Erros Supabase crus em alguns dialogs admin/storage | 🔄 pós-Passo 7 |
| S2 | RLS | `obra_curtidas_select USING (true)` — expõe likes a autenticados | 🔄 baixa prioridade |
| S3 | LGPD | Exportação dados aluno + DPO institucional (RS005) | ⏳ banca/instituição |
| S4 | Testes | RTL LoginForm + ContentCard (Passo 6) | ⏳ não bloqueia mobile |
| S5 | RNF | Responsivo + a11y Tab/leitor revisão formal | 🔄 Passo 5 |

### Correções LGPD/segurança aplicadas (2026-09-11)

- Login conta inativa → mesma mensagem genérica que credenciais inválidas (RS001)
- “Excluir” conteúdo/tema/material no admin → **soft delete** (`status: false`) — RS006

### Painel de auditoria — Fase 2 completa (2026-09-11)

- **Cards:** eventos hoje, pedidos senha pendentes, usuários criados, conteúdos alterados
- **Gráficos:** barras por categoria + atividade 14 dias (CSS, sem lib extra)
- **Abas:** Lista · Linha do tempo · Fluxo de senha (diagrama interativo)
- **Detalhe lateral:** painel Summary ao clicar num registro
- **Exportar CSV** dos registros filtrados
- Badge no menu **Recuperação de senha**
- Fluxo aluno **inalterado** (esqueci-senha → professor atende)

**Nuvem (se ainda não aplicou):**

```bash
pnpm db:push
pnpm exec supabase functions deploy request-password-reset
```

---

## Comandos úteis (nuvem)

```bash
pnpm web:dev          # subir site local
pnpm web:build        # validar build
pnpm mobile:dev       # app mobile (Expo ~58)
pnpm mobile:dev -- --clear   # limpar cache Metro (splash/handoff)

# Só quando houver NOVA migration (ler SQL antes!)
pnpm db:push
pnpm exec supabase functions deploy <nome-da-function>
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
