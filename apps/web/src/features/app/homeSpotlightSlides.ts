import type { CatalogAnchor, TipoConteudo } from '@tcc-sistema/types'
import { CATALOG_ANCHOR_LABEL } from '@/lib/catalogAnchorLabels'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'

export type SpotlightConteudoData = {
  id: string
  titulo: string
  tipo: TipoConteudo
  autor: string | null
  capa_url: string | null
  video_url?: string | null
  descricao?: string | null
  resumo?: string | null
  created_at?: string | null
}

type SpotlightContentSlide = {
  id: string
  kind: 'content'
  caption: string
  badge: string
  conteudo: SpotlightConteudoData
  isContinueReading?: boolean
}

type SpotlightPromoNewSlide = {
  id: string
  kind: 'promo-new'
  caption: string
  badge: string
  headline: string
  deck: string
  conteudo: SpotlightConteudoData
}

type SpotlightPromoVideoSlide = {
  id: string
  kind: 'promo-video'
  caption: string
  badge: string
  headline: string
  deck: string
  video: SpotlightConteudoData
  anchor: CatalogAnchor
}

type SpotlightPromoObraSlide = {
  id: string
  kind: 'promo-obra'
  caption: string
  badge: string
  headline: string
  deck: string
}

export type SpotlightSlide =
  | SpotlightContentSlide
  | SpotlightPromoNewSlide
  | SpotlightPromoVideoSlide
  | SpotlightPromoObraSlide

export const SPOTLIGHT_READING_TIPOS: TipoConteudo[] = ['livro', 'cronica', 'musica', 'poema']

/** Tipos no carrossel principal — inclui vídeo; destaques editoriais usam só leitura. */
export const SPOTLIGHT_CATALOG_TIPOS: TipoConteudo[] = [...SPOTLIGHT_READING_TIPOS, 'video']

const VIDEO_TIP_HEADLINES = [
  (topic: string) => `Você conhece a importância de ${topic}?`,
  (topic: string) => `Quer entender melhor ${topic}?`,
  (topic: string) => `Um olhar diferente sobre ${topic}`,
]

const VIDEO_TIP_TOPICS: Record<CatalogAnchor, string> = {
  livros: 'a leitura',
  cronicas: 'textos curtos e crônicas',
  musicas: 'a música na formação leitora',
  poemas: 'a poesia no dia a dia',
}

const VIDEO_TIP_DECKS: Record<CatalogAnchor, string> = {
  livros:
    'Preparamos um vídeo para complementar os livros. Role até a faixa abaixo de Livros e assista no seu ritmo.',
  cronicas:
    'Há um vídeo relacionado às crônicas logo abaixo desta seção. Vale a pausa para ver com calma.',
  musicas:
    'Letras, contexto e reflexão em vídeo — confira a faixa abaixo de Músicas quando quiser.',
  poemas:
    'Versos ganham outra dimensão em vídeo. Desça até a faixa abaixo de Poemas e veja.',
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

function insertAtRandomPositions<T>(base: T[], inserts: T[]): T[] {
  const result = [...base]
  for (const item of inserts) {
    const position = Math.floor(Math.random() * (result.length + 1))
    result.splice(position, 0, item)
  }
  return result
}

function buildPromoNewSlide(conteudo: SpotlightConteudoData): SpotlightPromoNewSlide {
  const tipoLabel = TIPO_CONTEUDO_LABEL[conteudo.tipo].toLowerCase()
  return {
    id: `promo-new-${conteudo.id}`,
    kind: 'promo-new',
    caption: conteudo.titulo,
    badge: 'Novidade',
    headline: 'Temos conteúdo novo no catálogo',
    deck: `"${conteudo.titulo}" acabou de entrar como ${tipoLabel}. Dá uma olhada antes que todo mundo descubra.`,
    conteudo,
  }
}

function buildPromoVideoSlide(
  video: SpotlightConteudoData,
  anchor: CatalogAnchor,
): SpotlightPromoVideoSlide {
  const topic = VIDEO_TIP_TOPICS[anchor]
  const headlineFn = pickRandom(VIDEO_TIP_HEADLINES)!
  const anchorLabel = CATALOG_ANCHOR_LABEL[anchor].toLowerCase()

  return {
    id: `promo-video-${video.id}-${anchor}`,
    kind: 'promo-video',
    caption: video.titulo,
    badge: 'Dica em vídeo',
    headline: headlineFn(topic),
    deck: `${VIDEO_TIP_DECKS[anchor]} Estamos falando de "${video.titulo}", ${anchorLabel}.`,
    video,
    anchor,
  }
}

function buildPromoObraSlide(): SpotlightPromoObraSlide {
  return {
    id: 'promo-obra',
    kind: 'promo-obra',
    caption: 'Minha obra',
    badge: 'Escreva e publique',
    headline: 'Sua história merece ser lida',
    deck: 'Crie capítulos, revise no seu ritmo e publique para a comunidade EntreLinhas conhecer sua voz.',
  }
}

export function buildSpotlightSlides(options: {
  byTipo: Partial<Record<TipoConteudo, SpotlightConteudoData[]>>
  newestContent?: SpotlightConteudoData | null
  promoVideos?: Array<{ video: SpotlightConteudoData; anchor: CatalogAnchor }>
  includeObraPromo?: boolean
  maxSlides?: number
}): SpotlightSlide[] {
  const contentSlides: SpotlightContentSlide[] = []
  const seen = new Set<string>()
  const maxSlides = options.maxSlides ?? 12

  for (const tipo of SPOTLIGHT_CATALOG_TIPOS) {
    for (const conteudo of options.byTipo[tipo] ?? []) {
      if (seen.has(conteudo.id)) continue
      seen.add(conteudo.id)
      contentSlides.push({
        id: `${tipo}-${conteudo.id}`,
        kind: 'content',
        caption: conteudo.titulo,
        badge: TIPO_CONTEUDO_LABEL[tipo],
        conteudo,
      })
      if (contentSlides.length >= maxSlides) break
    }
    if (contentSlides.length >= maxSlides) break
  }

  const promos: SpotlightSlide[] = []

  if (
    options.newestContent &&
    !seen.has(options.newestContent.id) &&
    Math.random() > 0.35
  ) {
    promos.push(buildPromoNewSlide(options.newestContent))
  }

  const videoPromo = pickRandom(options.promoVideos ?? [])
  if (videoPromo && Math.random() > 0.35) {
    promos.push(buildPromoVideoSlide(videoPromo.video, videoPromo.anchor))
  }

  const merged = insertAtRandomPositions(contentSlides, promos)
  const withObra =
    options.includeObraPromo !== false
      ? insertAtRandomPositions(merged, [buildPromoObraSlide()])
      : merged

  return withObra.slice(0, maxSlides + promos.length + 1)
}

export function spotlightDeckText(slide: SpotlightSlide): string {
  if (slide.kind === 'promo-new') return slide.deck
  if (slide.kind === 'promo-video') return slide.deck
  if (slide.kind === 'promo-obra') return slide.deck

  const { conteudo, isContinueReading } = slide
  const fromDb = conteudo.descricao?.trim() || conteudo.resumo?.trim()
  if (fromDb) return fromDb

  if (isContinueReading) {
    return 'Retome de onde parou e continue registrando sua jornada de leitura.'
  }

  if (conteudo.tipo === 'video') {
    return 'Assista, reflita e registre o que este conteúdo despertou em você.'
  }

  return 'Conteúdo do catálogo selecionado para você explorar agora.'
}
