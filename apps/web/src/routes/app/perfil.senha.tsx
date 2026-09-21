import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ArrowLeft, Lock } from 'lucide-react'
import { changePasswordSchema, nomeUsuarioToAuthEmail, type ChangePasswordInput } from '@tcc-sistema/schemas'
import { ScrollReveal } from '@/features/app'
import { useAuth } from '@/features/auth/AuthProvider'
import { logAudit } from '@/lib/audit'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { FormField } from '@/components/ui/FormField'
import { PasswordInput } from '@/components/ui/PasswordInput'

export const Route = createFileRoute('/app/perfil/senha')({
  component: AlterarSenhaPage,
})

function AlterarSenhaPage() {
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
    if (!profile) {
      toast.error('Perfil não carregado. Atualize a página e tente novamente.')
      return
    }

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
    void logAudit({
      acao: 'senha.alterar',
      entidade: 'profiles',
      entidade_id: profile.id,
      detalhes: { nome_usuario: profile.nome_usuario, origem: 'perfil' },
    })
    toast.success('Senha atualizada')
    reset()
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <ScrollReveal>
        <Link
          to="/app/perfil"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar para minha conta
        </Link>
      </ScrollReveal>

      <ScrollReveal delayMs={40}>
        <header className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-[var(--shadow-soft)] ring-1 ring-primary/15">
            <Lock className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 pt-1">
            <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">Alterar senha</h1>
            <p className="mt-2 text-sm text-text-muted">
              Use sua senha atual para definir uma nova senha de acesso.
            </p>
          </div>
        </header>
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        <Card className="border-primary/10 bg-white/85 backdrop-blur-sm">
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit(
                onSubmit,
                () => toast.error('Verifique os campos — a senha nova precisa ter no mínimo 8 caracteres'),
              )}
              className="space-y-4"
              noValidate
            >
              <FormField
                label="Senha atual"
                htmlFor="senha_atual"
                error={errors.senha_atual?.message}
                required
              >
                <PasswordInput id="senha_atual" autoComplete="current-password" {...register('senha_atual')} />
              </FormField>
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
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Atualizar senha'}
                </Button>
                <Link to="/app/perfil">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  )
}
