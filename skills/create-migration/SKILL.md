---
name: create-migration
description: Cria migration PostgreSQL para o tcc-sistema com enums, tabelas, RLS e triggers. Use ao adicionar entidades, alterar schema ou trabalhar em supabase/migrations/.
---

# Criar Migration — tcc-sistema

## Pré-requisitos

1. Ler entidade em `docs/database.md`
2. Verificar permissões em `docs/permissions.md` e `docs/security.md`
3. Conferir ordem de migrations existentes em `supabase/migrations/`

## Workflow

```
- [ ] Definir nome: YYYYMMDDHHMMSS_descricao.sql
- [ ] Criar enums necessários
- [ ] Criar tabela com constraints
- [ ] Adicionar índices
- [ ] Habilitar RLS + policies (mesma migration)
- [ ] Triggers updated_at se aplicável
- [ ] Comentário no topo explicando RF relacionado
```

## Template

```sql
-- Migration: criar_tabela_exemplo
-- RF: RF00X — Descrição breve

CREATE TYPE exemplo_enum AS ENUM ('valor1', 'valor2');

CREATE TABLE exemplo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- colunas conforme docs/database.md
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_exemplo_campo ON exemplo(campo);

ALTER TABLE exemplo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aluno_select_exemplo" ON exemplo
  FOR SELECT USING (auth.uid() = usuario_id);

-- Trigger updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON exemplo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Regras

- snake_case no banco
- UUID como PK
- Soft delete via `status`, não DELETE
- RLS obrigatório em tabelas com dados de usuário
- Policies na mesma migration da tabela
- Referenciar RF no comentário

## Validação

```bash
supabase db reset   # ambiente local
supabase db lint    # se disponível
```

Testar policies com usuários de cada perfil (aluno, professor, admin).
