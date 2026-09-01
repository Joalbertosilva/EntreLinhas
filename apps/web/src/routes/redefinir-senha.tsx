import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AuthSplitLayout } from '@/components/layout/AuthSplitLayout'
import { SkipLink } from '@/components/ui/SkipLink'
import { supabase } from '@/lib/supabase'
import {
  AuthBackLink,
  AuthFormPanel,
  AuthPageHeader,
  BRAND_INSTITUTION,
  BRAND_NAME,
  LoginHeroPanel,
  ResetPasswordForm,
  useResetPassword,
} from '@/features/auth'

export const Route = createFileRoute('/redefinir-senha')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { register, onSubmit, errors, isSubmitting } = useResetPassword()
  const [linkValido, setLinkValido] = useState<boolean | null>(null)

  useEffect(() => {
    let ativo = true

    const verificarSessao = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!ativo) return
      setLinkValido(Boolean(session))
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setLinkValido(true)
      }
    })

    verificarSessao()
    const timer = window.setTimeout(verificarSessao, 800)

    return () => {
      ativo = false
      subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <SkipLink href="#reset-password-form" />
      <AuthSplitLayout
        hero={<LoginHeroPanel />}
        footer={
          <footer className="border-t border-brand-navy/10 px-6 py-3.5 text-center text-xs text-text-muted">
            © {new Date().getFullYear()} {BRAND_NAME} · {BRAND_INSTITUTION}
          </footer>
        }
      >
        <div className="page-enter w-full">
          <AuthFormPanel className="space-y-5">
            {linkValido === null && (
              <p className="text-sm text-text-muted">Validando link de recuperação...</p>
            )}

            {linkValido === false && (
              <div className="space-y-4">
                <AuthPageHeader
                  title="Link inválido ou expirado"
                  description="Solicite uma nova recuperação de senha ou fale com o administrador da instituição."
                />
                <AuthBackLink to="/esqueci-senha" label="Solicitar novo link" />
              </div>
            )}

            {linkValido && (
              <>
                <AuthPageHeader
                  title="Nova senha"
                  description="Escolha uma senha segura com no mínimo 8 caracteres."
                />
                <ResetPasswordForm
                  register={register}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                />
              </>
            )}
          </AuthFormPanel>

          <AuthBackLink to="/login" label="Voltar ao login" className="mt-5" />
        </div>
      </AuthSplitLayout>
    </>
  )
}
