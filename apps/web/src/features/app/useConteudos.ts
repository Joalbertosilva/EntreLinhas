import { useQuery } from '@tanstack/react-query'
import type { CatalogAnchor, Conteudo, TipoConteudo } from '@tcc-sistema/types'
import type { HomeSectionConfig } from '@/features/app/homeSections'
import { supabase } from '@/lib/supabase'

export type ConteudoCardData = Pick<
  Conteudo,
  | 'id'
  | 'titulo'
  | 'tipo'
  | 'autor'
  | 'capa_url'
  | 'video_url'
  | 'catalog_anchor'
  | 'video_categoria'
>

const CARD_FIELDS_BASE = 'id, titulo, tipo, autor, capa_url'
const CARD_FIELDS_EXTENDED = `${CARD_FIELDS_BASE}, video_url, catalog_anchor, video_categoria`

function isMissingOptionalColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ''
  return (
    error.code === '42703' ||
    msg.includes('does not exist') ||
    msg.includes('video_url') ||
    msg.includes('catalog_anchor') ||
    msg.includes('video_categoria') ||
    msg.includes('curtidas_count')
  )
}

/** Tipos exibidos em “Destaques para ler” — vídeos ficam só no carrossel e nas faixas por âncora. */
export const DESTAQUES_TIPOS = ['livro', 'cronica', 'musica', 'poema'] as const satisfies readonly TipoConteudo[]

type ConteudoQueryOptions = {
  tipo?: TipoConteudo
  tipos?: readonly TipoConteudo[]
  excludeTipos?: readonly TipoConteudo[]
  limit?: number
}

async function runConteudoQuery(
  fields: string,
  options: ConteudoQueryOptions,
): Promise<ConteudoCardData[]> {
  let query = supabase.from('conteudos').select(fields).eq('status', true)

  if (options.tipo) {
    query = query.eq('tipo', options.tipo)
  }

  if (options.tipos?.length) {
    query = query.in('tipo', [...options.tipos])
  }

  for (const excluded of options.excludeTipos ?? []) {
    query = query.neq('tipo', excluded)
  }

  query = query.order('created_at', { ascending: false })

  if (options.limit != null) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as ConteudoCardData[]
}

async function selectConteudos(options: ConteudoQueryOptions): Promise<ConteudoCardData[]> {
  try {
    return await runConteudoQuery(CARD_FIELDS_EXTENDED, options)
  } catch (extendedError) {
    if (!isMissingOptionalColumn(extendedError as { message?: string; code?: string })) {
      throw extendedError
    }
  }

  return runConteudoQuery(CARD_FIELDS_BASE, options)
}

async function fetchDestaques(limit: number): Promise<ConteudoCardData[]> {
  const withCurtidas = await supabase
    .from('conteudos')
    .select(`${CARD_FIELDS_EXTENDED}, curtidas_count`)
    .eq('status', true)
    .in('tipo', [...DESTAQUES_TIPOS])
    .order('curtidas_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!withCurtidas.error) {
    return (withCurtidas.data ?? []).filter((item) => item.tipo !== 'video') as ConteudoCardData[]
  }

  if (!isMissingOptionalColumn(withCurtidas.error)) {
    throw withCurtidas.error
  }

  return selectConteudos({ tipos: DESTAQUES_TIPOS, limit })
}

async function fetchActiveConteudos(options: ConteudoQueryOptions): Promise<ConteudoCardData[]> {
  return selectConteudos(options)
}

export async function fetchVideosByCatalogAnchor(
  anchor: CatalogAnchor,
): Promise<ConteudoCardData[]> {
  try {
    const extended = await supabase
      .from('conteudos')
      .select(CARD_FIELDS_EXTENDED)
      .eq('status', true)
      .eq('tipo', 'video')
      .eq('catalog_anchor', anchor)
      .order('created_at', { ascending: false })

    if (!extended.error) {
      return (extended.data ?? []) as ConteudoCardData[]
    }

    if (!isMissingOptionalColumn(extended.error)) {
      throw extended.error
    }
  } catch {
    return []
  }

  return []
}

export function useConteudosByTipo(tipo: TipoConteudo) {
  return useQuery({
    queryKey: ['app-conteudos', { tipo }],
    queryFn: () => fetchActiveConteudos({ tipo }),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useVideosByCatalogAnchor(anchor: CatalogAnchor) {
  return useQuery({
    queryKey: ['app-videos-anchor', anchor],
    queryFn: () => fetchVideosByCatalogAnchor(anchor),
    staleTime: 0,
    refetchOnMount: 'always',
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
        : fetchActiveConteudos({ tipo: section.tipo, limit: section.placeholderCount }),
    enabled: options?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

/** Placeholders discretos — evita fileiras longas de “Em breve” quando o catálogo ainda é pequeno. */
export function countPlaceholders(realCount: number, targetCount: number): number {
  if (realCount === 0) return Math.min(4, targetCount)
  if (realCount >= 4) return Math.min(1, Math.max(0, targetCount - realCount))
  return Math.min(2, Math.max(0, targetCount - realCount))
}
