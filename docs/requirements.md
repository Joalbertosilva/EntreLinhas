# Requisitos — tcc-sistema (MVP)

Documento derivado do Documento de Requisitos do TCC. Fonte de verdade para escopo funcional.

## 1. Descrição geral

Plataforma de estímulo à leitura, reflexão e produção textual voltada a **adolescentes privados de liberdade**.

- Acesso via **aplicativo mobile** e **website**
- Alunos consultam conteúdos literários/culturais com resumos, materiais multimídia e temas psicológicos/reflexivos
- Alunos registram interações, acompanham evolução de leitura e desenvolvem produções autorais
- Ambiente de **gerenciamento** para professores e administradores

## 2. Prioridades

| Nível | Significado |
|-------|-------------|
| Essencial | Sistema não funciona sem |
| Importante | Funciona, mas de forma insatisfatória |
| Desejável | Pode ficar para versões posteriores |

## 3. Requisitos funcionais

### RF001 — Cadastro de usuários

**Ator:** Administrador Principal

**Campos:**
- ID (UUID interno)
- Nome (string)
- NomeUsuario (string, único) — identificador de login
- Senha (string, hash no backend)
- Perfil (enum: Aluno, Professor, Administrador)
- Status (boolean: ativo/inativo)
- DataCadastro (datetime, automático)

**Regras:**
- Somente Administrador Principal cadastra usuários
- **Não há cadastro público**
- NomeUsuario único e válido
- Registros inativos permanecem armazenados, indisponíveis para uso normal
- Atividades do aluno vinculadas ao seu usuário

---

### RF002 — Autenticação (Login)

**Campos:** NomeUsuario, Senha

**Regras:**
- NomeUsuario deve corresponder a usuário cadastrado e ativo
- Senha deve corresponder ao hash armazenado
- Credenciais inválidas → mensagem de erro clara
- Após login, perfil determina funcionalidades disponíveis
- Usuário pode encerrar sessão

---

### RF003 — Gerenciamento de usuários

**Ator:** Administrador Principal

**Operações:** cadastrar, alterar, ativar, desativar, consultar

**Regras:**
- Busca por nome, NomeUsuario ou perfil
- Desativação não exclui históricos
- Alteração de perfil somente pelo Administrador

---

### RF004 — Gerenciamento de conteúdos

**Atores:** Professor, Administrador

**Campos:**
- ID, Titulo, Tipo, Autor, Descricao, Resumo
- Personagens, Contexto, PontosImportantes, Curiosidades, ConteudoTextual
- Capa (URL Storage), Status, DataCadastro, ResponsavelCadastro

**Tipos de conteúdo:** Livro, Crônica, Poema, Música, Frase, Outro

**Regras:**
- Nem todos os campos obrigatórios para todos os tipos
- Apenas conteúdos ativos visíveis aos alunos
- Soft delete via status

---

### RF005 — Temas psicológicos e reflexivos

**Campos:** ID, ConteudoID, Tema, Descricao, Ensinamento, Questionamento, Status

**Regras:**
- Um conteúdo pode ter vários temas
- Temas: amizade, vínculos, responsabilidade, solidão, escolhas, autoestima, autoconhecimento, etc.
- Ensinamento e questionamento estimulam reflexão do aluno

---

### RF006 — Materiais complementares

**Campos:** ID, ConteudoID, Titulo, Tipo, Link, Descricao, Status

**Tipos:** Vídeo, Áudio, Página Externa, Outro

**Regras:**
- Um conteúdo pode ter vários materiais
- Link com formato válido
- Cadastrados por professores/administradores

---

### RF007 — Consulta e pesquisa de conteúdos

**Ator:** Aluno

**Filtros:** TermoPesquisa (título, autor), TipoConteudo

**Regras:**
- Apenas conteúdos ativos
- Detalhe exibe informações, temas e materiais complementares

---

### RF008 — Registro de interações

**Ator:** Aluno

**Campos:** ID, UsuarioID, ConteudoID, TipoInteracao, TemaID (opcional), Texto, DataRegistro, DataAlteracao

**Tipos de interação:**
- **Comentário Livre** — opinião/percepção sobre o conteúdo (TemaID não obrigatório)
- **Reflexão Orientada** — resposta a questionamento de tema (TemaID obrigatório)

**Regras:**
- Aluno edita apenas suas interações
- Visibilidade para professores definida pela instituição
- **Não usar interações para diagnósticos psicológicos automáticos**

---

