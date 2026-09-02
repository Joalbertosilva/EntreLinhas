import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordInput } from '@tcc-sistema/schemas'
import { useAuth } from '@/features/auth/AuthProvider'
import { AuthFormPanel } from '@/features/auth/AuthFormPanel'
import { AuthPageHeader } from '@/features/auth/AuthPageHeader'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { BRAND_NAME } from '@/features/auth/brand'
import { homePathForPerfil, resolveAuthenticatedHomePath } from '@/lib/authRedirect'
import { getValidSession } from '@/lib/authSession'
import { logAudit } from '@/lib/audit'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { SkipLink } from '@/components/ui/SkipLink'

export const Route = createFileRoute('/trocar-senha')({
  beforeLoad: async () => {
    const session = await getValidSession()
    if (!session) throw redirect({ to: '/login' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('deve_trocar_senha, status')
      .eq('id', session.user.id)
      .single()

    if (!profile?.status) throw redirect({ to: '/login' })
    if (!profile.deve_trocar_senha) {
      const home = await resolveAuthenticatedHomePath()
      if (home !== '/login' && home !== '/trocar-senha') {
        throw redirect({ to: home })
      }
    }
  },
  component: TrocarSenhaPage,
})

function TrocarSenhaPage() {
  const router = useRouter()
  const { profile, refreshProfile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    const { error: authError } = await supabase.auth.updateUser({ password: data.senha_nova })
    if (authError) {
      toast.error('Não foi possível definir a nova senha. Tente novamente.')
      return
    }

    const { error: rpcError } = await supabase.rpc('clear_deve_trocar_senha')
    if (rpcError) {
      toast.error('Senha atualizada, mas não foi possível concluir o cadastro. Tente entrar novamente.')
      return
    }

    await refreshProfile()
    void logAudit({ acao: 'senha.troca_obrigatoria', entidade: 'profiles' })
    toast.success('Senha definida com sucesso')

    if (profile) {
      await router.navigate({ to: homePathForPerfil(profile.perfil) })
    } else {
      const home = await resolveAuthenticatedHomePath()
      if (home !== '/login' && home !== '/trocar-senha') {
        await router.navigate({ to: home })
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-login-form">
      <SkipLink href="#trocar-senha-form" />
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="page-enter w-full max-w-md">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <BrandLogo variant="full" className="max-w-[220px]" />
            <p className="text-sm text-text-muted">{BRAND_NAME}</p>
          </div>

          <AuthFormPanel className="space-y-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <KeyRound className="h-7 w-7" aria-hidden />
            </div>

            <AuthPageHeader
              title="Defina sua nova senha"
              description="Por segurança, você precisa escolher uma senha pessoal antes de continuar usando a plataforma."
            />

            <form
              id="trocar-senha-form"
              onSubmit={handleSubmit(
                onSubmit,
                () => toast.error('Verifique os campos — a senha precisa ter no mínimo 8 caracteres'),
              )}
              className="space-y-4"
              noValidate
            >
              <FormField
                label="Nova senha"
                htmlFor="senha_nova"
                error={errors.senha_nova?.message}
                required
              >
                <PasswordInput id="senha_nova" autoComplete="new-password" {...register('senha_nova')} />
              </FormField>
              <FormField
                label="Confirmar nova senha"
                htmlFor="senha_confirmacao"
                error={errors.senha_confirmacao?.message}
                required
              >
                <PasswordInput
                  id="senha_confirmacao"
                  autoComplete="new-password"
                  {...register('senha_confirmacao')}
                />
              </FormField>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Continuar'}
              </Button>
            </form>
          </AuthFormPanel>
        </div>
      </main>
    </div>
  )
}
