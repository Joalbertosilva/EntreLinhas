# Tradução automática na leitura integral

Na importação, o professor pode marcar **“Traduzir automaticamente para português”** (padrão: ligado). O texto original em domínio público é convertido **uma vez** e salvo no banco — o aluno **não** dispara tradução por página.

## Motor (custo zero para o professor)

**Fluxo:** a Edge Function **baixa e divide** capítulos. Se o idioma não for português, a **tradução** roda no **navegador do professor** — o mesmo motor gratuito que o Chrome (“Traduzir para português”), capítulo a capítulo, gravando no Supabase. Sem chave de API nem cobrança.

Ordem no navegador: biblioteca `google-translate-api-x` (`client=at`, igual ao Tradutor do Chrome), depois o servidor Supabase e, se configurado, LibreTranslate. Obras longas podem bater **limite temporário** do Google — aguarde 1–2 minutos e **importe de novo** com a tradução marcada: capítulos que já estão em PT são **mantidos** e não são reenviados.

Não usamos Google Cloud Translation nem DeepL **pagos**. O aluno **não** dispara tradução por página.

## Configuração opcional (LibreTranslate)

Para priorizar motor 100% open source em produção, obtenha chave gratuita em [portal.libretranslate.com](https://portal.libretranslate.com):

```bash
pnpm exec supabase secrets set \
  LIBRETRANSLATE_API_KEY=sua-chave \
  LIBRETRANSLATE_URL=https://libretranslate.com
```

Redeploy das funções de tradução:

```bash
pnpm exec supabase functions deploy translate-integral-texto
pnpm exec supabase functions deploy translate-integral-capitulos
```

Opcional: `MYMEMORY_EMAIL=email@instituicao.br` aumenta cota do fallback.

## Experiência do professor

1. Cole o link do Gutenberg (ou envie `.txt` em idioma original).
2. Mantenha a tradução automática marcada.
3. **Importar do link** — aguarde (obra inteira pode levar alguns minutos).
4. Revise capítulos no gerenciador antes de o aluno acessar.

## Exibição ao aluno

Crédito: **EntreLinhas (tradução automática)**. Aviso de que pode haver imprecisões (como em qualquer tradutor automático).

## Limitações

- Não é a mesma tecnologia do botão do Chrome (Google); a ideia é equivalente, com motor open source.
- O professor ou coordenação configuram a chave; usuários finais não inserem cartão.

Ver também: `docs/leitura-integral-custos-zero.md`.