import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { loginSchema, nomeUsuarioToAuthEmail, type LoginInput } from '@tcc-sistema/schemas'
import { fetchAuthProfile, resolvePostLoginRoute } from '@/lib/authSession'
import { supabase } from '@/lib/supabase'

export function useLogin() {
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nome_usuario: '', senha: '' },
  })

  const submit = form.handleSubmit(async (data) => {
    setAuthError(null)

    const email = nomeUsuarioToAuthEmail(data.nome_usuario)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: data.senha,
    })

    if (error) {
      setAuthError('Credenciais inválidas. Verifique seu usuário e senha.')
      return
    }

    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) {
      setAuthError('Não foi possível concluir o login. Tente novamente.')
      return
    }

    const profile = await fetchAuthProfile(userId)
    if (!profile?.status) {
      await supabase.auth.signOut()
      setAuthError('Credenciais inválidas. Verifique seu usuário e senha.')
      return
    }

    const route = await resolvePostLoginRoute(profile)
    router.replace(route as never)
  })

  return {
    control: form.control,
    register: form.register,
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
    authError,
    submit,
  }
}
