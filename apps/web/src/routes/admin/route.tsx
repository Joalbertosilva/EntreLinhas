import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('perfil, status')
      .eq('id', session.user.id)
      .single()

    if (!profile?.status || !['administrador', 'professor'].includes(profile.perfil)) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})
