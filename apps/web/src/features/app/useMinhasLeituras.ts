import { useQuery } from '@tanstack/react-query'
import type { StatusLeitura } from '@tcc-sistema/types'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { supabase } from '@/lib/supabase'

const CARD_FIELDS = 'id, titulo, tipo, autor, capa_url'

export interface LeituraComConteudo {
  id: string
  status_leitura: StatusLeitura
  updated_at: string
  conteudo: ConteudoCardData
}

export interface MinhasLeiturasAgrupadas {
  em_andamento: LeituraComConteudo[]
  na_lista: LeituraComConteudo[]
  concluido: LeituraComConteudo[]
}

function mapRows(data: unknown[]): LeituraComConteudo[] {
  return (data ?? []).flatMap((row) => {
    const r = row as {
      id: string
      status_leitura: StatusLeitura
      updated_at: string
      conteudos: ConteudoCardData | ConteudoCardData[] | null
    }
    const conteudo = r.conteudos
    if (!conteudo) return []
    const c = Array.isArray(conteudo) ? conteudo[0] : conteudo
    if (!c) return []
    return [
      {
        id: r.id,
        status_leitura: r.status_leitura,
        updated_at: r.updated_at,
        conteudo: c,
      },
    ]
  })
}

export function useMinhasLeituras(userId: string | undefined) {
  return useQuery({
    queryKey: ['minhas-leituras', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<MinhasLeiturasAgrupadas> => {
      const { data, error } = await supabase
        .from('leituras')
        .select(`id, status_leitura, updated_at, conteudos (${CARD_FIELDS})`)
        .eq('usuario_id', userId!)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const items = mapRows(data ?? [])
      return {
        em_andamento: items.filter((i) => i.status_leitura === 'em_andamento'),
        na_lista: items.filter((i) => i.status_leitura === 'na_lista'),
        concluido: items.filter((i) => i.status_leitura === 'concluido'),
      }
    },
  })
}
