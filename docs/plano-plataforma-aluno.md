# Plano — Plataforma do aluno (`/app/*`)

> **Status (2026-09-01):** ✅ **Implementada na web** — fase atual é **validação manual**, não construção greenfield.  
> Roteiro: [`roteiro-validacao-aluno.md`](./roteiro-validacao-aluno.md)  
> Passo a passo geral: [`session/current.md`](../session/current.md)

---

## Objetivo (atingido na web)

Entregar RF007–RF012 para o perfil **aluno** na web, antes do mobile.

---

## Rotas implementadas

| Rota | RF | Status |
|------|-----|--------|
| `/app` | RF007 | ✅ Home, vitrines, destaques |
| `/app/livros`, `/cronicas`, `/poemas`, `/musicas` | RF007 | ✅ |
| `/app/conteudos/$id` | RF007–RF009 | ✅ Detalhe, leitura, interações |
| `/app/minhas-leituras` | RF009 | ✅ |
| `/app/minha-obra` | RF011–RF012 | ✅ Editor + publicar |
| `/app/obras/$id` | RF012 | ✅ Obras públicas |
| `/app/perfil`, `/app/perfil/senha` | RF015 | ✅ |

---

## Pendente na web (pós-validação)

| Item | RF | Prioridade |
|------|-----|------------|
| Busca no header | RF007 | Alta |
| Evolução completa no perfil aluno | RF010 | Média |
| Revisão responsivo + a11y | RNF | Média |

---

## Layout (como ficou)

- Top nav + menu pill na home + drawer mobile
- Design system CESMAC (`docs/design-system.md`)
- Tema claro fixo

---

## Backend (nuvem)

Mesmas tabelas documentadas em [`database.md`](./database.md). Dados em Supabase cloud — **não resetar**.

---

## Próximo: mobile

Após critério “web validado” em `session/current.md`:

- Scaffold `apps/mobile` (Expo)
- Paridade mínima com `/app`
- Mesmo Supabase nuvem

Skill: `skills/create-feature-mobile/SKILL.md`
