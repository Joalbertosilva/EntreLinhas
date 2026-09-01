# Validação de requisitos — tcc-sistema

Matriz viva: o que **já atende**, o que **parcialmente atende** e o que **falta** para o MVP.

Legenda: ✅ implementado · 🔄 parcial · ⏳ pendente · ❌ fora do MVP

---

## Requisitos funcionais

| RF | Descrição | Gerenciador | Plataforma aluno | Notas |
|----|-----------|-------------|------------------|-------|
| RF001 | Cadastro de usuários (admin) | ✅ | — | Edge Function `create-user` |
| RF002 | Login | ✅ | ⏳ | Aluno redirecionado; `/app` não existe |
| RF003 | Gerenciar usuários | ✅ | — | Criar, editar, ativar/desativar |
| RF004 | CRUD conteúdos | ✅ | ⏳ | Aluno só consultará (RF007) |
| RF005 | Temas | ✅ | ⏳ | |
| RF006 | Materiais | ✅ | ⏳ | |
| RF007 | Consulta/pesquisa conteúdos | — | ⏳ | **Próxima fase** `/app/*` |
| RF008 | Interações | — | ⏳ | Tabela + RLS prontos |
| RF009 | Leitura | — | ⏳ | |
| RF010 | Evolução | 🔄 | ⏳ | View `evolucao_aluno`; aluno vê no perfil |
| RF011 | Produções | — | ⏳ | |
| RF012 | Obra autoral | — | ⏳ | |
| RF013 | Acompanhamento alunos | ✅ | — | `/admin/alunos` |
| RF014 | Visão admin | ✅ | — | Dashboard + auditoria |
| RF015 | Perfil / senha | ✅ | ⏳ | Gerenciador ok; aluno no `/app` |

**Gerenciador:** RF001–RF006, RF013–RF015 ✅  
**Sistema completo:** falta RF007–RF012 (área do aluno)

---

## Requisitos não funcionais

| RNF | Status | Evidência |
|-----|--------|-----------|
| RNF01 Interface intuitiva | 🔄 | Gerenciador usável; app aluno pendente |
| RNF02 Erros claros | ✅ | Toasts + `FieldError` em PT |
| RNF03 Responsivo | 🔄 | Layout mobile no admin; falta testar todas as telas |
| RNF04 Compatibilidade | 🔄 | Vite/React modernos; teste manual pendente |
| RNF05 Desempenho | 🔄 | TanStack Query; sem profiling formal |
| RNF06 Integridade | ✅ | Postgres + RLS + Zod |
| RNF07 Disponibilidade | ⏳ | Depende deploy institucional |
| RNF08 Backup | 🔄 | Supabase backups; política institucional |
| RNF09 Consistência app/web | ⏳ | Mobile não iniciado |
| RNF10 Legibilidade | ✅ | Design system, 15px+, PT claro |
| RNF11 Acessibilidade | 🔄 | Base implementada; ver `docs/acessibilidade.md` |

---

## Segurança e LGPD

| RS | Status | Evidência |
|----|--------|-----------|
| RS001 Auth segura | ✅ | Supabase Auth, hash, logout |
| RS002 Isolamento alunos | ✅ | RLS `auth.uid()` |
| RS003 RBAC | ✅ | RLS + guards nas rotas admin |
| RS004 Sem vazamento | 🔄 | Erros genéricos no login; revisar logs |
| RS005 LGPD | 🔄 | Princípios em `docs/security.md`; falta política/página institucional |
| RS006 Integridade/soft delete | 🔄 | Soft delete usuários/conteúdos; hard delete conteúdo com confirmação |
| RS007 Auditoria | 🔄 | Tabela + UI; nem todas ações admin logam ainda |
| RS008 Links externos | 🔄 | Zod URL; whitelist futura |
| RS009 Privacidade interações | ✅ | RLS restritivo (quando aluno usar) |
| RS010 Incidentes | ⏳ | Procedimento institucional |

### LGPD — o que já temos

- **Minimização:** só nome, login, perfil, atividades pedagógicas
- **Finalidade documentada** em `docs/security.md`
- **Sem diagnóstico psicológico automático** (RF008)
- **Retenção:** usuários inativos permanecem (soft delete), conforme RF001

### LGPD — o que falta para produção

- [ ] Termo/política de privacidade (texto institucional)
- [ ] Registro de consentimento (se exigido pela instituição)
- [ ] DPO/contato para titulares de dados
- [ ] Exportação/exclusão formal sob demanda (processo admin)

---

## Variáveis e segredos

| Item | Status |
|------|--------|
| `.env.local` no gitignore | ✅ |
| Service role só na Edge Function | ✅ |
| Anon key no client (esperado) | ✅ |
| Senhas nunca em logs/audit | ✅ |
| Validação Zod compartilhada (`packages/schemas`) | ✅ |

---

## Arquitetura de código (POO / encapsulamento)

Este projeto **não usa herança de classes** como eixo — padrão **TypeScript + composição**, que é o adequado para React:

| Conceito | Como aparece no projeto |
|----------|-------------------------|
| **Encapsulamento** | `packages/schemas` (validação), `lib/storage.ts`, Edge Functions |
| **Separação de camadas** | UI → hooks/queries → Supabase → RLS |
| **Contratos** | `packages/types` + Zod infer |
| **Herança clássica** | Não aplicada de propósito — composição de componentes |

Adicionar classes só onde agregar valor (ex.: domínio complexo no backend), não por dogma de POO.

---

## Testes automatizados

| Tipo | Status |
|------|--------|
| Vitest schemas | ⏳ planejado em `mvp-scope.md` |
| RTL componentes | ⏳ |
| RLS manual (Studio) | 🔄 feito na implantação backend |
| E2E | ⏳ |

---

## Como validar antes de entregar o TCC

1. **Roteiro manual** — percorrer cada RF do gerenciador com admin e professor
2. **Checklist** — `docs/gerenciador-checklist.md`
3. **Segurança** — `docs/security.md` checklist
4. **Acessibilidade** — Tab pelo gerenciador + `docs/acessibilidade.md`
5. **Próximo:** implementar `/app/*` e repetir matriz para RF007–RF012

---

## Próxima entrega

Ver `docs/plano-plataforma-aluno.md` — home e fluxo do aluno conectados ao banco.
