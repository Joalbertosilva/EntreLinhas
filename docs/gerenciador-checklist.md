# Gerenciador web — checklist de funcionalidades

Painel em `/admin/*` para **professor** e **administrador**.

## Status: ✅ CONCLUÍDO (MVP gerenciador)

---

## ✅ Implementado

| RF | Funcionalidade | Rota |
|----|----------------|------|
| RF001/003 | Cadastrar usuários (senha + confirmar + mostrar) | `/admin/usuarios` |
| RF003 | Ativar/desativar usuários | `/admin/usuarios` |
| RF003 | Editar nome/perfil de usuário | `/admin/usuarios` |
| RF004 | CRUD conteúdos (create, read, update, delete) | `/admin/conteudos` |
| RF004 | Upload de capa (Storage bucket `covers`) | `/admin/conteudos` |
| RF005 | CRUD temas por conteúdo (incl. delete) | `/admin/conteudos/:id` |
| RF006 | CRUD materiais por conteúdo (incl. delete) | `/admin/conteudos/:id` |
| RF014 | Visão geral (contadores) — admin | `/admin` |
| RF014 | Logs de auditoria | `/admin/auditoria` |
| RF015 | Perfil + alterar senha (com senha atual) | `/admin/perfil` |
| RF013 | Acompanhamento de alunos (evolução) | `/admin/alunos` |
| RNF11 | Acessibilidade base (skip link, landmarks, forms) | todas |
| RS007 | Auditoria em ações de conteúdo/usuário | `/admin/auditoria` |

---

## Validação

Roteiro manual: **`docs/gerenciador-roteiro-teste.md`**

Testes automatizados (schemas): `pnpm test`

---

## ❌ Fora do gerenciador (próxima fase)

| RF | Destino |
|----|---------|
| RF007–RF012 | Plataforma aluno `/app/*` |
| Link “Plataforma” no menu | Junto com `/app/*` |

---

## Perfis

| Área | Admin | Professor |
|------|-------|-----------|
| Início | ✅ stats completos | ✅ resumo |
| Conteúdos | ✅ | ✅ |
| Alunos | ✅ | ✅ |
| Usuários | ✅ | ❌ |
| Auditoria | ✅ | ❌ |
| Perfil / senha | ✅ | ✅ |
