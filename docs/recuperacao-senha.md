# Recuperação de senha — EntreLinhas

> Fluxo **institucional por requerimento** — adequado a alunos sem acesso a e-mail.

---

## Decisão de produto

Quando o aluno esquece a senha:

1. Clica em **Esqueci minha senha**
2. Informa o **nome de usuário**
3. O sistema abre um **pedido** (`password_reset_requests`, status `pendente`)
4. Aluno avisa o **professor ou administrador** presente
5. Staff vê o pedido no gerenciador, **redefine a senha** e entrega presencialmente
6. Aluno entra e pode trocar a senha em **Perfil** (RF015)

Esse fluxo é mais realista do que e-mail para adolescentes acompanhados por equipe institucional.

---

## Segurança (LGPD / RS001)

- Senhas **sempre em hash** — ninguém vê senha de outra pessoa
- Resposta ao pedido é **sempre genérica** — não revela se o usuário existe
- Pedidos ficam registrados para **auditoria** e acompanhamento
- Admin define senha temporária; aluno altera depois com senha atual (RF015)

---

## Telas

| Rota | Função |
|------|--------|
| `/login` | Link **Esqueci minha senha** |
| `/esqueci-senha` | Abre requerimento institucional |
| `/redefinir-senha` | Reservada para link técnico (dev/staff com e-mail) — não é o fluxo principal de alunos |

---

## Backend

### Tabela `password_reset_requests`

| Coluna | Descrição |
|--------|-----------|
| `profile_id` | Aluno que solicitou |
| `nome_usuario` | Cópia para listagem |
| `status` | `pendente` → `atendido` / `cancelado` |
| `atendido_por` | Staff que resolveu |
| `atendido_em` | Quando foi atendido |

### Edge Function `request-password-reset`

- Chamada **sem login** a partir de `/esqueci-senha`
- Cria pedido se usuário existir e estiver ativo
- Evita duplicar pedido `pendente` para o mesmo aluno
- Sempre retorna `{ ok: true }`

---

## Gerenciador (staff)

| Rota | Função |
|------|--------|
| `/admin/requerimentos-senha` | Lista pedidos (pendentes / atendidos / todos) |
| Dialog “Atender” | Gera senha temporária, confirma e chama `admin-reset-password` |
| Modal pós-atendimento | Exibe senha **uma vez** para entrega presencial |

### Edge Function `admin-reset-password`

- Chamada autenticada (professor ou administrador)
- Redefine senha via Auth Admin API (hash)
- Marca pedido `atendido` + audit log `redefinir_senha_requerimento`
- Professor só atende **alunos**; admin pode atender staff

---

## Pendências futuras

| Item | Descrição |
|------|-----------|
| `deve_trocar_senha` | Flag + troca obrigatória no 1º login após senha temporária |
| Badge no menu | Contador de pendentes no item lateral (opcional) |

---

## Testar localmente

```bash
pnpm db:migrate
pnpm functions:serve   # terminal separado
pnpm web:dev
```

1. `/esqueci-senha` → informe um `nome_usuario` de aluno
2. Login como professor/admin → **Pedidos de senha** no menu
3. Clique **Atender**, gere senha temporária e confirme
4. Anote a senha exibida uma vez e teste login do aluno

### Dev — fluxo por e-mail (opcional, staff)

Inbucket em http://localhost:54324 — apenas se testar `resetPasswordForEmail` manualmente; **não** é o fluxo de aluno.

---

## Referências

- `docs/security.md`
- `docs/requirements.md` — RF001, RF015
- `supabase/migrations/20260826180500_password_reset_requests.sql`
