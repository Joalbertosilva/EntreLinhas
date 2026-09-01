# Escopo do MVP — tcc-sistema

O que pertence e o que **não** pertence à primeira versão.

## ✅ Dentro do MVP

### Infraestrutura

- Monorepo pnpm workspaces
- **Docker + Docker Compose** — backend Supabase local em containers
- Supabase CLI (`supabase start`, migrations, Edge Functions)
- Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions)
- TypeScript em todo o projeto
- Documentação (docs/, AGENTS.md, rules, skills)

### Autenticação e usuários (RF001–RF003, RF015)

- Login por Nome de Usuário + Senha
- Criação de usuários pelo Administrador (Edge Function)
- Gerenciamento de usuários (admin)
- Perfil do usuário e alteração de senha
- Soft delete (inativar usuários)

### Conteúdos (RF004–RF007)

- CRUD de conteúdos (professor/admin)
- Temas psicológicos/reflexivos
- Materiais complementares (links externos)
- Pesquisa e consulta de conteúdos (aluno)
- Upload de capas (Storage)

### Experiência do aluno (RF008–RF012)

- Comentários livres e reflexões orientadas
- Registro de leitura/conclusão
- Evolução individual (pontuação, progresso)
- Produções autorais (salvar e continuar)
- Construção de obra autoral (organizar produções)

### Acompanhamento (RF013–RF014)

- Professor: acompanhamento de alunos
- Admin: visão geral administrativa (contadores)

### Qualidade

- React Hook Form + Zod
- TanStack Query
- ESLint + Prettier
- Testes com Vitest (regras de negócio e schemas)

### Plataformas

- App mobile (React Native + Expo) — aluno
- Web (React + Vite) — aluno + gerenciador (professor/admin)

---

## ❌ Fora do MVP

Explicitamente excluído pelos requisitos ou stack:

| Item | Referência |
|------|------------|
| Cadastro público de usuários | RF001 Obs2 |
| Ranking entre alunos | RF010 Obs3 |
| Medalhas | RF010 Obs3 |
| Desafios diários | RF010 Obs3 |
| Ferramentas avançadas de edição/diagramação | RF011 Obs3 |
| Geração automática de livro para impressão | RF012 Obs4 |
| Diagnósticos psicológicos automáticos | RF008 Obs7 |
| Formik + Yup | Stack §5 |
| Bibliotecas opcionais sem necessidade concreta | Stack §10 |
| Integrações com sistemas externos | PF — escopo interno |
| Gamificação elaborada | RF010 Obs3 |

---

## ⚠️ Decisões adiadas (implementar se necessário)

| Item | Status stack | Quando adicionar |
|------|--------------|------------------|
| Zustand | Opcional | Filtros complexos, preferências UI |
| expo-image-picker | Opcional | Upload de imagem pelo aluno |
| Whitelist de domínios externos | RS008 | Quando instituição definir |

---

## Prioridade de entrega (ordem adotada)

```
1. Backend  →  2. Web  →  3. Mobile
```

Registro vivo em `session/current.md`.

### Fase 1 — Backend (primeiro)
- Docker validado (`docs/docker.md`)
- Monorepo pnpm + packages compartilhados
- Supabase local via Docker (`supabase start`)
- Migrations + RLS + Storage
- Auth + Edge Function create-user
- Testes manuais via Studio/Adminer

### Fase 2 — Web (segundo)
- Scaffold apps/web (Vite + React + TanStack Router)
- Gerenciador (admin/professor) + área aluno
- Testes: Vitest + React Testing Library
- Comandos: `docs/dev-commands.md`

### Fase 3 — Mobile (terceiro)
- Scaffold apps/mobile (Expo)
- Paridade funcional do aluno com web
- Testes: React Native Testing Library

### Fase 4 — Qualidade final
- Testes
- Acessibilidade (RNF11)
- Performance (RNF05)

---

## Critérios de "MVP pronto"

1. Administrador cria usuários e conteúdos
2. Aluno autentica, consulta conteúdos, interage, registra leitura, cria produções
3. Professor acompanha alunos
4. RLS validado por perfil
5. App mobile funcional para fluxo do aluno
6. Documentação atualizada
