import { useQuery } from '@tanstack/react-query'
import type { CategoriaObra, TipoObra } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'

export interface ObraCapitulo {
  id: string
  ordem: number
  titulo: string
  texto: string
}

export interface ObraPublicaDetail {
  id: string
  titulo: string
  descricao: string | null
  capa_url: string | null
  tipo: TipoObra
  categoria: CategoriaObra
  curtidas_count: number
  autorNome: string | null
  updated_at: string
  capitulos: ObraCapitulo[]
}

export function useObraPublica(obraId: string | undefined) {
  return useQuery({
    queryKey: ['obra-publica', obraId],
    enabled: Boolean(obraId),
    queryFn: async (): Promise<ObraPublicaDetail | null> => {
      const { data: obra, error } = await supabase
        .from('obras')
        .select('id, titulo, descricao, capa_url, tipo, categoria, curtidas_count, updated_at, profiles(nome)')
        .eq('id', obraId!)
        .eq('publicado', true)
        .eq('status', true)
        .maybeSingle()

      if (error) throw error
      if (!obra) return null

      const { data: itens, error: itensError } = await supabase
        .from('obra_itens')
        .select('ordem, producoes(id, titulo, texto)')
        .eq('obra_id', obraId!)
        .eq('status', true)
        .order('ordem', { ascending: true })

      if (itensError) throw itensError

      const capitulos = (itens ?? []).flatMap((item) => {
        const p = item.producoes
        const prod = Array.isArray(p) ? p[0] : p
        if (!prod) return []
        return [{
          id: prod.id as string,
          ordem: item.ordem as number,
          titulo: (prod.titulo as string) || `Capítulo ${item.ordem}`,
          texto: (prod.texto as string | null) ?? '',
        }]
      })

      const profile = Array.isArray(obra.profiles) ? obra.profiles[0] : obra.profiles

      return {
        id: obra.id as string,
        titulo: obra.titulo as string,
        descricao: obra.descricao as string | null,
        capa_url: obra.capa_url as string | null,
        tipo: obra.tipo as TipoObra,
        categoria: (obra.categoria as CategoriaObra) ?? 'outro',
        curtidas_count: (obra.curtidas_count as number) ?? 0,
        autorNome: (profile?.nome as string | undefined) ?? null,
        updated_at: obra.updated_at as string,
        capitulos,
      }
    },
  })
}
