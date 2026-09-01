import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { resetPasswordSchema, type ResetPasswordInput } from '@tcc-sistema/schemas'
import { supabase } from '@/lib/supabase'

export function useResetPassword() {
  const navigate = useNavigate()
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const submit = async (data: ResetPasswordInput) => {
    const { error } = await supabase.auth.updateUser({ password: data.senha_nova })

    if (error) {
      toast.error('Não foi possível redefinir a senha. Solicite um novo link ou fale com o administrador.')
      return
    }

    toast.success('Senha redefinida com sucesso.')
    await supabase.auth.signOut()
    navigate({ to: '/login' })
  }

  return {
    register: form.register,
    onSubmit: form.handleSubmit(submit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  }
}
