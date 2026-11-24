# Importação de leitura integral (custo zero)

1. Cadastre o livro no gerenciador (`/admin/conteudos`) com estudo (resumo, temas, etc.).
2. Ative **Leitura integral**, licença **Domínio público**, método **Pré-importado**.
3. Salve o conteúdo.
4. No mesmo formulário (edição), use **Importar capítulos JSON** e escolha `pequeno-principe-piloto.json` (amostra) ou seu arquivo completo.

## Arquivo JSON

```json
{
  "meta": { "fonte_url": "https://..." },
  "capitulos": [
    { "ordem": 1, "titulo": "Capítulo I", "texto_pt": "...", "texto_origem": "opcional" }
  ]
}
```

Validação: `packages/schemas` → `capitulosIntegralImportSchema`.

## Obra completa (sem API paga)

Tradução offline no seu PC (Argos Translate, etc.) → gere JSON → importe no admin. Nada é cobrado do aluno, professor ou admin.

- Custos: `docs/leitura-integral-custos-zero.md`
- **Professores (Google, domínio público):** `docs/guia-professor-leitura-integral.md`