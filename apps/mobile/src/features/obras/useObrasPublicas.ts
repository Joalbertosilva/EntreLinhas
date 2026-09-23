import { useQuery } from '@tanstack/react-query'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

export interface ObraPublicaCard {
  id: string
  titulo: string
  descricao: string | null
  capa_url: string | null
  tipo: TipoObra
  categoria: CategoriaObra
  autorNome: string | null
  updated_at: string
}

export function useObrasPublicas(limit = 8) {
  return useQuery({
    queryKey: ['obras-publicas', limit],
    queryFn: async (): Promise<ObraPublicaCard[]> => {
      const { data, error } = await supabase
        .from('obras')
        .select('id, titulo, descricao, capa_url, tipo, categoria, updated_at, profiles(nome, nome_usuario)')
        .eq('publicado', true)
        .eq('status', true)
        .order('publicado_em', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data ?? []).map((row) => {
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
        return {
          id: row.id as string,
          titulo: row.titulo as string,
          descricao: row.descricao as string | null,
          capa_url: row.capa_url as string | null,
          tipo: row.tipo as TipoObra,
          categoria: (row.categoria as CategoriaObra) ?? 'outro',
          autorNome: (profile?.nome as string | undefined) ?? null,
          updated_at: row.updated_at as string,
        }
      })
    },
    staleTime: 60_000,
  })
}
