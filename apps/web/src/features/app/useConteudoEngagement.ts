import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Interacao, InteracaoComAutor, TipoInteracao } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

export function useMinhaCurtida(conteudoId: string, usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['app-curtida', conteudoId, usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudo_curtidas')
        .select('id')
        .eq('conteudo_id', conteudoId)
        .eq('usuario_id', usuarioId!)
        .maybeSingle()
      if (error) throw error
      return data as { id: string } | null
    },
  })
}

export function useToggleCurtida(conteudoId: string, usuarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (curtido: boolean) => {
      if (!usuarioId) throw new Error('Sessão inválida')

      if (curtido) {
        const { error } = await supabase
          .from('conteudo_curtidas')
          .delete()
          .eq('conteudo_id', conteudoId)
          .eq('usuario_id', usuarioId)
        if (error) throw error
        return false
      }

      const { error } = await supabase.from('conteudo_curtidas').insert({
        usuario_id: usuarioId,
        conteudo_id: conteudoId,
      })
      if (error) throw error
      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-curtida', conteudoId, usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['app-conteudo', conteudoId] })
      queryClient.invalidateQueries({ queryKey: ['app-conteudos'] })
    },
  })
}

export function useMinhasInteracoes(conteudoId: string, usuarioId: string | undefined) {
  return useQuery({
    queryKey: ['app-minhas-interacoes', conteudoId, usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interacoes')
        .select('*')
        .eq('conteudo_id', conteudoId)
        .eq('usuario_id', usuarioId!)
      if (error) throw error
      return data as Interacao[]
    },
  })
}

export function useComentariosPublicos(conteudoId: string) {
  return useQuery({
    queryKey: ['app-comentarios-publicos', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interacoes')
        .select('id, usuario_id, conteudo_id, tipo_interacao, tema_id, texto, created_at, updated_at, profiles(nome)')
        .eq('conteudo_id', conteudoId)
        .eq('tipo_interacao', 'comentario_livre')
        .order('created_at', { ascending: false })
      if (error) throw error

      return (data ?? []).map((row) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
        return {
          ...row,
          profiles: profile ?? null,
        }
      }) as InteracaoComAutor[]
    },
  })
}

export function useSalvarInteracao(conteudoId: string, usuarioId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      id?: string
      tipo_interacao: TipoInteracao
      tema_id?: string | null
      texto: string
    }) => {
      if (!usuarioId) throw new Error('Sessão inválida')

      const payload = {
        usuario_id: usuarioId,
        conteudo_id: conteudoId,
        tipo_interacao: input.tipo_interacao,
        tema_id: input.tipo_interacao === 'reflexao_orientada' ? input.tema_id ?? null : null,
        texto: input.texto.trim(),
      }

      if (input.id) {
        const { error } = await supabase
          .from('interacoes')
          .update({ texto: payload.texto })
          .eq('id', input.id)
          .eq('usuario_id', usuarioId)
        if (error) throw error
        return
      }

      if (input.tipo_interacao === 'reflexao_orientada' && input.tema_id) {
        const { data: existing } = await supabase
          .from('interacoes')
          .select('id')
          .eq('usuario_id', usuarioId)
          .eq('conteudo_id', conteudoId)
          .eq('tipo_interacao', 'reflexao_orientada')
          .eq('tema_id', input.tema_id)
          .maybeSingle()
        if (existing) {
          const { error } = await supabase
            .from('interacoes')
            .update({ texto: payload.texto })
            .eq('id', existing.id)
          if (error) throw error
          return
        }
      }

      if (input.tipo_interacao === 'comentario_livre') {
        const { data: existing } = await supabase
          .from('interacoes')
          .select('id')
          .eq('usuario_id', usuarioId)
          .eq('conteudo_id', conteudoId)
          .eq('tipo_interacao', 'comentario_livre')
          .maybeSingle()
        if (existing) {
          const { error } = await supabase
            .from('interacoes')
            .update({ texto: payload.texto })
            .eq('id', existing.id)
          if (error) throw error
          return
        }
      }

      const { error } = await supabase.from('interacoes').insert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-minhas-interacoes', conteudoId, usuarioId] })
      queryClient.invalidateQueries({ queryKey: ['app-comentarios-publicos', conteudoId] })
    },
  })
}

export function scrollToConteudoTexto() {
  document.getElementById('conteudo-texto')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
