import { Link } from '@tanstack/react-router'
import { Lock, User } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { LoginInput } from '@tcc-sistema/schemas'
import { AuthField } from '@/features/auth/AuthField'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'

interface LoginFormProps {
  register: UseFormRegister<LoginInput>
  errors: FieldErrors<LoginInput>
  isSubmitting: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function LoginForm({ register, errors, isSubmitting, onSubmit }: LoginFormProps) {
  return (
    <form id="login-form" onSubmit={onSubmit} className="space-y-4" noValidate>
      <AuthField label="Nome de usuário" htmlFor="nome_usuario" error={errors.nome_usuario?.message} icon={User}>
        <Input autoComplete="username" placeholder="seu.usuario" {...register('nome_usuario')} />
      </AuthField>

      <AuthField label="Senha" htmlFor="senha" error={errors.senha?.message} icon={Lock}>
        <PasswordInput autoComplete="current-password" placeholder="Digite sua senha" {...register('senha')} />
      </AuthField>

      <div className="space-y-3 pt-1.5">
        <Button type="submit" variant="brand" className="h-11 w-full text-[15px]" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>

        <p className="text-center">
          <Link
            to="/esqueci-senha"
            className="text-sm font-medium text-brand-navy transition-colors hover:text-[#002855] hover:underline"
          >
            Esqueci minha senha
          </Link>
        </p>
      </div>
    </form>
  )
}
