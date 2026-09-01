# Segurança — tcc-sistema

RLS, autenticação, LGPD e requisitos de segurança (RS001–RS010).

## 1. Autenticação

### Interface

- **Login:** Nome de Usuário + Senha
- **Identificador interno:** UUID (`auth.users.id`)

### Fluxo

1. Usuário informa `nome_usuario` + senha
2. Sistema resolve `nome_usuario` → UUID (tabela `profiles`)
3. Supabase Auth valida credenciais
4. JWT contém `sub` (UUID) usado em todas as relações
5. Perfil carregado de `profiles.perfil`

### Criação de conta (RF001)

- **Sem signup público**
- Administrador cria via Edge Function `create-user`
- Edge Function: valida perfil admin, cria auth user, insere profile, registra audit log
- Senha inicial definida pelo admin (aluno/professor altera depois via RF015)

### Sessão (RS001)

- Senhas: hash via Supabase Auth (bcrypt)
- Rate limiting em tentativas de login
- Logout encerra sessão e limpa tokens locais
- Mobile: `expo-secure-store` para tokens
- Web: cookies/httpOnly conforme Supabase defaults

## 2. Row Level Security (RLS)

**Toda tabela com dados de usuário DEVE ter RLS habilitado.**

### Padrão de policies

```sql
-- Exemplo: interacoes
ALTER TABLE interacoes ENABLE ROW LEVEL SECURITY;

-- Aluno: CRUD apenas próprios registros
CREATE POLICY "aluno_own_interacoes" ON interacoes
  FOR ALL USING (auth.uid() = usuario_id);

-- Professor: SELECT conforme config institucional
CREATE POLICY "professor_read_interacoes" ON interacoes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND perfil IN ('professor', 'administrador'))
  );
```

### Tabelas e policies mínimas

| Tabela | Aluno | Professor | Admin |
|--------|-------|-----------|-------|
| profiles | SELECT own | SELECT own | ALL |
| conteudos | SELECT active | ALL | ALL |
| temas | SELECT (conteudo ativo) | ALL | ALL |
| materiais_complementares | SELECT (conteudo ativo) | ALL | ALL |
| interacoes | CRUD own | SELECT* | SELECT* |
| leituras | CRUD own | SELECT | SELECT |
| producoes | CRUD own | SELECT* | SELECT* |
| obras / obra_itens | CRUD own | SELECT* | SELECT* |
| audit_logs | ❌ | ❌ | SELECT |

## 3. Isolamento entre alunos (RS002)

- Todo registro pessoal vinculado a `usuario_id = auth.uid()`
- Policies impedem SELECT/UPDATE/DELETE de registros de outros
- Testes de RLS obrigatórios para cada tabela sensível

## 4. Controle por perfil (RS003)

- Verificação no servidor via RLS e `profiles.perfil`
- Edge Functions validam JWT + perfil antes de executar
- UI esconde rotas, mas RLS é a barreira real

## 5. Comunicação e dados (RS004)

- HTTPS em todas as comunicações (Supabase default)
- Service role key **nunca** no client
- Anon key + RLS no client
- Erros genéricos ao usuário — sem expor IDs, emails ou stack traces
- Logs de aplicação sem dados pessoais

## 6. LGPD — adolescentes privados de liberdade (RS005)

### Princípios

1. **Minimização:** coletar apenas dados necessários (nome, nome_usuario, perfil, atividades)
2. **Finalidade:** estímulo à leitura, reflexão e produção textual
3. **Melhor interesse** do adolescente
4. **Retenção:** dados inativos tratados conforme política institucional
5. **Sem diagnóstico psicológico automático** a partir de interações (RF008 Obs7)

### Dados coletados

| Dado | Finalidade | Base |
|------|------------|------|
| Nome | Identificação | Necessário ao serviço |
| Nome de usuário | Autenticação | Necessário ao serviço |
| Interações/reflexões | Acompanhamento pedagógico | Consentimento institucional |
| Leituras/produções | Evolução individual | Consentimento institucional |

## 7. Integridade e backup (RS006)

- Backups automáticos via Supabase
- Soft delete (`status = false`) em vez de DELETE
- Confirmação antes de operações críticas na UI
- Migrations reversíveis quando possível

## 8. Auditoria (RS007)

Registrar em `audit_logs`:

- Criação/alteração/desativação de usuários
- Alterações administrativas em conteúdos
- Acesso a logs: somente administrador

**Nunca registrar senhas ou tokens.**

## 9. Links externos (RS008)

- Materiais complementares cadastrados por professor/admin
- Validação de formato URL no Zod (client) e CHECK/trigger (server)
- Links inativos não exibidos aos alunos
- Instituição pode definir whitelist de domínios (config futura)

## 10. Privacidade de interações (RS009)

- Interações e produções: acesso restrito por padrão
- Nunca tornar público automaticamente
- Visibilidade professor/admin conforme `docs/permissions.md`

## 11. Incidentes (RS010)

- Logs de eventos de segurança (tentativas de login, falhas de auth)
- Procedimento documentado para resposta a incidentes (responsabilidade institucional)
- Notificação conforme LGPD quando aplicável

## 12. Checklist de implementação

- [ ] RLS habilitado em todas as tabelas
- [ ] Policies testadas por perfil
- [ ] Edge Function create-user com validação de admin
- [ ] Schemas Zod sem vazamento de dados sensíveis
- [ ] Storage policies alinhadas ao RLS
- [ ] Rate limiting no login
- [ ] Audit log em operações admin
- [ ] Mensagens de erro genéricas
- [ ] Service role key apenas em Edge Functions/server
