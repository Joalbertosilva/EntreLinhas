import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { changePasswordSchema, nomeUsuarioToAuthEmail, type ChangePasswordInput } from '@tcc-sistema/schemas'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { PasswordInput } from '@/components/ui/PasswordInput'

export const Route = createFileRoute('/admin/perfil')({
  component: PerfilPage,
})

const PERFIL_LABEL = {
  administrador: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
} as const

function PerfilPage() {
  const { profile } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    if (!profile) return

    const email = nomeUsuarioToAuthEmail(profile.nome_usuario)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: data.senha_atual,
    })
    if (authError) {
      toast.error('Senha atual incorreta')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: data.senha_nova })
    if (error) {
      toast.error('Não foi possível alterar a senha. Tente novamente.')
      return
    }
    toast.success('Senha atualizada')
    reset()
  }

  if (!profile) return null

  return (
    <>
      <PageHeader
        title="Minha conta"
        description="Seus dados de acesso ao gerenciador."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-text">Dados da conta</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text-muted">Nome</dt>
                <dd className="font-medium text-text">{profile.nome}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Usuário</dt>
                <dd className="font-mono text-text">{profile.nome_usuario}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Perfil</dt>
                <dd className="font-medium text-text">{PERFIL_LABEL[profile.perfil]}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="font-semibold text-text mb-1">Segurança</h2>
            <p className="text-sm text-text-muted mb-5">
              Defina uma nova senha de acesso.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <FormField label="Senha atual" htmlFor="senha_atual" error={errors.senha_atual?.message} required>
                <PasswordInput autoComplete="current-password" {...register('senha_atual')} />
              </FormField>
              <FormField label="Nova senha" htmlFor="senha_nova" error={errors.senha_nova?.message} required>
                <PasswordInput autoComplete="new-password" {...register('senha_nova')} />
              </FormField>
              <FormField
                label="Confirmar nova senha"
                htmlFor="senha_confirmacao"
                error={errors.senha_confirmacao?.message}
                required
              >
                <PasswordInput autoComplete="new-password" {...register('senha_confirmacao')} />
              </FormField>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Atualizar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
