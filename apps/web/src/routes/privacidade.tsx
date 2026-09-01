import { createFileRoute, Link } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { LegalPageLayout, LegalSection } from '@/components/layout/LegalPageLayout'
import { BRAND_INSTITUTION, BRAND_NAME } from '@/features/auth/brand'

export const Route = createFileRoute('/privacidade')({
  loader: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { isAuthenticated: Boolean(session) }
  },
  component: PrivacidadePage,
})

function PrivacidadePage() {
  const { isAuthenticated } = Route.useLoaderData()

  return (
    <LegalPageLayout
      title="Política de privacidade"
      subtitle={`Como o ${BRAND_NAME} trata seus dados pessoais na plataforma de leitura e formação da ${BRAND_INSTITUTION}.`}
      backTo={isAuthenticated ? '/app' : '/login'}
      backLabel={isAuthenticated ? 'Voltar à plataforma' : 'Voltar ao login'}
    >
      <nav
        aria-label="Sumário da política"
        className="rounded-2xl border border-primary/10 bg-primary-light/35 p-5 text-sm"
      >
        <p className="mb-2 font-semibold text-brand-navy">Neste documento</p>
        <ol className="grid gap-1.5 sm:grid-cols-2">
          {SUMMARY.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-primary hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <LegalSection id="quem-somos" title="1. Quem somos">
        <p>
          O <strong>{BRAND_NAME}</strong> é uma plataforma educacional desenvolvida no contexto do TCC da{' '}
          {BRAND_INSTITUTION}, com foco em leitura, reflexão e produção textual por adolescentes em
          contexto institucional.
        </p>
        <p>
          O acesso é restrito a usuários cadastrados pela instituição (alunos, professores e
          administradores). Não há cadastro público.
        </p>
      </LegalSection>

      <LegalSection id="dados-coletados" title="2. Quais dados coletamos">
        <p>Coletamos apenas o necessário para o funcionamento pedagógico da plataforma:</p>
        <ul>
          <li>
            <strong>Identificação:</strong> nome completo e nome de usuário (login)
          </li>
          <li>
            <strong>Perfil de acesso:</strong> aluno, professor ou administrador
          </li>
          <li>
            <strong>Atividades pedagógicas:</strong> leituras, interações, reflexões, produções e obras
            autorais
          </li>
          <li>
            <strong>Dados técnicos mínimos:</strong> registros de sessão e autenticação (via Supabase)
          </li>
        </ul>
        <p>
          <strong>Não coletamos</strong> e-mail pessoal do aluno para login (usamos identificador
          interno), dados de localização, contatos do dispositivo ou diagnósticos psicológicos
          automatizados.
        </p>
      </LegalSection>

      <LegalSection id="finalidade" title="3. Para que usamos os dados">
        <ul>
          <li>Autenticar e personalizar o acesso à plataforma</li>
          <li>Registrar progresso de leitura e participação</li>
          <li>Permitir reflexões, comentários e produções textuais</li>
          <li>Acompanhar a evolução pedagógica (professor/administrador)</li>
          <li>Garantir segurança, auditoria e suporte institucional</li>
        </ul>
      </LegalSection>

      <LegalSection id="compartilhamento" title="4. Compartilhamento e acesso">
        <p>
          Seus dados <strong>não são vendidos</strong> nem compartilhados com fins comerciais. O
          acesso obedece ao perfil:
        </p>
        <ul>
          <li>
            <strong>Aluno:</strong> vê e edita apenas os próprios registros
          </li>
          <li>
            <strong>Professor:</strong> acompanha alunos conforme permissões institucionais
          </li>
          <li>
            <strong>Administrador:</strong> gerencia usuários, conteúdos e auditoria
          </li>
        </ul>
        <p>
          Obras publicadas voluntariamente pelo aluno ficam visíveis na seção pública da comunidade,
          conforme escolha do autor.
        </p>
        <p>
          A infraestrutura de dados é hospedada no <strong>Supabase</strong> (PostgreSQL na nuvem),
          com criptografia em trânsito (HTTPS) e controles de acesso (RLS).
        </p>
      </LegalSection>

      <LegalSection id="retencao" title="5. Retenção e exclusão">
        <p>
          Os dados permanecem enquanto a conta estiver ativa ou enquanto a instituição mantiver a
          plataforma em uso pedagógico. Usuários podem ser inativados (soft delete) pelo
          administrador, sem exclusão imediata de histórico pedagógico, salvo orientação
          institucional.
        </p>
        <p>
          Solicitações de exclusão ou exportação de dados devem ser feitas à instituição responsável
          ({BRAND_INSTITUTION}).
        </p>
      </LegalSection>

      <LegalSection id="direitos" title="6. Seus direitos (LGPD)">
        <p>Nos termos da Lei nº 13.709/2018 (LGPD), você pode solicitar à instituição:</p>
        <ul>
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso aos dados</li>
          <li>Correção de dados incompletos ou desatualizados</li>
          <li>Anonimização, bloqueio ou eliminação, quando aplicável</li>
          <li>Informação sobre compartilhamento</li>
        </ul>
        <p>
          Para exercer esses direitos, procure o professor responsável ou a coordenação da{' '}
          {BRAND_INSTITUTION}.
        </p>
      </LegalSection>

      <LegalSection id="seguranca" title="7. Segurança">
        <ul>
          <li>Senhas armazenadas com hash (Supabase Auth)</li>
          <li>Isolamento de dados entre alunos (Row Level Security)</li>
          <li>Operações administrativas sensíveis via funções seguras no servidor</li>
          <li>Mensagens de erro genéricas — sem exposição de dados técnicos ao usuário</li>
        </ul>
      </LegalSection>

      <LegalSection id="cookies" title="8. Cookies e armazenamento local">
        <p>
          Utilizamos cookies e armazenamento local estritamente necessários para manter sua sessão de
          login e preferências básicas da interface. Não utilizamos cookies de rastreamento
          publicitário.
        </p>
      </LegalSection>

      <LegalSection id="contato" title="9. Contato">
        <p>
          Dúvidas sobre privacidade: entre em contato com a instituição responsável (
          {BRAND_INSTITUTION}) ou com o administrador da plataforma {BRAND_NAME}.
        </p>
        <p className="text-xs">
          Documento técnico complementar: consulte também a documentação interna de segurança do
          projeto.
        </p>
      </LegalSection>

      <p className="text-center text-xs text-text-muted">
        Ao utilizar o {BRAND_NAME}, você declara estar ciente desta política no contexto de uso
        educacional institucional.{' '}
        {!isAuthenticated && (
          <>
            <Link to="/login" className="font-medium text-primary hover:underline">
              Fazer login
            </Link>
          </>
        )}
      </p>
    </LegalPageLayout>
  )
}

const SUMMARY = [
  { id: 'quem-somos', label: 'Quem somos' },
  { id: 'dados-coletados', label: 'Dados coletados' },
  { id: 'finalidade', label: 'Finalidade' },
  { id: 'compartilhamento', label: 'Compartilhamento' },
  { id: 'retencao', label: 'Retenção' },
  { id: 'direitos', label: 'Seus direitos' },
  { id: 'seguranca', label: 'Segurança' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'contato', label: 'Contato' },
] as const
