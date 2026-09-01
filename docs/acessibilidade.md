# Acessibilidade — tcc-sistema (RNF11)

Regras para **gerenciador** (`/admin/*`) e **plataforma do aluno** (`/app/*`). Mesmo design system, mesmos padrões.

---

## Princípios

1. **Teclado primeiro** — toda ação clicável também funciona com Tab + Enter/Espaço
2. **Foco visível** — outline azul institucional (`:focus-visible`)
3. **Texto claro** — português simples, erros descritivos (RNF02 + RNF10)
4. **Sem depender só de cor** — status usa texto + badge, não só verde/vermelho
5. **Respeitar preferências** — `prefers-reduced-motion` desativa animações de hover

---

## Checklist por tela

| Item | Implementação |
|------|----------------|
| Idioma | `<html lang="pt-BR">` |
| Pular conteúdo | `SkipLink` → `#conteudo-principal` |
| Landmarks | `<nav aria-label>`, `<main id="conteudo-principal">` |
| Formulários | `<label htmlFor>`, erros com `role="alert"` |
| Modais | `role="dialog"`, `aria-modal`, `aria-labelledby`, botão Fechar |
| Tabelas | `<th scope="col">` |
| Ícones decorativos | `aria-hidden` |
| Botões só com ícone | `aria-label` obrigatório |
| Contraste | Azul `#0066CC` em branco — AA para texto grande e botões |

---

## Componentes

| Componente | Arquivo |
|------------|---------|
| Pular para conteúdo | `components/ui/SkipLink.tsx` |
| Erros de campo | `FieldError` com `aria-live="polite"` |
| Dialog | `components/ui/Dialog.tsx` |

---

## Ao criar telas novas (`/app/*`)

- Reutilizar `Button`, `Input`, `Card`, `PageHeader`, `SkipLink`
- Mesmos tokens em `index.css` e `docs/design-system.md`
- Testar com Tab do teclado antes de entregar
- Imagens informativas: `alt` descritivo; decorativas: `alt=""`

---

## Pendente (melhorias futuras)

- [ ] `aria-describedby` ligando inputs aos erros (por campo)
- [ ] Testes automatizados com axe-core / Vitest
- [ ] Auditoria de contraste em todos os badges
- [ ] Focus trap refinado em modais (opcional se Tab já circular)

---

## Status

- [x] Skip link + main landmark no gerenciador (2026-08-25)
- [x] Reduced motion + foco visível global
- [x] Tabelas com `scope="col"`
- [ ] Plataforma aluno — aplicar na Fase 2b
