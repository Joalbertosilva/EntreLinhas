import { User } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ForgotPasswordInput } from '@tcc-sistema/schemas'
import { AuthField } from '@/features/auth/AuthField'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ForgotPasswordFormProps {
  register: UseFormRegister<ForgotPasswordInput>
  errors: FieldErrors<ForgotPasswordInput>
  isSubmitting: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function ForgotPasswordForm({ register, errors, isSubmitting, onSubmit }: ForgotPasswordFormProps) {
  return (
    <form id="forgot-password-form" onSubmit={onSubmit} className="space-y-4" noValidate>
      <AuthField label="Nome de usuário" htmlFor="nome_usuario" error={errors.nome_usuario?.message} icon={User}>
        <Input autoComplete="username" placeholder="seu.usuario" {...register('nome_usuario')} />
      </AuthField>

      <div className="pt-1.5">
        <Button type="submit" variant="brand" className="h-11 w-full text-[15px]" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Enviar pedido'}
        </Button>
      </div>
    </form>
  )
}
