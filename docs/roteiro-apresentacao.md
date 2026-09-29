# Roteiro de apresentação — EntreLinhas

Roteiro único para **orientador**, **banca** e **stakeholder**. Duração sugerida: **18–22 minutos** (+ perguntas).

**Canal principal da demo:** web (`pnpm web:dev` → http://localhost:5173)  
**Canal complementar:** app mobile (Expo Go) — só se ensaiado no device antes.

---

## Antes de começar (checklist 24h)

- [ ] `pnpm web:dev` rodando; internet estável (Supabase nuvem)
- [ ] Credenciais anotadas: admin + aluno de demonstração
- [ ] Dados na nuvem: ≥1 livro com capa, ≥1 aluno ativo, ≥1 obra publicada (opcional mas recomendado)
- [ ] Navegador 1: admin logado ou pronto para login
- [ ] Navegador 2 (aba anônima): aluno
- [ ] Se mobile: `pnpm mobile:dev` testado no aparelho da apresentação
- [ ] Plano B: screenshots ou vídeo de 2 min se a rede falhar

**Admin padrão (nuvem):** `admin` / `Admin@123456`  
**Aluno:** criado em `/admin/usuarios` (sem cadastro público — RF001)

---

## Estrutura sugerida (slides + demo)

### Bloco 1 — Contexto (2 min)

**Fala sugerida:**

> O EntreLinhas é uma plataforma educacional da CESMAC que estimula leitura, reflexão e produção textual. O aluno consome conteúdos curados, registra leituras, interage com reflexões orientadas e pode publicar sua própria obra. Professores e administradores gerenciam usuários, conteúdos e acompanham evolução — tudo com auditoria e segurança no banco.

**Mostrar (opcional):** diagrama do README (web + mobile → Supabase).

---

### Bloco 2 — Arquitetura (2 min)

**Pontos-chave:**

- Monorepo TypeScript (web + mobile + pacotes compartilhados)
- Backend Supabase: PostgreSQL, Auth, Storage, RLS, Edge Functions
- Sem API customizada — regras de acesso no banco
- Validação compartilhada com Zod (`@tcc-sistema/schemas`)

**Não aprofundar:** detalhes de migration, a menos que perguntem.

---

### Bloco 3 — Demo gerenciador (5 min)

**Login** → `/admin`

1. **Dashboard** — contadores, visão geral (RF014)
2. **Usuários** — mostrar que aluno **não se cadastra sozinho**; admin cria (RF001, RF003)
3. **Conteúdos** — livro com capa, temas, materiais (RF004–RF006)
4. **Alunos** — evolução/leituras (RF013)
5. **Auditoria** — timeline ou export CSV (RS007) — *30 segundos, impacto alto*

---

### Bloco 4 — Demo aluno web (7 min)

**Aba anônima** → login aluno → `/app`

1. **Home** — vitrines, continue lendo, minha obra (RF007)
2. **Abrir livro** — leitor paginado (RF009)
3. **Marcar leitura** — em andamento / concluída
4. **Engajamento** — comentário público + reflexão privada (RF008)
5. **Minha obra** — escrever trecho → **publicar** → mostrar na comunidade (RF011, RF012)
6. **Progresso** — XP e nível (RF010)
7. **Perfil** — dados e senha (RF015)

---

### Bloco 5 — App mobile (3 min, opcional)

**Só se ensaiado.**

1. Splash → login aluno
2. Abas: Início, Explorar, Leituras, Pesquisa
3. Abrir livro — leitor + virada de página
4. **Acessibilidade** — toolbar (fonte, TTS, leitura da tela) — *diferencial forte*
5. Logo EntreLinhas → volta ao início

**Frase de escopo:**

> O gerenciador permanece na web; o mobile foca na experiência do aluno, com recursos nativos de acessibilidade.

---

### Bloco 6 — Encerramento (2 min)

**Ressalvas honestas (proativas):**

- Demo em localhost; deploy produção é próximo passo
- LGPD: página de privacidade pronta; export formal de dados pendente
- Testes automatizados: schemas + build; E2E planejado
- Responsividade: mobile nativo ajustado; web admin otimizado para desktop

**Frase de fechamento:**

> O MVP cobre os requisitos funcionais RF001–RF015 nas três superfícies previstas. O sistema está validado para demonstração e uso piloto institucional, com roadmap claro para produção.

---

## Tabela rápida — o que mostrar a quem

| Público | Priorize | Evite |
|---------|----------|-------|
| **Orientador** | Arquitetura, RLS, matriz de requisitos, auditoria | Debug Expo ao vivo |
| **Stakeholder** | Jornada aluno, minha obra, progresso, a11y | Detalhes de migration SQL |
| **Banca técnica** | Monorepo, Edge Functions, RLS, schemas | Prometer deploy se não estiver pronto |

---

## Referências cruzadas

- Matriz completa: [`validacao-requisitos.md`](./validacao-requisitos.md)
- Teste admin: [`gerenciador-roteiro-teste.md`](./gerenciador-roteiro-teste.md)
- Teste aluno web: [`roteiro-validacao-aluno.md`](./roteiro-validacao-aluno.md)
- Perguntas da banca: [`perguntas-banca.md`](./perguntas-banca.md)
