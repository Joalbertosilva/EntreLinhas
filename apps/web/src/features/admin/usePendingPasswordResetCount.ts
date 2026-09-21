import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePendingPasswordResetCount() {
  return useQuery({
    queryKey: ['password-reset-requests', 'pendente-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('password_reset_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pendente')

      if (error) throw error
      return count ?? 0
    },
    refetchInterval: 60_000,
  })
}
