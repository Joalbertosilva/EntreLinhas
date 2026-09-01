# Design System — tcc-sistema (CESMAC)

> **Obrigatório** para todo frontend (gerenciador, plataforma, mobile).  
> Referência visual: identidade **CESMAC** — azul `#0066CC` + amarelo `#FFD100`.

---

## 1. Princípio central: interface natural, não “cara de IA”

A interface deve parecer **produto humano**, pensado para adolescentes, professores e gestores reais — não template genérico de dashboard.

### ✅ Fazer

- Textos em **português natural**, diretos (“Seus alunos”, “Cadastrar conteúdo”)
- **Espaço em branco** generoso; fundo com padrão de pontos suave (`bg-dot-pattern`)
- Cores CESMAC com **equilíbrio** — azul e amarelo em blocos pastel, botões e acentos (sem dominar a tela)
- Tipografia legível, tamanhos confortáveis (corpo ≥ 15px)
- Botões `rounded-xl`, hover e leve elevação nos cards
- Um foco visual claro por tela (título + ação principal)
- `cursor: pointer` em tudo que for clicável

### ❌ Proibido (aspecto “IA / template”)

- Hero azul gradiente **em todas** as páginas
- Faixa gradiente colorida no topo de **cada** card
- Grids idênticos de 4 stat cards sem contexto
- Excesso de badges, ícones decorativos e sombras dramáticas
- Copy genérica: “Dashboard”, “Visão geral administrativa”, “Soluções integradas”
- Sidebar **totalmente** cinza sem identidade
- Remover padrão de pontos do fundo principal
- Botões pill em excesso
- Animações exageradas (bounce, scale agressivo)
- Paleta cinza-fria dominante sem calor institucional
- Componentes shadcn “crus” sem personalização CESMAC

---

## 2. Cores (tokens)

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#0066CC` | Ações principais, links, item ativo |
| `primary-hover` | `#0052A3` | Hover |
| `primary-dark` | `#004A99` | Sidebar, títulos fortes |
| `primary-light` | `#EEF4FB` | Item ativo, fundos de ícone |
| `accent` | `#FFD100` | Acentos pontuais (botões secundários suaves) |
| `accent-light` | `#FFF8EB` | Destaque suave amarelo |
| `surface` | `#F6F8FA` | Sidebar, áreas secundárias |
| `text` | `#0A1628` | Texto principal |
| `text-muted` | `#5A6B82` | Texto secundário |
| `border` | `#D8E3F0` | Divisores |
| `brand-navy` | `#003366` | Harmonia com logo — login e detalhes de marca |
| `brand-gold` | `#EFB034` | Dourado da logo — acentos pontuais no login |

**Regra:** amarelo nunca como fundo de texto longo; texto sobre amarelo usa `#0A1628`.

---

## 3. Tipografia

- **Fonte:** Plus Jakarta Sans
- Títulos: peso 600–700, tracking normal (não ultra-tight)
- Parágrafos: `leading-relaxed`, linguagem simples (RNF10)

---

## 4. Componentes

| Elemento | Estilo |
|----------|--------|
| Botões | `rounded-xl`, amarelo CESMAC no secundário |
| Cards | `rounded-xl`, sombra leve, hover com elevação |
| Headers de página | Banner suave na home (faixa amarela); demais telas só título |
| Sidebar | Branca com topo azul claro; item ativo destacado |

---

## 5. Tom de voz (exemplos)

| Evitar | Preferir |
|--------|----------|
| “Visão geral administrativa” | “Início” ou “Olá, Maria” |
| “Gerenciar entidades” | “Conteúdos” / “Seus alunos” |
| “Operação concluída com sucesso” | “Conteúdo salvo” |
| “Nenhum registro encontrado” | “Ainda não há conteúdos por aqui” |

---

## 6. Onde aplicar

- `apps/web` — gerenciador **e** plataforma oficial (`/app/*` futuro)
- `apps/mobile` — mesmos tokens e tom de voz (NativeWind)

### Login (`/login`) — template auth

Componentes reutilizáveis em `features/auth/` e `components/layout/AuthSplitLayout.tsx`:

| Componente | Uso |
|------------|-----|
| `AuthSplitLayout` | Layout 50/50 hero + formulário |
| `AuthFormPanel` | Painel branco sobre fundo pontilhado |
| `AuthPageHeader` | Título + descrição da tela |
| `AuthField` | Campo com ícone, label e erro |
| `BrandLogo` | Logo oficial (`full` ou `mark`) |
| `Button variant="brand"` | Ação principal em telas auth |
| `/esqueci-senha` | Solicitar recuperação de senha |
| `/redefinir-senha` | Definir nova senha (link do e-mail) |

- Layout dividido: hero com **um** bloco azul claro (lado esquerdo) + formulário com `bg-login-form` (pontilhado)
- Ilustração com fundo transparente integrada à composição (sombra suave, sem card solto)
- Tokens `brand-navy` / `brand-gold` harmonizam com a logo oficial
- Classe `input-auth` para campos em telas de autenticação

---

## 7. Checklist antes de entregar UI

- [ ] Parece site institucional/educacional, não SaaS genérico?
- [ ] Máximo 1 bloco colorido forte por tela?
- [ ] Textos soam como humano falando?
- [ ] Contraste WCAG AA nos botões e textos?
- [ ] Funciona bem em mobile (RNF03)?
- [ ] Navegável por teclado (Tab, foco visível)? — ver `docs/acessibilidade.md`

---

## 8. Acessibilidade (RNF11)

Detalhes em **`docs/acessibilidade.md`**: skip link, landmarks, labels, modais, reduced motion.

---

## Status

- [x] CESMAC equilibrado no gerenciador (2026-08-25)
- [x] Regras anti-“IA” documentadas (2026-08-25)
- [x] Base a11y (skip link, main, tabelas) (2026-08-25)
