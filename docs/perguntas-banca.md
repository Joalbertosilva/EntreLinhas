# Perguntas prováveis — banca e orientador

Respostas sugeridas para defesa/apresentação do EntreLinhas. Adapte ao seu discurso pessoal.

---

## Escopo e relevância

**Por que another plataforma de leitura?**

> Não é só um repositório de textos. O EntreLinhas integra leitura paginada, reflexão orientada (privada), comentários, evolução gamificada leve e produção autoral publicável na comunidade — com acompanhamento pedagógico e auditoria para o contexto institucional.

**Qual o diferencial do TCC em relação a apps genéricos de leitura?**

> Três eixos: (1) reflexão orientada com privacidade garantida por RLS; (2) minha obra com publicação na comunidade; (3) gerenciador com auditoria e perfis (admin/professor/aluno). Acessibilidade nativa no mobile (TTS, escala de fonte) reforça inclusão.

---

## Arquitetura e tecnologia

**Por que Supabase em vez de um backend Node/Java próprio?**

> Para o MVP acadêmico, Supabase concentra Auth, banco, storage e RLS com menos código customizado. Isso permitiu focar nas regras de negócio e nas interfaces. Edge Functions cobrem operações sensíveis (criar usuário, reset de senha) sem expor service role no cliente.

**Como garantem segurança dos dados dos alunos?**

> JWT do Supabase Auth; Row Level Security no PostgreSQL — cada aluno acessa só seus dados; reflexões privadas isoladas; gerenciador protegido por perfil; login sem enumeração de contas inativas; auditoria de ações administrativas (RS007).

**O que é RLS e onde usamos?**

> Row Level Security — políticas SQL que filtram linhas por `auth.uid()` e perfil. Exemplo: aluno vê só suas reflexões; staff lê agregados conforme política; conteúdos públicos leem todos autenticados.

**Por que monorepo?**

> Tipos e schemas Zod compartilhados entre web, mobile e Edge Functions evitam divergência de contrato. Uma migration afeta todas as plataformas de forma consistente.

---

## Mobile vs web

**O app mobile está pronto?**

> Sim para demonstração e piloto: login, catálogo, leitor, leituras, minha obra, engajamento, progresso, perfil e acessibilidade. O gerenciador permanece na web por escopo e ergonomia. Paridade funcional com `/app` está em ~90%; deploy em lojas (App Store/Play Store) não faz parte deste MVP.

**Por que o professor não usa o mobile?**

> Decisão de escopo: CRUD extenso, auditoria e gestão de usuários exigem tela grande. Staff acessa `/admin` na web; no mobile, perfil staff pode linkar ao painel web.

---

## Requisitos e validação

**Todos os requisitos foram atendidos?**

> RF001–RF015 implementados nas superfícies previstas (ver [`validacao-requisitos.md`](./validacao-requisitos.md)). Pendências são não-funcionais: deploy (RNF07), LGPD formal completo (RS005), testes E2E e auditoria a11y/responsivo formal.

**Como testaram o sistema?**

> Roteiros manuais (gerenciador + aluno web), validação de build (`pnpm web:build`), 8 testes automatizados de schemas Zod, revisão de RLS na implantação, e testes iterativos no mobile (iOS/Android).

**Por que poucos testes automatizados?**

> Priorizamos cobertura das regras de negócio nos schemas (Vitest) e validação manual guiada pelos roteiros. E2E com Playwright está no roadmap pós-apresentação — trade-off comum em MVP acadêmico com prazo fixo.

---

## LGPD e ética

**O sistema está em conformidade com a LGPD?**

> Parcialmente. Temos página de privacidade, minimização de dados, reflexões privadas, soft delete e auditoria. Falta export formal de dados do titular e textos institucionais (DPO) — previstos como evolução com a instituição.

**Reflexões orientadas são privadas?**

> Sim. Políticas RLS garantem que só o autor e staff autorizado acessem reflexões privadas; comentários públicos seguem regras distintas.

---

## Limitações e trabalho futuro

**Por que não está na internet (deploy)?**

> Escopo do TCC focou em MVP funcional e documentado. Deploy (Vercel/Netlify + domínio CESMAC) é o próximo passo natural após validação com orientador e stakeholder.

**O que faria diferente com mais tempo?**

> CI/CD com build + testes; E2E dos fluxos críticos; deploy staging; export LGPD; publicação nas lojas mobile; profiling de performance; auditoria WCAG formal.

**E se a internet cair na apresentação?**

> Plano B: vídeo gravado do fluxo admin + aluno, ou screenshots sequenciais. Por isso o ensaio local 24h antes é obrigatório.

---

## Perguntas difíceis — respostas curtas

| Pergunta | Resposta em uma linha |
|----------|----------------------|
| Escala para 10 mil alunos? | Supabase escala horizontalmente; RLS e índices já considerados; load test não foi escopo do TCC. |
| Offline no mobile? | Leitura usa cache local parcial (AsyncStorage para página); offline completo é evolução futura. |
| Plágio nas obras? | MVP não inclui detecção automática; moderação é responsabilidade pedagógica/institucional. |
| Custo operacional? | Supabase free/pro tier; custo baixo para piloto institucional. |
| Código aberto? | Repositório GitHub; licença conforme orientação da instituição. |

---

## Documentos de apoio na mesa

- [`validacao-requisitos.md`](./validacao-requisitos.md)
- [`mvp-scope.md`](./mvp-scope.md)
- [`user-flows.md`](./user-flows.md)
- [`security.md`](./security.md)
- [`roteiro-apresentacao.md`](./roteiro-apresentacao.md)
