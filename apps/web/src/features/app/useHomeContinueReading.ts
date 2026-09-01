import { useQuery } from '@tanstack/react-query'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { supabase } from '@/lib/supabase'

const CARD_FIELDS = 'id, titulo, tipo, autor, capa_url'

export function useHomeContinueReading(userId: string | undefined) {
  return useQuery({
    queryKey: ['home-continue-reading', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ConteudoCardData[]> => {
      const { data, error } = await supabase
        .from('leituras')
        .select(`updated_at, conteudos (${CARD_FIELDS})`)
        .eq('usuario_id', userId!)
        .eq('status_leitura', 'em_andamento')
        .order('updated_at', { ascending: false })
        .limit(8)

      if (error) throw error

      return (data ?? []).flatMap((row) => {
        const conteudo = row.conteudos
        if (!conteudo) return []
        return Array.isArray(conteudo) ? conteudo : [conteudo]
      }) as ConteudoCardData[]
    },
  })
}
