import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@tcc-sistema/schemas'
import { supabase } from '@/lib/supabase'

export function useForgotPassword() {
  const [enviado, setEnviado] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { nome_usuario: '' },
  })

  const submit = form.handleSubmit(async (data) => {
    setSubmitError(null)

    const { error } = await supabase.functions.invoke('request-password-reset', {
      body: { nome_usuario: data.nome_usuario.trim().toLowerCase() },
    })

    if (error) {
      setSubmitError('Não foi possível registrar o pedido. Tente novamente ou fale com um professor.')
      return
    }

    setEnviado(true)
    form.reset()
  })

  return {
    control: form.control,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    enviado,
    submitError,
    submit,
  }
}