### RF009 — Registro de leitura

**Ator:** Aluno

**Campos:** ID, UsuarioID, ConteudoID, StatusLeitura, DataRegistro

**Regras:**
- Sem registros duplicados de conclusão para mesmo aluno/conteúdo
- Usado para acompanhar evolução individual

---

### RF010 — Evolução de leitura

**Ator:** Aluno (visualização)

**Campos calculados:** QuantidadeConcluida, Pontuacao, PercentualProgresso

**Regras:**
- Evolução individual por usuário
- Pontuação como estímulo à leitura
- Ranking, medalhas e desafios diários **fora do MVP**

---

### RF011 — Produções autorais

**Ator:** Aluno

**Campos:** ID, UsuarioID, Titulo, Tipo, Texto, DataCriacao, DataAlteracao, Status

**Tipos:** Conto, Poema, Crônica, Reflexão, Capítulo, Outro

**Regras:**
- Salvar e continuar escrita posteriormente
- Aluno altera apenas suas produções
- Sem ferramentas avançadas de edição/diagramação no MVP

---

### RF012 — Construção de obra autoral

**Ator:** Aluno

**Campos:** ID, UsuarioID, Titulo, Descricao, ProducaoID, Ordem, DataCriacao, Status

**Regras:**
- Obra com várias produções/capítulos
- Aluno organiza ordem das produções
- Sem diagramação/impressão automática no MVP

---

### RF013 — Acompanhamento de alunos

**Ator:** Professor

**Dados:** QuantidadeConteudosConcluidos, Pontuacao, UltimaInteracao (calculados)

**Regras:**
- Professor não altera manualmente histórico do aluno
- Acesso a reflexões/produções conforme regras da instituição

---

### RF014 — Visão geral administrativa

**Ator:** Administrador

**Dados:** QuantidadeUsuarios, QuantidadeAlunos, QuantidadeProfessores, QuantidadeConteudos (calculados)

**Regras:**
- Acesso a gerenciamento de usuários e conteúdos conforme permissão

---

### RF015 — Perfil do usuário

**Ator:** Usuário autenticado

**Operações:** visualizar perfil, alterar senha, encerrar sessão

**Regras:**
- Visualiza apenas próprio perfil
- NomeUsuario e Perfil não alteráveis pelo próprio usuário
- Alteração de senha exige senha atual
- Aluno vê resumo de evolução (RF010) no perfil

---

## 4. Requisitos não funcionais

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RNF01 | Interface intuitiva | Essencial |
| RNF02 | Mensagens de erro claras | Importante |
| RNF03 | Website responsivo | Essencial |
| RNF04 | Compatibilidade navegadores/dispositivos | Essencial |
| RNF05 | Desempenho adequado nas operações principais | Importante |
| RNF06 | Integridade dos dados | Essencial |
| RNF07 | Disponibilidade nos períodos definidos | Importante |
| RNF08 | Backup e recuperação | Essencial |
| RNF09 | Consistência de interface app/web | Importante |
| RNF10 | Legibilidade (textos, botões, elementos) | Essencial |
| RNF11 | Acessibilidade (linguagem simples, ícones, organização) | Essencial |

## 5. Requisitos de segurança

| ID | Risco | Mitigação |
|----|-------|-----------|
| RS001 | Acesso não autorizado a conta | Hash de senha, validação, rate limit, logout seguro |
| RS002 | Aluno acessa dados de outro aluno | Vinculação por usuário, autorização, RLS |
| RS003 | Acesso a funcionalidades de outro perfil | RBAC, verificação no servidor |
| RS004 | Vazamento de dados pessoais | HTTPS, acesso restrito ao BD, sem exposição em erros |
| RS005 | Coleta excessiva (LGPD) | Mínimo necessário, finalidade definida, retenção |
| RS006 | Perda/corrupção de dados | Backups, recuperação, confirmação de exclusão, soft delete |
| RS007 | Alterações sem auditoria | Log de operações administrativas |
| RS008 | Links externos inadequados | Aprovação por profissionais, validação de formato |
| RS009 | Interações/produções expostas | Acesso restrito por padrão |
| RS010 | Incidentes não tratados | Logs de segurança, procedimento de incidentes |

## 6. Tamanho funcional

**140 pontos de função** (contagem para projeto em desenvolvimento).

## 7. Identificação do usuário (decisão de stack)

- **Interface:** Nome de Usuário + Senha
- **Interno:** UUID em todas as relações (leituras, interações, produções)
