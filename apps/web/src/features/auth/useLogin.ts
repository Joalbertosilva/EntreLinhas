import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { loginSchema, nomeUsuarioToAuthEmail, type LoginInput } from '@tcc-sistema/schemas'
import { homePathForPerfil } from '@/lib/authRedirect'
import { supabase } from '@/lib/supabase'

export function useLogin() {
  const router = useRouter()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const submit = async (data: LoginInput) => {
    const email = nomeUsuarioToAuthEmail(data.nome_usuario)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: data.senha,
    })

    if (error) {
      toast.error('Credenciais inválidas. Verifique seu usuário e senha.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('perfil, status, deve_trocar_senha')
      .eq('id', user.id)
      .single()

    if (!profile?.status) {
      await supabase.auth.signOut()
      toast.error('Credenciais inválidas. Verifique seu usuário e senha.')
      return
    }

    if (profile.deve_trocar_senha) {
      await router.navigate({ to: '/trocar-senha' })
      return
    }

    await router.navigate({ to: homePathForPerfil(profile.perfil) })
  }

  return {
    register: form.register,
    onSubmit: form.handleSubmit(submit),
    errors: form.formState.errors,
    isSubmitting: form.formState.isSubmitting,
  }
}
