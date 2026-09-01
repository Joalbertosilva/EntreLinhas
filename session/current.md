# Sessão atual — tcc-sistema / EntreLinhas

> Última atualização: **2026-09-01** (nuvem, Minha obra, LGPD, mobile)

## Fase atual

**Fase 2d — Polimento web + qualidade** 🔄 **Próximo: busca, testes, deploy**

---

## Infraestrutura (atual)

| Item | Situação |
|------|----------|
| Supabase **nuvem** (`xiplrnkeghrsmkfmrnhh`) | ✅ Linkado, migrations + functions |
| Comando do dia a dia | `pnpm web:dev` |
| Admin nuvem | `admin` / `Admin@123456` |

---

## O que já está pronto ✅

### Plataforma aluno (`/app`)
- Home, vitrines (livros, crônicas, músicas, poemas)
- Detalhe de conteúdo + marcar leitura
- Minhas leituras (andamento, lista, concluídas)
- Minha obra (livro/crônica/poema, capítulos, capa, publicar)
- Obras da comunidade (obras publicadas)
- Perfil + alterar senha
- Mobile: só menu hambúrguer
- Tema claro fixo

### Gerenciador (`/admin`)
- Usuários (criar, editar, redefinir senha)
- Conteúdos, temas, materiais
- Alunos, obras, recuperação de senha
- Auditoria (parcial)

### LGPD / institucional
- `/privacidade` — política de privacidade
- Link no rodapé e telas de login

---

## Plano de montagem — próximas entregas

### Sprint 1 — Polimento visual (1–2 dias)
- [ ] Busca funcional no header
- [ ] Alinhar esqueci-senha / redefinir-senha ao novo login
- [ ] Revisar responsivo em todas as telas admin
- [ ] Deploy do site (Vercel/Netlify) apontando para nuvem

### Sprint 2 — Qualidade (2–3 dias)
- [ ] Testes Vitest nos schemas (`packages/schemas`)
- [ ] Testes RTL em LoginForm e ContentCard
- [ ] Atualizar `docs/validacao-requisitos.md`
- [ ] Checklist manual `docs/gerenciador-checklist.md`

### Sprint 3 — Funcionalidades pendentes
- [ ] `deve_trocar_senha` no 1º login
- [ ] Auditoria completa (todas ações admin)
- [ ] Exportação de dados do aluno (LGPD)

### Sprint 4 — Mobile (Fase 3)
- [ ] Scaffold Expo `apps/mobile`
- [ ] Login + home + leituras (paridade mínima)

### Sprint 5 — TCC / entrega
- [ ] Documentação final
- [ ] Roteiro de demonstração
- [ ] Revisão acessibilidade (RNF11)

---

## Comandos dev (nuvem)

```bash
cd ~/Documentos/Projeto-tcc/tcc-sistema
pnpm web:dev
```

**Raros:**
```bash
pnpm supabase db push          # nova migration
pnpm supabase functions deploy # nova edge function
pnpm web:build                 # validar build
```

---

## Referências

- `docs/mvp-scope.md` — escopo
- `docs/security.md` — segurança e LGPD
- `docs/validacao-requisitos.md` — matriz RF/RS (atualizar)
- `docs/plano-plataforma-aluno.md`
