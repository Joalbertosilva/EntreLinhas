# Validação de requisitos — tcc-sistema

Matriz viva: o que **já atende**, o que **parcialmente atende** e o que **falta** para o MVP.

Legenda: ✅ implementado · 🔄 parcial · ⏳ pendente · ❌ fora do MVP

> **Atualizado:** 2026-09-29 — Web admin + aluno validados; app mobile implementado (Expo SDK 57); pendências: deploy, LGPD formal, testes E2E e auditoria a11y/responsivo completa.

---

## Requisitos funcionais

| RF | Descrição | Gerenciador | Aluno web | App mobile | Notas |
|----|-----------|-------------|-----------|------------|-------|
| RF001 | Cadastro de usuários (admin) | ✅ | — | — | Edge Function `create-user`; gerenciador só na web |
| RF002 | Login | ✅ | ✅ | ✅ | Redirect por perfil + troca obrigatória (`/trocar-senha`) |
| RF003 | Gerenciar usuários | ✅ | — | — | Criar, editar, ativar/desativar, redefinir senha |
| RF004 | CRUD conteúdos | ✅ | ✅ | ✅ | Aluno consulta; staff edita na web |
| RF005 | Temas | ✅ | ✅ | ✅ | Detalhe do conteúdo |
| RF006 | Materiais | ✅ | ✅ | ✅ | Links no detalhe |
| RF007 | Consulta/pesquisa conteúdos | — | ✅ | ✅ | Web: home + `/app/busca`; mobile: Explorar + Pesquisa |
| RF008 | Interações | — | ✅ | ✅ | Comentários, reflexão, curtidas; excluir próprias interações |
| RF009 | Leitura | — | ✅ | ✅ | Status em cards; aba Leituras no mobile |
| RF010 | Evolução | ✅ | ✅ | ✅ | Progresso, XP/nível; admin em `/admin/alunos` |
| RF011 | Produções | — | ✅ | ✅ | Via minha obra (capítulos/itens) |
| RF012 | Obra autoral | — | ✅ | ✅ | Minha obra + publicar + obras comunidade |
| RF013 | Acompanhamento alunos | ✅ | — | — | `/admin/alunos` |
| RF014 | Visão admin | ✅ | — | — | Dashboard + auditoria |
| RF015 | Perfil / senha | ✅ | ✅ | ✅ | Web + mobile; staff com link ao painel web |

**Gerenciador web:** RF001–RF006, RF013–RF015 ✅  
**Aluno web:** RF002, RF004–RF012, RF015 ✅  
**App mobile (aluno):** RF002, RF004–RF012, RF015 ✅  
**Próximo:** ensaio de apresentação → [`docs/roteiro-apresentacao.md`](./roteiro-apresentacao.md)

---

## Requisitos não funcionais

| RNF | Status | Evidência |
|-----|--------|-----------|
| RNF01 Interface intuitiva | ✅ | Validado web + mobile (navegação tabs/stack, drawer, leitor) |
| RNF02 Erros claros | ✅ | Toasts + `FieldError` em PT |
| RNF03 Responsivo | 🔄 | Web responsiva parcial; mobile nativo com insets centralizados (`layout.ts`, `TabScrollView`) — revisar devices Android variados |
| RNF04 Compatibilidade | 🔄 | Web: Vite/React; mobile: Expo Go 57 — teste manual em iOS + Android |
| RNF05 Desempenho | 🔄 | TanStack Query; splash encurtada; sem profiling formal |
| RNF06 Integridade | ✅ | Postgres + RLS + Zod |
| RNF07 Disponibilidade | ⏳ | Localhost + Supabase nuvem; deploy produção pendente |
| RNF08 Backup | 🔄 | Backups Supabase; ver [`supabase-nuvem.md`](./supabase-nuvem.md) |
| RNF09 Consistência app/web | 🔄 | Paridade aluno ~90% (mobile + web); gerenciador **somente web** (decisão de escopo) |
| RNF10 Legibilidade | ✅ | Design system, PT claro, Plus Jakarta Sans |
| RNF11 Acessibilidade | 🔄 | Web: skip link, toolbar; mobile: TTS, font scale, leitura da tela, FAB a11y — auditoria formal pendente |

