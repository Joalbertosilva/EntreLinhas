# Sessão atual — tcc-sistema / EntreLinhas

> Última atualização: **2026-08-31** (B5 — detalhe do conteúdo + marcar leitura)

## Fase atual

**Fase 2c — Plataforma aluno (`/app/*`)** 🔄 **B5 concluído — próximo: interações (RF008) ou busca**

---

## Onde paramos (resumo rápido)

| Bloco | Situação |
|-------|----------|
| **A** Recuperação de senha | ✅ Funcionando ponta a ponta |
| **B1–B3** Login aluno, layout, home, páginas por tipo, perfil, footer, setas no carrossel | ✅ |
| **B5** Detalhe `/app/conteudos/$id` + marcar leitura | ✅ |
| **B6+** Interações, evolução, produções… | ⏳ **Próximo passo** |

---

## Bloco A — Recuperação de senha ✅

Fluxo completo: `/esqueci-senha` → gerenciador **Recuperação de senha** → aluno loga → troca senha em **Perfil → Alterar senha**.

---

## Bloco B — Plataforma aluno 🔄

### Entregue

- Redirect: aluno → `/app`, staff → `/admin`
- Layout: hamburger (drawer), top bar, gradiente no scroll, footer
- Home + `/app/livros`, `/app/cronicas`, `/app/musicas`, `/app/poemas` — **conteúdos reais + placeholders**
- `/app/conteudos/$id` — capa, texto, temas, materiais, marcar leitura (em andamento / concluída)
- Cards clicáveis nas vitrines
- Perfil + `/app/perfil/senha` (troca de senha separada)
- Carrosséis: **setas** (sem barra de rolagem visível)

### Próximo passo técnico — **B6**

Interações (comentário / reflexão) ou busca na barra do header.

---

## Bloco C — Depois

- `deve_trocar_senha` + 1º login obrigatório
- Página detalhe `/app/conteudos/$id`
- Busca, evolução, produções, obras (RF008–RF012)

---

## Comandos dev

```bash
pnpm db:start
pnpm db:migrate
pnpm functions:serve   # só se testar recuperação de senha
pnpm web:dev
```

- Admin: `admin` / `Admin@123456`
- Aluno: `joao.exemplo` + senha definida pelo staff

---

## Referências

- `docs/plano-plataforma-aluno.md`
- `docs/design-system.md`
- `docs/recuperacao-senha.md`
