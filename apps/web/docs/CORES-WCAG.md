# Paleta EntreLinhas — auditoria WCAG 2.1 (contraste)

Referência: `apps/web/src/index.css` (`@theme`). Critério AA para texto normal: **≥ 4,5:1**; texto grande (≥ 18pt ou 14pt bold): **≥ 3:1**.

## Cores principais

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#1c756a` | Botões, links, destaques |
| `--color-primary-hover` | `#155a52` | Hover de botões primary |
| `--color-primary-soft` | `#2a9d8f` | Detalhes / ícones secundários |
| `--color-accent` | `#efb034` | Badges, destaques dourados |
| `--color-text` | `#1a3342` | Texto principal (navy) |
| `--color-text-muted` | `#5a7282` | Texto secundário |
| `--color-success` | `#15803d` | Status concluído |
| `--color-error` | `#dc2626` | Erros |
| `--color-on-primary` | `#ffffff` | Texto sobre primary |
| `--color-on-accent` | `#1a3342` | Texto sobre accent |
| `--platform-bg-mid` | `#e5f7f3` | Gradiente de fundo |

## Resultados de contraste (calculados)

| Combinação | Ratio | AA texto | AAA | AA grande |
|------------|-------|----------|-----|-----------|
| `#1a3342` sobre branco | **13,16:1** | ✅ | ✅ | ✅ |
| `#5a7282` sobre branco | **5,04:1** | ✅ | ❌ | ✅ |
| `#1c756a` sobre branco | **5,52:1** | ✅ | ❌ | ✅ |
| `#155a52` sobre branco | **8,03:1** | ✅ | ✅ | ✅ |
| `#efb034` sobre `#1a3342` | **6,85:1** | ✅ | ❌ | ✅ |
| `#15803d` sobre branco | **5,02:1** | ✅ | ❌ | ✅ |
| `#dc2626` sobre branco | **4,83:1** | ✅ | ❌ | ✅ |
| Branco sobre `#1c756a` | **5,52:1** | ✅ | ❌ | ✅ |

## Combinações que **não passam** AA (texto normal)

| Combinação | Ratio | Recomendação |
|------------|-------|--------------|
| `#efb034` (accent) sobre branco | **1,92:1** | Não usar accent como texto sobre fundo claro; usar navy ou primary |
| `#2a9d8f` (primary-soft) sobre branco | **3,32:1** | OK só para texto grande ou ícones decorativos; preferir `#1c756a` para labels |

## Recomendações para o TCC

1. **Manter** primary `#1c756a` e texto `#1a3342` — passam AA com folga.
2. **Evitar** parágrafos em `#efb034` sobre branco; badges accent devem usar `--color-on-accent` (navy).
3. **Substituir** usos de `#2a9d8f` em textos pequenos por `#1c756a` ou `#155a52` se precisar de AAA.
4. **Fundos** `--platform-bg-mid` / `--color-primary-light` são decorativos; texto sobre eles deve continuar usando `--color-text` ou `--color-brand-navy`.

## Carrossel e leitura

- Botões do carrossel: branco/`primary` sobre stage escuro — contraste adequado.
- Botões de paginação do leitor: outline com `--color-brand-navy` sobre branco — adequado.

---

*Auditoria gerada em out/2026. Revalidar após alterações na paleta.*
