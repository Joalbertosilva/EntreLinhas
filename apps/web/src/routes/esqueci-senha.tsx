import { createFileRoute, redirect } from '@tanstack/react-router'
import { resolveAuthenticatedHomePath } from '@/lib/authRedirect'
import { AuthLegalFooter } from '@/components/layout/AuthLegalFooter'
import { AuthSplitLayout } from '@/components/layout/AuthSplitLayout'
import { SkipLink } from '@/components/ui/SkipLink'
import {
  AuthFormPanel,
  AuthBackLink,
  AuthNotice,
  AuthPageHeader,
  ForgotPasswordForm,
  ForgotPasswordSuccess,
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
        footer={<AuthLegalFooter />}
      >
        <div className="page-enter w-full">
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
