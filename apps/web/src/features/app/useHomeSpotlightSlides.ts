import { useQuery } from '@tanstack/react-query'
import type { CatalogAnchor, TipoConteudo } from '@tcc-sistema/types'
import {
  buildSpotlightSlides,
  SPOTLIGHT_CATALOG_TIPOS,
  SPOTLIGHT_READING_TIPOS,
  type SpotlightConteudoData,
  type SpotlightSlide,
} from '@/features/app/homeSpotlightSlides'
import { supabase } from '@/lib/supabase'

const PROMO_VIDEO_ANCHORS: CatalogAnchor[] = ['livros', 'cronicas', 'musicas', 'poemas']

function isMissingOptionalColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const msg = error.message?.toLowerCase() ?? ''
  return (
    error.code === '42703' ||
    msg.includes('does not exist') ||
    msg.includes('video_url') ||
    msg.includes('catalog_anchor')
  )
}

async function fetchLatestByTipo(
  tipo: TipoConteudo,
  limit: number,
): Promise<SpotlightConteudoData[]> {
  const extended = await supabase
    .from('conteudos')
    .select('id, titulo, tipo, autor, capa_url, descricao, resumo, video_url, created_at')
    .eq('status', true)
    .eq('tipo', tipo)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!extended.error) {
    return (extended.data ?? []) as unknown as SpotlightConteudoData[]
  }

  if (tipo === 'video') return []

  if (!isMissingOptionalColumn(extended.error)) throw extended.error

  const base = await supabase
    .from('conteudos')
    .select('id, titulo, tipo, autor, capa_url, descricao, resumo, created_at')
    .eq('status', true)
    .eq('tipo', tipo)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (base.error) throw base.error
  return (base.data ?? []) as unknown as SpotlightConteudoData[]
}

async function fetchNewestCatalogContent(): Promise<SpotlightConteudoData | null> {
  const extended = await supabase
    .from('conteudos')
    .select('id, titulo, tipo, autor, capa_url, descricao, resumo, video_url, created_at')
    .eq('status', true)
    .in('tipo', SPOTLIGHT_READING_TIPOS)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!extended.error && extended.data) {
    return extended.data as unknown as SpotlightConteudoData
  }

  if (!isMissingOptionalColumn(extended.error)) throw extended.error

  const base = await supabase
    .from('conteudos')
    .select('id, titulo, tipo, autor, capa_url, descricao, resumo, created_at')
    .eq('status', true)
    .in('tipo', SPOTLIGHT_READING_TIPOS)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (base.error) throw base.error
  return (base.data as unknown as SpotlightConteudoData | null) ?? null
}

async function fetchPromoVideos(): Promise<
  Array<{ video: SpotlightConteudoData; anchor: CatalogAnchor }>
> {
  const extended = await supabase
    .from('conteudos')
    .select('id, titulo, tipo, autor, capa_url, descricao, resumo, video_url, catalog_anchor')
    .eq('status', true)
    .eq('tipo', 'video')
    .in('catalog_anchor', PROMO_VIDEO_ANCHORS)
    .order('created_at', { ascending: false })

  if (!extended.error) {
    const rows = (extended.data ?? []) as Array<
      SpotlightConteudoData & { catalog_anchor?: CatalogAnchor | null }
    >
    return rows
      .filter((row) => row.catalog_anchor && PROMO_VIDEO_ANCHORS.includes(row.catalog_anchor))
      .map((row) => ({
        video: row,
        anchor: row.catalog_anchor as CatalogAnchor,
      }))
  }

  if (!isMissingOptionalColumn(extended.error)) throw extended.error
  return []
}

async function loadSpotlightSlides(): Promise<SpotlightSlide[]> {
  const [catalogBatches, newestContent, promoVideos] = await Promise.all([
    Promise.all(SPOTLIGHT_CATALOG_TIPOS.map((tipo) => fetchLatestByTipo(tipo, 2))),
    fetchNewestCatalogContent(),
    fetchPromoVideos(),
  ])

  const byTipo = Object.fromEntries(
    SPOTLIGHT_CATALOG_TIPOS.map((tipo, index) => [tipo, catalogBatches[index] ?? []]),
  ) as Partial<Record<TipoConteudo, SpotlightConteudoData[]>>

  return buildSpotlightSlides({ byTipo, newestContent, promoVideos })
}

export function useHomeSpotlightSlides(_userId: string | undefined) {
  return useQuery({
    queryKey: ['home-spotlight-slides'],
    queryFn: () => loadSpotlightSlides(),
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
