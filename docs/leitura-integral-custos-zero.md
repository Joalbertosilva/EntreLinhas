# Leitura integral — garantia de custo zero (aluno, professor, admin)

Documento de **pré-condição** antes de implementar leitura integral com texto na plataforma e tradução “EntreLinhas”.  
Objetivo: **ninguém que usa o gerenciador ou o app paga** por tradução, leitura ou editora; **não há cobrança in-app**.

---

## O que está garantido no produto

| Persona | Garantia |
|---------|----------|
| **Aluno** | Sem assinatura, sem compra, sem API paga por página. Leitura integral usa apenas conteúdo já hospedado no projeto. |
| **Professor** | Sem ferramentas pagas, sem “créditos de tradução”. Fluxo admin: ativar obra, revisar capítulos, publicar. |
| **Administrador** | Idem professor. Sem integração que exija cartão (Google Cloud Translation, DeepL, etc.) em **runtime**. |

**Proibido no escopo “custo zero”:**

- Cobrança, paywall ou plano pago para leitura integral.
- Chamar API de tradução **paga** a cada import ou a cada leitura.
- Depender de PDF/link de **editora comercial** para o texto integral.
- Redirecionar o aluno para site externo como leitura principal (decisão de produto atual).

---

## Quem pode ter custo (fora do app)

Infraestrutura do **projeto TCC** (Supabase na nuvem, domínio, deploy) é decisão **institucional / desenvolvimento**, não do aluno nem do professor no dia a dia.  
Usuários finais **não inserem cartão** em nenhuma tela do EntreLinhas para esta funcionalidade.

Custo operacional da nuvem (tier Supabase, etc.) é **independente** da leitura integral: texto completo pesa pouco perto de imagens; ver `docs/supabase-nuvem.md`.

---

## Como obter português sem pagar tradução

Três caminhos **compatíveis com R$ 0** para todos os usuários do app. Pode combinar.

### 1. Obras já em português e em domínio público (sem traduzir)

Ex.: Machado de Assis, muitas crônicas clássicas, textos do Domínio Público **já em PT**.  
Importação: capítulos em PT → banco. **Zero tradução.**

### 2. Texto integral pré-processado (recomendado para piloto)

Tradução ou formatação roda **uma vez**, fora do fluxo pago:

- Script local no monorepo (open source, ex. Argos Translate) no PC do mantenedor; ou
- Workflow manual `workflow_dispatch` no GitHub Actions (minutos grátis); ou
- JSON/seed versionado no repositório após revisão mínima.

O **admin na web** só:

- escolhe obra do catálogo pré-importado, ou
- envia arquivo de capítulos já gerado, ou
- confirma publicação após import interno.

**Nenhuma chamada a API paga no Supabase Edge / servidor em produção.**

### 3. Tradução open source no import (somente se rodar sem API paga)

Se no futuro houver “Importar” no servidor:

- Só com motor **open source** self-hosted **sem cobrança por caractere**, e
- Apenas no momento do **publish** (uma vez por obra), nunca por aluno.

Se não couber no Edge Function sem custo → cair para o modelo **2 (pré-processado)**.

**Fora do escopo custo zero:** Google Cloud Translation, DeepL, Azure Translator com faturamento; “colar resultado do Google Tradutor” como pipeline oficial.

---

## Armazenamento do texto (não “pesa” de forma crítica no MVP)

- Capítulos em tabela dedicada (`conteudo_id`, `ordem`, `titulo`, `texto_pt`, opcional `texto_origem`).
- Ordem de grandeza: *O Pequeno Príncipe* ~100–300 KB de texto; dezenas de obras ainda são MB, não GB.
- `conteudo_textual` no cadastro de **estudo** permanece curto; integral **não** duplica estudo no mesmo campo.

---

## Licença e “tradução EntreLinhas”

- Fonte: obra em **domínio público** (original documentado).
- Tradução exibida: **EntreLinhas (automática ou edição interna)** — não é tradução de editora.
- UI: aviso curto de que a tradução automática pode conter imprecisões.
- Sem integral configurada ou sem licença DP → só etapa de estudo + mensagem clara.

---

## Critérios de aceite antes de merge da feature

1. Nenhum fluxo de aluno dispara serviço pago por requisição.
2. Nenhum fluxo de admin/professor exige chave de API **billing-enabled** de tradução em produção.
3. Teste manual: ativar leitura integral de obra piloto **sem cartão** em nenhum serviço.
4. Documentar na obra: autor, licença, origem do texto, método de tradução (`preimportado` | `pt_nativo` | `oss_local`).
5. Variáveis de ambiente: **não** adicionar secrets de tradução paga ao client; service role só para import interno já previsto.

---

## Piloto sugerido (custo zero)

1. Uma obra **curta** em DP (*O Pequeno Príncipe* ou texto já em PT).
2. Capítulos gerados via script local / seed JSON → Supabase.
3. Mesmo `conteudo` de estudo + desbloqueio + leitor paginado.

---

## Referências no repositório

- Escopo MVP: `docs/mvp-scope.md`
- Nuvem e dados: `docs/supabase-nuvem.md`
- RF004 conteúdos: `docs/requirements.md`

Atualizar este doc se a política de custo ou o fluxo de import mudar.

---

## Implementação (piloto)

- Migration: `supabase/migrations/20261124120000_leitura_integral.sql`
- JSON piloto: `scripts/leitura-integral/pequeno-principe-piloto.json`
- Admin: seção **Leitura integral** no formulário de livro
- Aluno: seção após estudo concluído em `/app/conteudo/:id` (livro)

Aplicar migration na nuvem: `supabase db push` (revisar SQL antes — ver `docs/supabase-nuvem.md`).