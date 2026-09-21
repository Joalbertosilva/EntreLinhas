import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { StatusLeitura } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

export function useLeiturasMap(userId: string | undefined) {
  return useQuery({
    queryKey: ['leituras-map', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Record<string, StatusLeitura>> => {
      const { data, error } = await supabase
        .from('leituras')
        .select('conteudo_id, status_leitura')
        .eq('usuario_id', userId!)

      if (error) throw error

      const map: Record<string, StatusLeitura> = {}
      for (const row of data ?? []) {
        map[row.conteudo_id as string] = row.status_leitura as StatusLeitura
      }
      return map
    },
  })
}

export function useAtualizarLeituraUsuario(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { conteudoId: string; status_leitura: StatusLeitura }) => {
      if (!userId) throw new Error('Sessão inválida')

      const { error } = await supabase.from('leituras').upsert(
        {
          usuario_id: userId,
          conteudo_id: input.conteudoId,
          status_leitura: input.status_leitura,
        },
        { onConflict: 'usuario_id,conteudo_id' },
      )
      if (error) throw error
      return input
    },
    onSuccess: ({ conteudoId }) => {
      queryClient.invalidateQueries({ queryKey: ['leituras-map', userId] })
      queryClient.invalidateQueries({ queryKey: ['minhas-leituras', userId] })
      queryClient.invalidateQueries({ queryKey: ['app-leitura', conteudoId, userId] })
      queryClient.invalidateQueries({ queryKey: ['aluno-progress', userId] })
    },
  })
}