---

## Segurança e LGPD

| RS | Status | Evidência |
|----|--------|-----------|
| RS001 Auth segura | ✅ | Supabase Auth, JWT, logout |
| RS002 Isolamento alunos | ✅ | RLS `auth.uid()` |
| RS003 RBAC | ✅ | RLS + guards rotas admin |
| RS004 Sem vazamento | ✅ | Login genérico; conta inativa sem enumeração |
| RS005 LGPD | 🔄 | `/privacidade` ok; falta export formal, DPO (institucional) |
| RS006 Integridade/soft delete | ✅ | Usuários + conteúdos/temas/materiais via `status: false` |
| RS007 Auditoria | ✅ | Painel: cards, gráficos, timeline, fluxo senha, CSV |
| RS008 Links externos | 🔄 | Zod URL; whitelist futura |
| RS009 Privacidade interações | ✅ | RLS reflexões privadas; delete próprio (migration 20260923180000) |
| RS010 Incidentes | ⏳ | Procedimento institucional |

### LGPD — feito

- Página [`/privacidade`](./privacidade) (web)
- Princípios em `docs/security.md`
- Sem diagnóstico automático (RF008)

### LGPD — pendente

- [ ] Texto institucional formal (banca/instituição)
- [ ] DPO/contato titulares
- [ ] Exportação de dados do aluno (admin)

---

## Testes automatizados

| Tipo | Status |
|------|--------|
| Vitest schemas | ✅ `pnpm test:schemas` — 8 testes |
| `pnpm web:build` | ✅ build de produção web |
| RTL componentes | ⏳ LoginForm, ContentCard |
| RLS manual | 🔄 validado na implantação |
| E2E | ⏳ |
| Mobile (RNTL) | ⏳ |

---

## Migrations Supabase

| Item | Status |
|------|--------|
| Migrations locais | 24 arquivos em `supabase/migrations/` |
| Nuvem | Sincronizadas (`pnpm db:push` quando houver novas) |
| Última relevante | `20260923180000_interacoes_delete_own.sql` |

---

## Como validar antes da apresentação

1. [`docs/roteiro-apresentacao.md`](./roteiro-apresentacao.md) — **roteiro único** (orientador + stakeholder)
2. [`docs/gerenciador-roteiro-teste.md`](./gerenciador-roteiro-teste.md) — admin/professor
3. [`docs/roteiro-validacao-aluno.md`](./roteiro-validacao-aluno.md) — aluno web
4. [`docs/perguntas-banca.md`](./perguntas-banca.md) — perguntas prováveis e respostas
5. [`docs/security.md`](./security.md) — checklist segurança
6. [`docs/acessibilidade.md`](./acessibilidade.md) — Tab e leitor

**Mobile (ensaio opcional):** `pnpm mobile:dev` + Expo Go 57 na mesma rede; ver [`apps/mobile/README.md`](../apps/mobile/README.md).

---

## Veredito para apresentação (2026-09-29)

| Público | Avaliação |
|---------|-----------|
| Orientador (TCC) | ✅ **Apto** — escopo MVP atendido, arquitetura documentada, ressalvas explícitas |
| Stakeholder (produto) | ✅ **Apto com demo ensaiada** — valor de negócio demonstrável na web; mobile como diferencial |
| Produção / deploy público | ⏳ **Não apto ainda** — depende de deploy, LGPD formal e testes E2E |

---

## Próximas entregas (pós-apresentação)

- Deploy web (Vercel/Netlify + domínio institucional)
- Atualizar textos LGPD institucionais
- CI básico (build + schemas)
- Testes E2E do fluxo crítico (login → leitura → obra)

Ver também [`session/current.md`](../session/current.md).
