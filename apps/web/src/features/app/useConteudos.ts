import { useQuery } from '@tanstack/react-query'
import type { Conteudo, TipoConteudo } from '@tcc-sistema/types'
import type { HomeSectionConfig } from '@/features/app/homeSections'
import { supabase } from '@/lib/supabase'

export type ConteudoCardData = Pick<Conteudo, 'id' | 'titulo' | 'tipo' | 'autor' | 'capa_url'>

const CARD_FIELDS = 'id, titulo, tipo, autor, capa_url'

function isMissingCurtidasColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ''
  return (
    error.code === '42703' ||
    msg.includes('curtidas_count') ||
    msg.includes('does not exist')
  )
}

async function fetchDestaques(limit: number): Promise<ConteudoCardData[]> {
  const withCurtidas = await supabase
    .from('conteudos')
    .select(`${CARD_FIELDS}, curtidas_count`)
    .eq('status', true)
    .order('curtidas_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!withCurtidas.error) {
    return withCurtidas.data as ConteudoCardData[]
  }

  if (!isMissingCurtidasColumn(withCurtidas.error)) {
    throw withCurtidas.error
  }

  const fallback = await supabase
    .from('conteudos')
    .select(CARD_FIELDS)
    .eq('status', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (fallback.error) throw fallback.error
  return fallback.data as ConteudoCardData[]
}

async function fetchActiveConteudos(options: {
  tipo?: TipoConteudo
  limit?: number
}): Promise<ConteudoCardData[]> {
  let query = supabase
    .from('conteudos')
    .select(CARD_FIELDS)
    .eq('status', true)
    .order('created_at', { ascending: false })

  if (options.tipo) {
    query = query.eq('tipo', options.tipo)
  }

  if (options.limit != null) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data as ConteudoCardData[]
}

export function useConteudosByTipo(tipo: TipoConteudo) {
  return useQuery({
    queryKey: ['app-conteudos', { tipo }],
    queryFn: () => fetchActiveConteudos({ tipo }),
  })
}

export function useSectionConteudos(
  section: Pick<HomeSectionConfig, 'id' | 'tipo' | 'placeholderCount'>,
  options?: { enabled?: boolean },
) {
  const isDestaques = section.id === 'destaques'

  return useQuery({
    queryKey: isDestaques
      ? ['app-conteudos', 'destaques', section.placeholderCount]
      : ['app-conteudos', { tipo: section.tipo }],
    queryFn: () =>
      isDestaques
        ? fetchDestaques(section.placeholderCount)
        : fetchActiveConteudos({ tipo: section.tipo }),
    enabled: options?.enabled ?? true,
  })
}

/** Quantidade de placeholders para manter a vitrine preenchida visualmente. */
export function countPlaceholders(realCount: number, targetCount: number): number {
  return Math.max(0, targetCount - realCount)
}
