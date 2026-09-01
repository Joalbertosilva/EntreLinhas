import { createFileRoute, redirect } from '@tanstack/react-router'
import { resolveAuthenticatedHomePath } from '@/lib/authRedirect'
import { AuthSplitLayout } from '@/components/layout/AuthSplitLayout'
import { SkipLink } from '@/components/ui/SkipLink'
import {
  AuthFormPanel,
  AuthPageHeader,
  BRAND_INSTITUTION,
  BRAND_NAME,
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
            <AuthPageHeader
              title="Entrar"
              description="Use o nome de usuário e a senha fornecidos pela instituição."
            />

            <LoginForm
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
            />
          </AuthFormPanel>

          <p className="mt-4 text-center text-xs leading-relaxed text-text-muted">
            Acesso restrito a usuários cadastrados.
            {' '}Em caso de dúvida, fale com seu professor ou administrador.
          </p>
        </div>
      </AuthSplitLayout>
    </>
  )
}
