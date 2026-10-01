import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { LegalPageLayout, LegalSection } from '@/components/layout/LegalPageLayout'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/features/auth/brand'

export const Route = createFileRoute('/sobre')({
  loader: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) throw redirect({ to: '/app/sobre' })
    return { isAuthenticated: false }
  },
  component: SobrePublicPage,
})

function SobrePublicPage() {
  return (
    <LegalPageLayout
      title="Sobre o EntreLinhas"
      subtitle={`${BRAND_TAGLINE} — plataforma de leitura e formação da ${BRAND_INSTITUTION}.`}
      backTo="/login"
      backLabel="Voltar ao login"
    >
      <LegalSection id="acesso" title="Como acessar">
        <p>
          O <strong>{BRAND_NAME}</strong> é restrito a alunos e equipe cadastrados pela instituição.
          Faça login para ver o guia completo e interativo dentro da plataforma, em{' '}
          <strong>Sobre nós</strong> no menu superior.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
