# Roteiro de validação — plataforma aluno (`/app`)

Checklist manual para validar RF007–RF012 na web **antes** de iniciar o app mobile.

**Pré-requisitos:**

- `pnpm web:dev` rodando
- `.env.local` apontando para Supabase **nuvem**
- Admin já cadastrou pelo menos **1 conteúdo ativo** (ex.: livro com capa)
- Usuário **aluno** ativo (criado em `/admin/usuarios`)

Marque ✅ / ❌ e anote bugs em `session/current.md` → “Pendências da validação”.

---

## 1. Autenticação

| # | Teste | ✅ |
|---|-------|---|
| 1.1 | Login aluno → redireciona para `/app` | |
| 1.2 | Logout e login novamente — conteúdos continuam visíveis | |
| 1.3 | Aluno inativo não entra | |
| 1.4 | Esqueci senha → fluxo até staff atender | |

---

## 2. Home (`/app`)

| # | Teste | ✅ |
|---|-------|---|
| 2.1 | Saudação com nome do aluno | |
| 2.2 | Card “Continue sua obra” (vazio ou com obra) | |
| 2.3 | Destaques: conteúdo real + placeholders “Em breve” | |
| 2.4 | Menu pill (Livros, Crônicas, …) navega e anima | |
| 2.5 | Seções de catálogo abaixo (Livros, Crônicas, …) | |
| 2.6 | Conteúdo cadastrado no admin **aparece** (não só placeholders) | |

---

## 3. Listagem por tipo

| # | Teste | ✅ |
|---|-------|---|
| 3.1 | `/app/livros` — lista conteúdos tipo livro | |
| 3.2 | `/app/cronicas` — idem | |
| 3.3 | `/app/poemas` — idem | |
| 3.4 | `/app/musicas` — idem | |
| 3.5 | Clicar card abre detalhe | |

---

## 4. Detalhe do conteúdo (`/app/conteudos/:id`)

| # | Teste | ✅ |
|---|-------|---|
| 4.1 | Capa, título, autor, texto/resumo carregam | |
| 4.2 | Temas e materiais complementares (se houver) | |
| 4.3 | Reflexão orientada (livro) | |
| 4.4 | Comentários — publicar, editar, excluir próprio | |
| 4.5 | Curtir conteúdo | |
| 4.6 | Marcar leitura: em andamento / concluída | |

---

## 5. Minhas leituras (`/app/minhas-leituras`)

| # | Teste | ✅ |
|---|-------|---|
| 5.1 | Livro marcado “em andamento” aparece | |
| 5.2 | Livro concluído aparece na aba correta | |
| 5.3 | Menu ⋯ no card funciona | |

---

## 6. Minha obra (`/app/minha-obra`)

| # | Teste | ✅ |
|---|-------|---|
| 6.1 | Criar obra (livro / crônica / poema) | |
| 6.2 | Adicionar capítulo / texto | |
| 6.3 | Upload ou capa padrão | |
| 6.4 | Salvar rascunho persiste após reload | |
| 6.5 | Publicar obra | |

---

## 7. Obras da comunidade

| # | Teste | ✅ |
|---|-------|---|
| 7.1 | Obra publicada aparece na home / seção pública | |
| 7.2 | Abrir obra de outro aluno (se houver) | |

---

## 8. Perfil (`/app/perfil`)

| # | Teste | ✅ |
|---|-------|---|
| 8.1 | Dados do perfil corretos | |
| 8.2 | Alterar senha com senha atual | |
| 8.3 | Nova senha funciona no próximo login | |

---

## 9. Mobile web (viewport estreito)

| # | Teste | ✅ |
|---|-------|---|
| 9.1 | Menu hambúrguer abre drawer | |
| 9.2 | Navegação entre seções | |
| 9.3 | Carrosséis rolam | |
| 9.4 | Formulários usáveis | |

---

## 10. Privacidade

| # | Teste | ✅ |
|---|-------|---|
| 10.1 | Link `/privacidade` no rodapé abre | |
| 10.2 | Link nas telas de login | |

---

## Resultado

- **Data:** ___________
- **Aluno testado:** ___________
- **Bloqueadores:** ___________
- **Pronto para Passo 3 (correções)?** Sim / Não
