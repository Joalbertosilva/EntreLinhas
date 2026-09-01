# Gerenciador web — roteiro de teste (encerramento)

Use este roteiro para validar o gerenciador antes de iniciar a plataforma do aluno (`/app/*`).

**Pré-requisitos:** `pnpm db:start`, `pnpm db:seed-admin`, `pnpm functions:serve`, `pnpm web:dev`  
**Login admin:** `admin` / `Admin@123456`

---

## 1. Autenticação (RF002, RF015)

- [ ] Login com credenciais válidas → entra no `/admin`
- [ ] Login inválido → mensagem clara, sem detalhes técnicos
- [ ] Tab no teclado: “Pular para o conteúdo” aparece e funciona
- [ ] Perfil → alterar senha exige **senha atual** + confirmação
- [ ] Sair encerra sessão

---

## 2. Conteúdos (RF004–RF006)

- [ ] Listar, buscar e filtrar por tipo
- [ ] Criar conteúdo com upload de capa
- [ ] Editar conteúdo e trocar capa
- [ ] Desativar / reativar
- [ ] Excluir (confirmação) — remove temas/materiais em cascata
- [ ] Detalhe: CRUD temas e materiais

---

## 3. Usuários — admin (RF001, RF003)

- [ ] Criar usuário (Edge Function rodando)
- [ ] Editar nome e perfil
- [ ] Desativar / reativar
- [ ] Busca por nome ou login

---

## 4. Alunos (RF013)

- [ ] Professor e admin veem lista de evolução
- [ ] Dados batem com leituras no banco (se houver)

---

## 5. Dashboard e auditoria (RF014)

- [ ] Admin vê contadores na home
- [ ] Professor vê home sem stats de usuários
- [ ] Auditoria lista criação de usuário e ações de conteúdo

---

## 6. Perfis e permissões

- [ ] Professor **não** acessa `/admin/usuarios` nem `/admin/auditoria`
- [ ] Admin acessa tudo

---

## 7. Acessibilidade rápida (RNF11)

- [ ] Navegar sidebar só com Tab + Enter
- [ ] Modais fecham com botão X
- [ ] Foco visível em botões e inputs

---

## Encerramento

Se todos os itens acima passarem, o **gerenciador está pronto** para a fase `/app/*`.

Próximo doc: `docs/plano-plataforma-aluno.md`
