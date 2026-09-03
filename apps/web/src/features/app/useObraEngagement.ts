import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface ObraComentarioComAutor {
  id: string
  usuario_id: string
  obra_id: string
  texto: string
  created_at: string
  updated_at: string
  profiles: { nome: string } | null
}

export function useMinhaObraCurtida(obraId: string, usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['obra-curtida', obraId, usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obra_curtidas')
        .select('id')
        .eq('obra_id', obraId)
        .eq('usuario_id', usuarioId!)
        .maybeSingle()
      if (error) throw error
      return data as { id: string } | null
    },
  })
}

export function useToggleObraCurtida(obraId: string, usuarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (curtido: boolean) => {
      if (!usuarioId) throw new Error('Sessão inválida')

      if (curtido) {
        const { error } = await supabase
          .from('obra_curtidas')
          .delete()
          .eq('obra_id', obraId)
          .eq('usuario_id', usuarioId)
        if (error) throw error
        return false
      }

      const { error } = await supabase.from('obra_curtidas').insert({
        usuario_id: usuarioId,
        obra_id: obraId,
      })
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obra-curtida', obraId, usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['obra-publica', obraId] })
      queryClient.invalidateQueries({ queryKey: ['obras-publicas'] })
    },
  })
}

export function useObraComentarios(obraId: string) {
  return useQuery({
    queryKey: ['obra-comentarios', obraId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obra_comentarios')
        .select('id, usuario_id, obra_id, texto, created_at, updated_at, profiles(nome)')
        .eq('obra_id', obraId)
        .order('created_at', { ascending: false })
      if (error) throw error

      return (data ?? []).map((row) => ({
        ...row,
        profiles: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles,
      })) as ObraComentarioComAutor[]
    },
  })
}

export function usePublicarObraComentario(obraId: string, usuarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (texto: string) => {
      if (!usuarioId) throw new Error('Sessão inválida')
      const { error } = await supabase.from('obra_comentarios').insert({
        usuario_id: usuarioId,
        obra_id: obraId,
        texto: texto.trim(),
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obra-comentarios', obraId] })
    },
  })
}
