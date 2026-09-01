import { createFileRoute, redirect } from '@tanstack/react-router'
import { resolveAuthenticatedHomePath } from '@/lib/authRedirect'
import { AuthSplitLayout } from '@/components/layout/AuthSplitLayout'
import { SkipLink } from '@/components/ui/SkipLink'
import {
  AuthFormPanel,
  AuthBackLink,
  AuthNotice,
  AuthPageHeader,
  BRAND_INSTITUTION,
  BRAND_NAME,
  ForgotPasswordForm,
  ForgotPasswordSuccess,
  LoginBrand,
  LoginHeroPanel,
  useForgotPassword,
} from '@/features/auth'

export const Route = createFileRoute('/esqueci-senha')({
  beforeLoad: async () => {
    const path = await resolveAuthenticatedHomePath()
    if (path !== '/login') throw redirect({ to: path })
  },
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { register, onSubmit, errors, isSubmitting, enviado } = useForgotPassword()

  return (
    <>
      <SkipLink href="#forgot-password-form" />
      <AuthSplitLayout
        hero={<LoginHeroPanel />}
        footer={
          <footer className="border-t border-brand-navy/10 px-6 py-3.5 text-center text-xs text-text-muted">
            © {new Date().getFullYear()} {BRAND_NAME} · {BRAND_INSTITUTION}
          </footer>
        }
      >
        <div className="page-enter mx-auto w-full max-w-[400px]">
          <LoginBrand className="mb-6 sm:max-w-[320px]" />

          <AuthFormPanel>
            {enviado ? (
              <ForgotPasswordSuccess />
            ) : (
              <div className="space-y-5">
                <AuthPageHeader
                  title="Esqueci minha senha"
                  description="Informe seu nome de usuário para abrir um pedido de redefinição de senha."
                />

                <AuthNotice title="Como funciona">
                  Um professor ou administrador que estiver com você verá o pedido no gerenciador
                  e definirá uma nova senha. Você não precisa ter acesso a e-mail.
                </AuthNotice>

                <ForgotPasswordForm
                  register={register}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                />
              </div>
            )}
          </AuthFormPanel>

          {!enviado && (
            <AuthBackLink to="/login" label="Voltar ao login" className="mt-5" />
          )}
        </div>
      </AuthSplitLayout>
    </>
  )
}
