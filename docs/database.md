# Modelo de dados — tcc-sistema

Entidades, relações e regras do banco PostgreSQL (Supabase).

## 1. Convenções

- **PK:** UUID (`gen_random_uuid()`) para entidades principais
- **Timestamps:** `created_at`, `updated_at` (trigger automático)
- **Soft delete:** campo `status` (boolean) ou `is_active` — preferir inativar a excluir
- **Auditoria:** tabela `audit_logs` para operações administrativas (RS007)
- **Nomenclatura:** snake_case no banco, camelCase no TypeScript (mapeamento explícito)

## 2. Diagrama de relações

```
profiles (1) ──────< interacoes
    │                      │
    │                      └── conteudos (N)
    │
    ├──────< leituras ────── conteudos
    │
    ├──────< producoes
    │              │
    │              └── obra_itens ── obras
    │
    └── (responsavel) conteudos
                           │
                           ├── temas
                           └── materiais_complementares
```

## 3. Entidades

### profiles

Extensão do `auth.users` do Supabase.

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | FK → auth.users.id |
| nome | text NOT NULL | Nome completo |
| nome_usuario | text UNIQUE NOT NULL | Login (RF001, RF015) |
| perfil | enum NOT NULL | `aluno`, `professor`, `administrador` |
| status | boolean DEFAULT true | Ativo/inativo |
| created_at | timestamptz | Automático |

**Índices:** `nome_usuario`, `perfil`, `status`

---

### conteudos (RF004)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| titulo | text NOT NULL | |
| tipo | enum NOT NULL | livro, cronica, poema, musica, frase, outro |
| autor | text | |
| descricao | text | |
| resumo | text | |
| personagens | text | |
| contexto | text | |
| pontos_importantes | text | |
| curiosidades | text | |
| conteudo_textual | text | |
| capa_url | text | URL do Storage |
| status | boolean DEFAULT true | |
| responsavel_id | uuid FK → profiles | Professor ou Admin |
| created_at | timestamptz | |

---

### temas (RF005)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| conteudo_id | uuid FK → conteudos | |
| tema | text NOT NULL | |
| descricao | text | |
| ensinamento | text | |
| questionamento | text | |
| status | boolean DEFAULT true | |

---

### materiais_complementares (RF006)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| conteudo_id | uuid FK → conteudos | |
| titulo | text NOT NULL | |
| tipo | enum NOT NULL | video, audio, pagina_externa, outro |
| link | text NOT NULL | URL válida |
| descricao | text | |
| status | boolean DEFAULT true | |

---

### interacoes (RF008)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| usuario_id | uuid FK → profiles | Apenas aluno |
| conteudo_id | uuid FK → conteudos | |
| tipo_interacao | enum NOT NULL | comentario_livre, reflexao_orientada |
| tema_id | uuid FK → temas NULL | Obrigatório se reflexao_orientada |
| texto | text NOT NULL | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Constraint:** `tema_id` NOT NULL quando `tipo_interacao = 'reflexao_orientada'`

---

### leituras (RF009)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| usuario_id | uuid FK → profiles | Apenas aluno |
| conteudo_id | uuid FK → conteudos | |
| status_leitura | enum NOT NULL | em_andamento, concluido |
| created_at | timestamptz | |

**Unique:** `(usuario_id, conteudo_id)` — sem duplicatas de conclusão

---

### producoes (RF011)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| usuario_id | uuid FK → profiles | Apenas aluno |
| titulo | text NOT NULL | |
| tipo | enum NOT NULL | conto, poema, cronica, reflexao, capitulo, outro |
| texto | text | |
| status | boolean DEFAULT true | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### obras (RF012)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| usuario_id | uuid FK → profiles | Apenas aluno |
| titulo | text NOT NULL | |
| descricao | text | |
| status | boolean DEFAULT true | |
| created_at | timestamptz | |

---

### obra_itens (RF012)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| obra_id | uuid FK → obras | |
| producao_id | uuid FK → producoes | Mesmo aluno da obra |
| ordem | integer NOT NULL | Sequência na obra |
| status | boolean DEFAULT true | |

**Constraint:** producao.usuario_id = obra.usuario_id

---

### audit_logs (RS007)

| Coluna | Tipo | Regras |
|--------|------|--------|
| id | uuid PK | |
| usuario_id | uuid FK → profiles | Quem executou |
| acao | text NOT NULL | Ex: criar_usuario, desativar_conteudo |
| entidade | text | Tabela afetada |
| entidade_id | uuid | ID do registro |
| detalhes | jsonb | Metadados (sem senhas) |
| created_at | timestamptz | |

## 4. Views / funções calculadas

### evolucao_aluno (RF010, RF013)

Calculada a partir de `leituras` e regras de pontuação:

- `quantidade_concluida` — COUNT leituras com status concluido
- `pontuacao` — SUM pontos por ações válidas
- `percentual_progresso` — concluidos / total_conteudos_ativos
- `ultima_interacao` — MAX(created_at) de interacoes + leituras + producoes

Implementar como **view** ou **função SQL** — nunca confiar em cálculo apenas no client.

### visao_administrativa (RF014)

- `quantidade_usuarios`, `quantidade_alunos`, `quantidade_professores`, `quantidade_conteudos`

View agregada com RLS restrita a administradores.

## 5. Enums

```sql
CREATE TYPE perfil_enum AS ENUM ('aluno', 'professor', 'administrador');
CREATE TYPE tipo_conteudo_enum AS ENUM ('livro', 'cronica', 'poema', 'musica', 'frase', 'outro');
CREATE TYPE tipo_material_enum AS ENUM ('video', 'audio', 'pagina_externa', 'outro');
CREATE TYPE tipo_interacao_enum AS ENUM ('comentario_livre', 'reflexao_orientada');
CREATE TYPE status_leitura_enum AS ENUM ('em_andamento', 'concluido');
CREATE TYPE tipo_producao_enum AS ENUM ('conto', 'poema', 'cronica', 'reflexao', 'capitulo', 'outro');
```

## 6. Migrations

- Uma migration por entidade ou grupo lógico
- Sempre incluir RLS policies na mesma migration da tabela
- Ordem sugerida:
  1. Enums
  2. profiles + trigger auth.users
  3. conteudos, temas, materiais_complementares
  4. interacoes, leituras
  5. producoes, obras, obra_itens
  6. audit_logs
  7. Views/funções
  8. Storage buckets e policies

## 7. Storage buckets

| Bucket | Público | Política |
|--------|---------|----------|
| covers | Leitura autenticada | Escrita: professor/admin |
| media | Leitura autenticada | Escrita: professor/admin |

## 8. Regras de integridade

1. Aluno só acessa/modifica seus próprios registros (interações, leituras, produções, obras)
2. Conteúdos inativos invisíveis para alunos
3. Usuários inativos não autenticam
4. Links de materiais validados no cadastro (formato URL)
5. Produção vinculada a obra deve pertencer ao mesmo aluno
