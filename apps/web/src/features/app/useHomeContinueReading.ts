import { useQuery } from '@tanstack/react-query'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { supabase } from '@/lib/supabase'

const CARD_FIELDS_BASE = 'id, titulo, tipo, autor, capa_url'
const CARD_FIELDS_EXTENDED = `${CARD_FIELDS_BASE}, video_url`

function isMissingOptionalColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ''
  return error.code === '42703' || msg.includes('does not exist') || msg.includes('video_url')
}

type LeituraRow = {
  updated_at: string
  conteudos: ConteudoCardData | ConteudoCardData[] | null
}

function flattenLeituras(data: LeituraRow[]): ConteudoCardData[] {
  return data.flatMap((row) => {
    const conteudo = row.conteudos
    if (!conteudo) return []
    return Array.isArray(conteudo) ? conteudo : [conteudo]
  })
}

async function fetchContinueReading(userId: string): Promise<ConteudoCardData[]> {
  const extended = await supabase
    .from('leituras')
    .select(`updated_at, conteudos (${CARD_FIELDS_EXTENDED})`)
    .eq('usuario_id', userId)
    .eq('status_leitura', 'em_andamento')
    .order('updated_at', { ascending: false })
    .limit(12)

  if (!extended.error) {
    return flattenLeituras((extended.data ?? []) as LeituraRow[])
  }

  if (!isMissingOptionalColumn(extended.error)) throw extended.error

  const base = await supabase
    .from('leituras')
    .select(`updated_at, conteudos (${CARD_FIELDS_BASE})`)
    .eq('usuario_id', userId)
    .eq('status_leitura', 'em_andamento')
    .order('updated_at', { ascending: false })
    .limit(12)

  if (base.error) throw base.error
  return flattenLeituras((base.data ?? []) as LeituraRow[])
}

export function useHomeContinueReading(userId: string | undefined) {
  return useQuery({
    queryKey: ['home-continue-reading', userId],
    enabled: Boolean(userId),
    queryFn: () => fetchContinueReading(userId!),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
