# Session — tcc-sistema

Pasta para **nunca perder o contexto** do que está sendo feito no projeto.

## Arquivos

| Arquivo | Função |
|---------|--------|
| [current.md](./current.md) | Estado atual: fase, decisões, progresso, próximos passos |
| [history/](./history/) | Registro diário ou por entrega (opcional) |

## Regras

1. **Sempre atualizar `current.md`** ao iniciar, pausar ou concluir uma fase
2. Agentes de IA devem ler `session/current.md` no início de cada sessão de trabalho
3. Decisões importantes (ordem de entrega, mudanças de stack, bloqueios) vão em `current.md`
4. Ao fechar um dia/entrega, opcionalmente copiar resumo para `history/YYYY-MM-DD.md`

## Ordem de entrega adotada

```
1. Backend (Supabase + Docker + migrations + auth + create-user)
2. Web — gerenciador PRIMEIRO (admin cadastra usuários — essencial)
         depois área aluno
3. Mobile (só aluno)
```

**Gerenciador é essencial:** sem ele ninguém acessa o sistema (RF001 — sem cadastro público).

Ver detalhes em `current.md` e `docs/design-system.md` (cores provisórias).
