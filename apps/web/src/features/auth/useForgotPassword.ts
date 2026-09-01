import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@tcc-sistema/schemas'
import { supabase } from '@/lib/supabase'

export function useForgotPassword() {
  const [enviado, setEnviado] = useState(false)
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const submit = async (data: ForgotPasswordInput) => {
    const { error } = await supabase.functions.invoke('request-password-reset', {
      body: { nome_usuario: data.nome_usuario.trim().toLowerCase() },
    })

    if (error) {
      toast.error('Não foi possível registrar o pedido. Tente novamente ou fale com um professor.')
      return
    }

    setEnviado(true)
    form.reset()
  }

  return {
    register: form.register,
    onSubmit: form.handleSubmit(submit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    enviado,
  }
}
