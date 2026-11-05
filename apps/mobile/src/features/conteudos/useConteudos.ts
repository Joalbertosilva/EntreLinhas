import { useQuery } from '@tanstack/react-query'
import type { CatalogAnchor, Conteudo, MaterialComplementar, Tema, TipoConteudo } from '@tcc-sistema/types'
import type { HomeSectionConfig } from '@/features/conteudos/homeSections'
import { supabase } from '@/lib/supabase'

export type ConteudoCardData = Pick<
  Conteudo,
  'id' | 'titulo' | 'tipo' | 'autor' | 'capa_url' | 'video_url' | 'catalog_anchor' | 'video_categoria'
>

const CARD_FIELDS_BASE = 'id, titulo, tipo, autor, capa_url'
const CARD_FIELDS_EXTENDED = `${CARD_FIELDS_BASE}, video_url, catalog_anchor, video_categoria`

export const DESTAQUES_TIPOS = ['livro', 'cronica', 'musica', 'poema'] as const satisfies readonly TipoConteudo[]

type ConteudoQueryOptions = {
  tipo?: TipoConteudo
  tipos?: readonly TipoConteudo[]
  excludeTipos?: readonly TipoConteudo[]
  limit?: number
}

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

async function runConteudoQuery(fields: string, options: ConteudoQueryOptions): Promise<ConteudoCardData[]> {
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

export async function fetchVideosByCatalogAnchor(anchor: CatalogAnchor): Promise<ConteudoCardData[]> {
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

export function useConteudosByTipo(tipo: TipoConteudo) {
  return useQuery({
    queryKey: ['app-conteudos', { tipo }],
    queryFn: () => fetchActiveConteudos({ tipo }),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useVideosByCatalogAnchor(anchor: CatalogAnchor | undefined) {
  return useQuery({
    queryKey: ['app-videos-anchor', anchor],
    queryFn: () => fetchVideosByCatalogAnchor(anchor!),
    enabled: Boolean(anchor),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useAllConteudos(limit = 40) {
  return useQuery({
    queryKey: ['app-conteudos', 'all', limit],
    queryFn: () => fetchActiveConteudos({ limit }),
    staleTime: 60_000,
  })
}

export function useConteudoDetail(conteudoId: string | undefined) {
  return useQuery({
    queryKey: ['app-conteudo', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudos')
        .select(
          'id, titulo, tipo, autor, capa_url, video_url, conteudo_textual, resumo, descricao, personagens, contexto, pontos_importantes, curiosidades, curtidas_count, status',
        )
        .eq('id', conteudoId!)
        .eq('status', true)
        .single()

      if (error) throw error
      return data
    },
    enabled: Boolean(conteudoId),
  })
}

export function useConteudoTemas(conteudoId: string | undefined) {
  return useQuery({
    queryKey: ['app-temas', conteudoId],
    enabled: Boolean(conteudoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temas')
        .select('*')
        .eq('conteudo_id', conteudoId!)
        .eq('status', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as Tema[]
    },
  })
}

export function useConteudoMateriais(conteudoId: string | undefined) {
  return useQuery({
    queryKey: ['app-materiais', conteudoId],
    enabled: Boolean(conteudoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais_complementares')
        .select('*')
        .eq('conteudo_id', conteudoId!)
        .eq('status', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as MaterialComplementar[]
    },
  })
}
