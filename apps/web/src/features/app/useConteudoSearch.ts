import { useQuery } from '@tanstack/react-query'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { supabase } from '@/lib/supabase'

const CARD_FIELDS = 'id, titulo, tipo, autor, capa_url'

async function searchConteudos(query: string): Promise<ConteudoCardData[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const safe = q.replace(/[%_,]/g, ' ').trim()
  if (safe.length < 2) return []

  const { data, error } = await supabase
    .from('conteudos')
    .select(CARD_FIELDS)
    .eq('status', true)
    .or(`titulo.ilike.%${safe}%,autor.ilike.%${safe}%`)
    .order('titulo', { ascending: true })
    .limit(12)

  if (error) throw error
  return data as ConteudoCardData[]
}

export function useConteudoSearch(query: string, enabled = true) {
  const trimmed = query.trim()

  return useQuery({
    queryKey: ['app-conteudos-search', trimmed],
    queryFn: () => searchConteudos(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
  })
}
