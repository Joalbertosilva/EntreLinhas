import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { StatusLeituraIntegral } from '@tcc-sistema/types'
import { celebrateIntegralProgressChange } from '@/features/progress/progressCelebration'
import type { AlunoProgressStats } from '@/lib/alunoProgress'
import { supabase } from '@/lib/supabase'

function isMissingIntegralStatusColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ''
  return error.code === '42703' || msg.includes('integral_status')
}

export function useMinhaLeituraIntegral(conteudoId: string | undefined, usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['app-leitura', conteudoId, usuarioId],
    enabled: Boolean(conteudoId && usuarioId),
    queryFn: async () => {
      const withIntegral = await supabase
        .from('leituras')
        .select('id, status_leitura, integral_status')
        .eq('conteudo_id', conteudoId!)
        .eq('usuario_id', usuarioId!)
        .maybeSingle()

      if (!withIntegral.error) {
        return withIntegral.data as {
          id: string
          status_leitura: string
          integral_status: StatusLeituraIntegral | null
        } | null
      }

      if (!isMissingIntegralStatusColumn(withIntegral.error)) throw withIntegral.error

      const base = await supabase
        .from('leituras')
        .select('id, status_leitura')
        .eq('conteudo_id', conteudoId!)
        .eq('usuario_id', usuarioId!)
        .maybeSingle()
      if (base.error) throw base.error
      if (!base.data) return null
      return { ...base.data, integral_status: null as StatusLeituraIntegral | null }
    },
  })
}

export function useAtualizarLeituraIntegral(conteudoId: string, usuarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (integral_status: StatusLeituraIntegral) => {
      if (!usuarioId) throw new Error('Faça login novamente.')

      const { data: leitura, error: readError } = await supabase
        .from('leituras')
        .select('status_leitura')
        .eq('usuario_id', usuarioId)
        .eq('conteudo_id', conteudoId)
        .maybeSingle()
      if (readError) throw readError
      if (leitura?.status_leitura !== 'concluido') {
        throw new Error('Conclua a etapa de estudo antes da leitura integral')
      }

      const { error } = await supabase
        .from('leituras')
        .update({ integral_status })
        .eq('usuario_id', usuarioId)
        .eq('conteudo_id', conteudoId)
      if (error) throw error
      return integral_status
    },
    onSuccess: async (integral_status) => {
      const prevProgress = queryClient.getQueryData<AlunoProgressStats>(['aluno-progress', usuarioId])
      queryClient.invalidateQueries({ queryKey: ['app-leitura', conteudoId, usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['leituras-map', usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['aluno-progress', usuarioId] })
      if (usuarioId) {
        await celebrateIntegralProgressChange(queryClient, usuarioId, integral_status, prevProgress)
      }
    },
  })
}