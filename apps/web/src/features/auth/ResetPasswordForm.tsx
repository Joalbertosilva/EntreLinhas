import { Lock } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ResetPasswordInput } from '@tcc-sistema/schemas'
import { AuthField } from '@/features/auth/AuthField'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'

interface ResetPasswordFormProps {
  register: UseFormRegister<ResetPasswordInput>
  errors: FieldErrors<ResetPasswordInput>
  isSubmitting: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function ResetPasswordForm({ register, errors, isSubmitting, onSubmit }: ResetPasswordFormProps) {
  return (
    <form id="reset-password-form" onSubmit={onSubmit} className="space-y-4" noValidate>
      <AuthField label="Nova senha" htmlFor="senha_nova" error={errors.senha_nova?.message} icon={Lock}>
        <PasswordInput autoComplete="new-password" placeholder="Mínimo 8 caracteres" {...register('senha_nova')} />
      </AuthField>

      <AuthField label="Confirmar senha" htmlFor="senha_confirmacao" error={errors.senha_confirmacao?.message} icon={Lock}>
        <PasswordInput autoComplete="new-password" placeholder="Repita a nova senha" {...register('senha_confirmacao')} />
      </AuthField>

      <div className="pt-1.5">
        <Button type="submit" variant="brand" className="h-11 w-full text-[15px]" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
        </Button>
      </div>
    </form>
  )
}
