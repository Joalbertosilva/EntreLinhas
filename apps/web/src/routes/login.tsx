import { createFileRoute, redirect } from '@tanstack/react-router'
import { resolveAuthenticatedHomePath } from '@/lib/authRedirect'
import { AuthSplitLayout } from '@/components/layout/AuthSplitLayout'
import { AuthLegalFooter } from '@/components/layout/AuthLegalFooter'
import { SkipLink } from '@/components/ui/SkipLink'
import {
  AuthPageHeader,
  LoginBrand,
  LoginForm,
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
        <div className="mb-5 lg:hidden">
          <LoginBrand className="mx-auto max-w-[200px]" />
        </div>

        <AuthPageHeader
          title="Boas-vindas"
          description="Use seu usuário e senha para entrar na plataforma."
        />

        <LoginForm
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />

        <p className="mt-5 text-center text-xs leading-relaxed text-text-muted lg:text-left">
          Acesso restrito a usuários cadastrados. Em caso de dúvida, fale com seu professor ou
          administrador.
        </p>
      </AuthSplitLayout>
    </>
  )
}
