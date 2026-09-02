# Validação de requisitos — tcc-sistema

Matriz viva: o que **já atende**, o que **parcialmente atende** e o que **falta** para o MVP.

Legenda: ✅ implementado · 🔄 parcial · ⏳ pendente · ❌ fora do MVP

> **Atualizado:** 2026-09-01 — plataforma `/app` implementada; falta **validação manual** e lacunas pontuais.

---

## Requisitos funcionais

| RF | Descrição | Gerenciador | Plataforma aluno | Notas |
|----|-----------|-------------|------------------|-------|
| RF001 | Cadastro de usuários (admin) | ✅ | — | Edge Function `create-user` |
| RF002 | Login | ✅ | ✅ | Redirect por perfil + troca obrigatória (`/trocar-senha`) |
| RF003 | Gerenciar usuários | ✅ | — | Criar, editar, ativar/desativar, redefinir senha |
| RF004 | CRUD conteúdos | ✅ | ✅ | Aluno consulta via RF007 |
| RF005 | Temas | ✅ | ✅ | Detalhe do conteúdo |
| RF006 | Materiais | ✅ | ✅ | Links no detalhe |
| RF007 | Consulta/pesquisa conteúdos | — | ✅ | Home + rotas por tipo + busca header + `/app/busca` |
| RF008 | Interações | — | ✅ | Comentários + reflexão orientada |
| RF009 | Leitura | — | ✅ | Minhas leituras, status em cards |
| RF010 | Evolução | 🔄 | 🔄 | View `evolucao_aluno`; admin vê; aluno parcial no perfil |
| RF011 | Produções | — | ✅ | Via minha obra (capítulos/itens) |
| RF012 | Obra autoral | — | ✅ | Minha obra + publicar + obras comunidade |
| RF013 | Acompanhamento alunos | ✅ | — | `/admin/alunos` |
| RF014 | Visão admin | ✅ | — | Dashboard + auditoria |
| RF015 | Perfil / senha | ✅ | ✅ | `/admin/perfil`, `/app/perfil` |

**Gerenciador:** RF001–RF006, RF013–RF015 ✅  
**Aluno web:** RF002, RF004–RF009, RF011–RF012, RF015 ✅ · RF010 🔄  
**Próximo:** validar manualmente → [`docs/roteiro-validacao-aluno.md`](./roteiro-validacao-aluno.md)

---

## Requisitos não funcionais

| RNF | Status | Evidência |
|-----|--------|-----------|
| RNF01 Interface intuitiva | 🔄 | Gerenciador ok; aluno implementado — validar com usuários |
| RNF02 Erros claros | ✅ | Toasts + `FieldError` em PT |
| RNF03 Responsivo | 🔄 | Mobile web (hamburger); revisar todas telas |
| RNF04 Compatibilidade | 🔄 | Vite/React; teste manual pendente |
| RNF05 Desempenho | 🔄 | TanStack Query; sem profiling formal |
| RNF06 Integridade | ✅ | Postgres + RLS + Zod |
| RNF07 Disponibilidade | ⏳ | Local + Supabase nuvem; deploy longe |
| RNF08 Backup | 🔄 | Backups Supabase; ver [`supabase-nuvem.md`](./supabase-nuvem.md) |
| RNF09 Consistência app/web | ⏳ | Mobile (`apps/mobile`) não iniciado |
| RNF10 Legibilidade | ✅ | Design system, PT claro |
| RNF11 Acessibilidade | 🔄 | Skip link, landmarks; revisar leitor e Tab |

---

## Segurança e LGPD

| RS | Status | Evidência |
|----|--------|-----------|
| RS001 Auth segura | ✅ | Supabase Auth, JWT, logout |
| RS002 Isolamento alunos | ✅ | RLS `auth.uid()` |
| RS003 RBAC | ✅ | RLS + guards rotas admin |
| RS004 Sem vazamento | 🔄 | Erros genéricos no login |
| RS005 LGPD | 🔄 | `/privacidade` ok; falta export formal, DPO |
| RS006 Integridade/soft delete | 🔄 | Soft delete usuários/conteúdos |
| RS007 Auditoria | 🔄 | UI + logs ampliados (conteúdos, usuários, temas, materiais) |
| RS008 Links externos | 🔄 | Zod URL; whitelist futura |
| RS009 Privacidade interações | ✅ | RLS reflexões privadas |
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
| Vitest schemas | ⏳ `pnpm test:schemas` |
| RTL componentes | ⏳ LoginForm, ContentCard |
| RLS manual | 🔄 feito na implantação |
| E2E | ⏳ |

---

## Como validar antes do mobile

1. [`docs/gerenciador-roteiro-teste.md`](./gerenciador-roteiro-teste.md) — admin/professor
2. [`docs/roteiro-validacao-aluno.md`](./roteiro-validacao-aluno.md) — aluno
3. [`docs/security.md`](./security.md) — checklist segurança
4. [`docs/acessibilidade.md`](./acessibilidade.md) — Tab e leitor
5. Corrigir bugs → Passo 3 em [`session/current.md`](../session/current.md)
6. **Só então** iniciar `apps/mobile`

---

## Próxima entrega

Ver [`session/current.md`](../session/current.md) — passo a passo completo até o app mobile.
