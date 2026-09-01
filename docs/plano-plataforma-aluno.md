# Plano — Plataforma do aluno (`/app/*`)

Mesmo design (CESMAC equilibrado + acessibilidade). Conectado ao banco já existente.

---

## Objetivo

Entregar RF007–RF012 para o perfil **aluno** na web, antes ou em paralelo ao mobile.

---

## Rotas propostas

| Rota | RF | Descrição |
|------|-----|-----------|
| `/app` | RF007 | Home — conteúdos ativos, busca e filtros |
| `/app/conteudos/$id` | RF007–RF009 | Detalhe: capa, temas, materiais, marcar leitura |
| `/app/conteudos/$id/interagir` | RF008 | Comentário livre / reflexão orientada |
| `/app/evolucao` | RF010 | Progresso individual |
| `/app/producoes` | RF011 | Lista e editor de produções |
| `/app/obras` | RF012 | Montagem da obra autoral |
| `/app/perfil` | RF015 | Perfil, senha, resumo evolução |

---

## Layout

- Reutilizar tokens (`index.css`), `Button`, `Card`, `PageHeader`, `SkipLink`
- Sidebar ou top nav **mais simples** que o gerenciador (foco leitura)
- Link no gerenciador: “Ir para plataforma” (staff que também for aluno — futuro)

---

## Backend (já pronto)

| Tabela / view | Uso |
|---------------|-----|
| `conteudos` | SELECT ativos (RLS aluno) |
| `temas`, `materiais_complementares` | Detalhe |
| `interacoes` | RF008 |
| `leituras` | RF009 |
| `evolucao_aluno` | RF010 |
| `producoes`, `obras`, `obra_itens` | RF011–RF012 |

---

## Ordem de implementação

```
1. Auth aluno → redirect /app (hoje bloqueado no login)
2. Layout /app + home (grid conteúdos, busca)
3. Detalhe conteúdo + marcar leitura
4. Interações (comentário/reflexão)
5. Evolução + perfil aluno
6. Produções + obras
```

---

## Auth

Hoje login de aluno mostra toast e redireciona para `/admin`. Ajustar:

- `aluno` → `/app`
- `professor` / `administrador` → `/admin`
- Staff pode ter link cruzado depois

---

## Design

- Fundo com pontos (`bg-dot-pattern`)
- Blocos azul/amarelo **suaves** (cards, stats evolução)
- Hover `card-lift` nos cards de livro
- Capas do Storage (`covers` bucket público)

---

## Acessibilidade

Seguir `docs/acessibilidade.md` desde a primeira tela — não deixar para o final.

---

## Critério de pronto (fase aluno web)

- [ ] Aluno loga e vê home com conteúdos cadastrados no gerenciador
- [ ] Busca e filtro por tipo funcionam
- [ ] Detalhe exibe temas e materiais
- [ ] Marca leitura concluída (sem duplicata)
- [ ] Cria interação e vê evolução
- [ ] CRUD produções + montar obra básica
- [ ] Mesmo visual do gerenciador (consistente, não exagerado)
