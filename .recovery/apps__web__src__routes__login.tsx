import { createFileRoute, redirect } from '@tanstack/react-router'
import { resolveAuthenticatedHomePath } from '@/lib/authRedirect'
import { AuthSplitLayout } from '@/components/layout/AuthSplitLayout'
import { AuthLegalFooter } from '@/components/layout/AuthLegalFooter'
import { SkipLink } from '@/components/ui/SkipLink'
import {
  AuthFormPanel,
  AuthPageHeader,
  LoginForm,
  LoginBrand,
  LoginHeroPanel,
  useLogin,
} from '@/features/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const path = await resolveAuthenticatedHomePath()
    if (path !== '/login') throw redirect({ to: path })
  },
  component: LoginPage,
})

function LoginPage() {
  const { register, onSubmit, errors, isSubmitting } = useLogin()

  return (
    <>
      <SkipLink href="#login-form" />
      <AuthSplitLayout hero={<LoginHeroPanel />} footer={<AuthLegalFooter />}>
        <div className="page-enter mx-auto w-full max-w-[400px] lg:mx-0">
          <div className="mb-6 lg:hidden">
            <LoginBrand className="mx-auto max-w-[260px]" />
          </div>

          <AuthFormPanel className="space-y-5">
            <AuthPageHeader
              title="Entrar na plataforma"
              description="Use o nome de usuário e a senha fornecidos pela instituição."
            />

            <LoginForm
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
            />
          </AuthFormPanel>

          <p className="mt-4 text-center text-xs leading-relaxed text-text-muted lg:text-left">
            Acesso restrito a usuários cadastrados. Em caso de dúvida, fale com seu professor ou
            administrador.
          </p>
        </div>
      </AuthSplitLayout>
    </>
  )
}
