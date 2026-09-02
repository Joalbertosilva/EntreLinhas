import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getValidSession } from '@/lib/authSession'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getValidSession()
    if (!session) throw redirect({ to: '/login' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('perfil, status, deve_trocar_senha')
      .eq('id', session.user.id)
      .single()

    if (!profile?.status || !['administrador', 'professor'].includes(profile.perfil)) {
      throw redirect({ to: '/login' })
    }
    if (profile.deve_trocar_senha) throw redirect({ to: '/trocar-senha' })
  },
  component: AdminLayout,
})
