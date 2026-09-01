import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Conteudo, MaterialComplementar, StatusLeitura, Tema } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

export function useConteudoDetail(conteudoId: string) {
  return useQuery({
    queryKey: ['app-conteudo', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .eq('id', conteudoId)
        .eq('status', true)
        .single()
      if (error) throw error
      return data as Conteudo
    },
  })
}

export function useConteudoTemas(conteudoId: string) {
  return useQuery({
    queryKey: ['app-temas', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temas')
        .select('*')
        .eq('conteudo_id', conteudoId)
        .eq('status', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Tema[]
    },
  })
}

export function useConteudoMateriais(conteudoId: string) {
  return useQuery({
    queryKey: ['app-materiais', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais_complementares')
        .select('*')
        .eq('conteudo_id', conteudoId)
        .eq('status', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as MaterialComplementar[]
    },
  })
}

export function useMinhaLeitura(conteudoId: string, usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['app-leitura', conteudoId, usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leituras')
        .select('id, status_leitura')
        .eq('conteudo_id', conteudoId)
        .eq('usuario_id', usuarioId!)
        .maybeSingle()
      if (error) throw error
      return data as { id: string; status_leitura: StatusLeitura } | null
    },
  })
}

export function useAtualizarLeitura(conteudoId: string, usuarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (status_leitura: StatusLeitura) => {
      if (!usuarioId) throw new Error('Sessão inválida')

      const { error } = await supabase.from('leituras').upsert(
        {
          usuario_id: usuarioId,
          conteudo_id: conteudoId,
          status_leitura,
        },
        { onConflict: 'usuario_id,conteudo_id' },
      )
      if (error) throw error
      return status_leitura
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-leitura', conteudoId, usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['leituras-map', usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['minhas-leituras', usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['home-continue-reading', usuarioId] })
    },
  })
}
