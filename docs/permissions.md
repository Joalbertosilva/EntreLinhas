# Permissões — tcc-sistema

Matriz de permissões por perfil. Toda operação deve ser validada no **servidor (RLS/Edge Functions)**, não apenas na UI.

## 1. Perfis

| Perfil | Descrição |
|--------|-----------|
| **Aluno** | Consulta conteúdos, interage, registra leitura, cria produções |
| **Professor** | Gerencia conteúdos/temas/materiais, acompanha alunos |
| **Administrador** | Gerencia usuários, supervisão geral, todas as funções de professor |

## 2. Matriz de permissões

Legenda: ✅ Permitido · ❌ Negado · 👁️ Somente leitura · ⚙️ Via Edge Function

### Usuários (RF001, RF003, RF015)

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Cadastrar usuário | ❌ | ❌ | ⚙️ Edge Function |
| Alterar perfil de usuário | ❌ | ❌ | ✅ |
| Ativar/desativar usuário | ❌ | ❌ | ✅ |
| Listar/buscar usuários | ❌ | ❌ | ✅ |
| Ver próprio perfil | ✅ | ✅ | ✅ |
| Alterar própria senha | ✅ | ✅ | ✅ |
| Alterar NomeUsuario/Perfil próprio | ❌ | ❌ | ❌ |

### Conteúdos (RF004–RF007)

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Criar/editar conteúdo | ❌ | ✅ | ✅ |
| Inativar conteúdo | ❌ | ✅ | ✅ |
| Pesquisar/listar conteúdos ativos | ✅ | ✅ | ✅ |
| Ver detalhe de conteúdo ativo | ✅ | ✅ | ✅ |
| Ver conteúdos inativos | ❌ | ✅ | ✅ |

### Temas e materiais (RF005, RF006)

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Criar/editar temas | ❌ | ✅ | ✅ |
| Criar/editar materiais complementares | ❌ | ✅ | ✅ |
| Visualizar temas/materiais (conteúdo ativo) | ✅ | ✅ | ✅ |

### Interações (RF008)

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Criar interação | ✅ (própria) | ❌ | ❌ |
| Editar interação | ✅ (própria) | ❌ | ❌ |
| Ver interações de outros alunos | ❌ | 👁️* | 👁️* |

\* Conforme regras definidas pela instituição (RF008 Obs6, RF013 Obs3). Implementar flag/configuração institucional.

### Leitura e evolução (RF009, RF010)

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Registrar leitura/conclusão | ✅ (própria) | ❌ | ❌ |
| Ver própria evolução | ✅ | ❌ | ❌ |
| Ver evolução de alunos | ❌ | 👁️ | 👁️ |
| Alterar histórico de leitura manualmente | ❌ | ❌ | ❌ |

### Produções e obras (RF011, RF012)

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Criar/editar produção | ✅ (própria) | ❌ | ❌ |
| Criar/editar obra | ✅ (própria) | ❌ | ❌ |
| Ver produções de outros alunos | ❌ | 👁️* | 👁️* |

### Acompanhamento e admin (RF013, RF014)

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Dashboard de alunos | ❌ | ✅ | ✅ |
| Visão geral administrativa | ❌ | ❌ | ✅ |
| Logs de auditoria | ❌ | ❌ | ✅ |

### Storage

| Operação | Aluno | Professor | Administrador |
|----------|-------|-----------|---------------|
| Upload capa/imagem | ❌ | ✅ | ✅ |
| Download/visualizar mídia | ✅ | ✅ | ✅ |

## 3. Guards de rota

### Mobile

| Rota | Perfis permitidos |
|------|-------------------|
| `(auth)/*` | Não autenticado |
| `(aluno)/*` | Aluno |

### Web

| Rota | Perfis permitidos |
|------|-------------------|
| `/login` | Não autenticado |
| `/_aluno/*` | Aluno |
| `/_professor/*` | Professor, Administrador |
| `/_admin/*` | Administrador |

Administrador pode acessar rotas de professor.

## 4. Implementação

1. **RLS policies** no PostgreSQL — fonte de verdade
2. **Route guards** no client — UX (redirecionar, esconder menu)
3. **Edge Functions** — operações que Auth/RLS não cobrem (criar usuário admin)
4. **Nunca confiar apenas no client** — RS003

## 5. Usuário inativo

- `status = false` → login bloqueado (RF001, RF002)
- Dados históricos preservados
- Administrador pode reativar
