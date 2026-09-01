import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('perfil, status')
      .eq('id', session.user.id)
      .single()

    if (!profile?.status) throw redirect({ to: '/login' })
  },
  component: AppLayout,
})
