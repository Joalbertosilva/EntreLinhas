import { useQuery } from '@tanstack/react-query'
import { calcularProgressoAluno } from '@/lib/alunoProgress'
import { supabase } from '@/lib/supabase'

export function useAlunoProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ['aluno-progress', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leituras')
        .select('status_leitura')
        .eq('usuario_id', userId!)

      if (error) throw error
      return calcularProgressoAluno(data ?? [])
    },
    staleTime: 60_000,
  })
}
