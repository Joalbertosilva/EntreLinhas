import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItem,
} from 'react-native'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react-native'
import type { CatalogAnchor } from '@tcc-sistema/types'
import { Speakable } from '@/features/accessibility/Speakable'
import type { HomeSectionConfig } from '@/features/conteudos/homeSections'
import type { ConteudoCardData } from '@/features/conteudos/useConteudos'
import { useVideosByCatalogAnchor } from '@/features/conteudos/useConteudos'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { hasExternalVideoUrl, openVideoExternal } from '@/lib/openVideoUrl'
import { SCREEN_HORIZONTAL_PADDING, SECTION_GAP } from '@/lib/layout'

const AUTO_ADVANCE_MS = 5000
/** Botões anterior/próximo — sempre quadrado (mesma largura e altura). */
const NAV_BUTTON_SIZE = 44
/** Respiro entre a área do vídeo e a faixa de navegação. */
const CONTROLS_TOP_GAP = 18
const DOT_SIZE = 8
/** Faixa de dots em uma linha só — não aumenta o card se houver muitos vídeos. */
const DOTS_ROW_HEIGHT = 24
/** Altura fixa do bloco de título (categoria + título 2 linhas + autor). */
const VIDEO_TITLE_BLOCK_HEIGHT = 88
/** Contador “1 de N” abaixo dos dots. */
const VIDEO_COUNTER_HEIGHT = 20
/** Cabeçalho “Assistir agora” acima do card (altura reservada na home). */
export const CATALOG_VIDEO_SECTION_HEADER_HEIGHT = 52

function catalogVideoCardLayout(carouselWidth: number) {
  const mediaHeight = Math.round((carouselWidth * 9) / 16)
  const controlsHeight =
    CONTROLS_TOP_GAP + NAV_BUTTON_SIZE + DOTS_ROW_HEIGHT + VIDEO_COUNTER_HEIGHT + 14
  const cardHeight = mediaHeight + controlsHeight + VIDEO_TITLE_BLOCK_HEIGHT
  return { mediaHeight, controlsHeight, titleHeight: VIDEO_TITLE_BLOCK_HEIGHT, cardHeight }
}

const CARD_SHADOW = {
  shadowColor: '#1a3342',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 22,
  elevation: 6,
} as const

const ANCHOR_COPY: Record<
  CatalogAnchor,
  { eyebrow: string; title: string; featuredLabel: string }
> = {
  livros: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre leitura',
    featuredLabel: 'Leitura',
  },
  cronicas: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre crônicas',
    featuredLabel: 'Crônica',
  },
  musicas: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre música',
    featuredLabel: 'Música',
  },
  poemas: {
    eyebrow: 'Assistir agora',
    title: 'Vídeos sobre poesia',
    featuredLabel: 'Poema',
  },
}

interface CatalogVideoStripProps {
  section: HomeSectionConfig
  /** Último bloco da home — menos margem inferior antes da tab bar. */
  isLastOnHome?: boolean
  /** Auto-play do carrossel — desliga quando a aba Home perde o foco (evita tremer o scroll). */
  motionEnabled?: boolean
}

interface CatalogVideoCarouselProps {
  videos: ConteudoCardData[]
  featuredLabel: string
  carouselWidth: number
  autoAdvanceEnabled: boolean
}

function CarouselNavButton({
  direction,
  onPress,
  label,
}: {
  direction: 'prev' | 'next'
  onPress: () => void
  label: string
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="items-center justify-center rounded-full border border-primary/12 bg-white active:opacity-85"
      style={{
        width: NAV_BUTTON_SIZE,
        height: NAV_BUTTON_SIZE,
        minWidth: NAV_BUTTON_SIZE,
        minHeight: NAV_BUTTON_SIZE,
        flexShrink: 0,
        shadowColor: '#1a3342',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <Icon color="#1a3342" size={22} strokeWidth={2.25} />
    </Pressable>
  )
}

function CatalogVideoCarousel({
  videos,
  featuredLabel,
  carouselWidth,
  autoAdvanceEnabled,
}: CatalogVideoCarouselProps) {
  const listRef = useRef<FlatList<ConteudoCardData>>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const autoPausedRef = useRef(false)
  const resumeAutoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mediaHeight, controlsHeight, titleHeight, cardHeight } = catalogVideoCardLayout(carouselWidth)
  const activeVideo = videos[activeIndex]
  const multi = videos.length > 1

  const pauseAutoBriefly = useCallback(() => {
    autoPausedRef.current = true
    if (resumeAutoTimeoutRef.current) clearTimeout(resumeAutoTimeoutRef.current)
    resumeAutoTimeoutRef.current = setTimeout(() => {
      autoPausedRef.current = false
    }, AUTO_ADVANCE_MS * 2)
  }, [])

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      if (videos.length === 0) return
      const clamped = (index + videos.length) % videos.length
      listRef.current?.scrollToOffset({ offset: clamped * carouselWidth, animated })
      setActiveIndex(clamped)
    },
    [carouselWidth, videos.length],
  )

  const goNext = useCallback(() => {
    pauseAutoBriefly()
    scrollToIndex(activeIndex + 1)
  }, [activeIndex, pauseAutoBriefly, scrollToIndex])

  const goPrev = useCallback(() => {
    pauseAutoBriefly()
    scrollToIndex(activeIndex - 1)
  }, [activeIndex, pauseAutoBriefly, scrollToIndex])

  useEffect(() => {
    setActiveIndex(0)
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
  }, [videos.length, videos[0]?.id])

  useEffect(() => {
    if (!autoAdvanceEnabled || videos.length <= 1) return

    const timer = setInterval(() => {
      if (autoPausedRef.current) return
      setActiveIndex((current) => {
        const next = (current + 1) % videos.length
        listRef.current?.scrollToOffset({ offset: next * carouselWidth, animated: true })
        return next
      })
    }, AUTO_ADVANCE_MS)

    return () => clearInterval(timer)
  }, [autoAdvanceEnabled, carouselWidth, videos.length])

  useEffect(
    () => () => {
      if (resumeAutoTimeoutRef.current) clearTimeout(resumeAutoTimeoutRef.current)
    },
    [],
  )

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = event.nativeEvent.contentOffset.x
      const index = Math.round(offset / carouselWidth)
      const clamped = Math.min(Math.max(index, 0), videos.length - 1)
      setActiveIndex(clamped)
    },
    [carouselWidth, videos.length],
  )

  const renderItem: ListRenderItem<ConteudoCardData> = useCallback(
    ({ item }) => {
      const coverUrl = resolveConteudoCoverUrl(item)

      return (
        <Pressable
          onPress={() => void openVideoExternal(item.video_url)}
          accessibilityRole="button"
          accessibilityLabel={`Assistir ${item.titulo}`}
          style={{ width: carouselWidth, height: mediaHeight }}
          className="active:opacity-95"
        >
          <View className="relative h-full w-full overflow-hidden bg-brand-navy/10">
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                style={{ width: carouselWidth, height: mediaHeight }}
                contentFit="cover"
              />
            ) : (
              <LinearGradient
                colors={['#243d4d', '#1a3342', '#1c3d38']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: carouselWidth, height: mediaHeight }}
              />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(26, 51, 66, 0.55)']}
              locations={[0.45, 1]}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: mediaHeight * 0.45,
              }}
              pointerEvents="none"
            />
            <View className="absolute inset-0 items-center justify-center">
              <View
                className="h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/95"
                style={{
                  shadowColor: '#1a3342',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Play color="#1c756a" size={26} fill="#1c756a" />
              </View>
            </View>
          </View>
        </Pressable>
      )
    },
    [carouselWidth, mediaHeight],
  )

  const activeCategory = activeVideo?.video_categoria ?? featuredLabel

  return (
    <View
      className="overflow-hidden rounded-3xl border border-primary/10 bg-white"
      style={{ width: carouselWidth, height: cardHeight, ...CARD_SHADOW }}
      collapsable={false}
    >
      <View className="overflow-hidden rounded-t-3xl" style={{ height: mediaHeight }}>
        <FlatList
          ref={listRef}
          data={videos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          bounces={false}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={carouselWidth}
          snapToAlignment="start"
          disableIntervalMomentum
          onScrollBeginDrag={pauseAutoBriefly}
          onMomentumScrollEnd={onScrollEnd}
          getItemLayout={(_, index) => ({
            length: carouselWidth,
            offset: carouselWidth * index,
            index,
          })}
          style={{ width: carouselWidth, height: mediaHeight }}
          renderItem={renderItem}
        />
      </View>

      <LinearGradient
        colors={['#f4fbf9', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ height: controlsHeight, paddingTop: CONTROLS_TOP_GAP }}
        className="px-4"
      >
        <View
          className="flex-row items-center justify-between"
          style={{ columnGap: 12, height: NAV_BUTTON_SIZE }}
        >
          {multi ? (
            <CarouselNavButton direction="prev" onPress={goPrev} label="Vídeo anterior" />
          ) : (
            <View style={{ width: NAV_BUTTON_SIZE, height: NAV_BUTTON_SIZE }} />
          )}
          <View
            className="min-w-0 flex-1 flex-row items-center justify-center gap-1.5 overflow-hidden"
            style={{ height: DOTS_ROW_HEIGHT }}
            accessibilityRole="tablist"
            accessibilityLabel="Indicador do carrossel de vídeos"
          >
            {multi
              ? videos.map((video, index) => {
                  const active = index === activeIndex
                  return (
                    <Pressable
                      key={video.id}
                      onPress={() => {
                        pauseAutoBriefly()
                        scrollToIndex(index)
                      }}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`Vídeo ${index + 1} de ${videos.length}`}
                      className={`rounded-full ${active ? 'bg-primary' : 'bg-primary/22'}`}
                      style={{ width: DOT_SIZE, height: DOT_SIZE, opacity: active ? 1 : 0.55 }}
                    />
                  )
                })
              : null}
          </View>
          {multi ? (
            <CarouselNavButton direction="next" onPress={goNext} label="Próximo vídeo" />
          ) : (
            <View style={{ width: NAV_BUTTON_SIZE, height: NAV_BUTTON_SIZE }} />
          )}
        </View>
        <View style={{ height: VIDEO_COUNTER_HEIGHT }} className="items-center justify-center">
          <Text
            className="font-sans-medium text-[11px] tracking-wide text-text-muted"
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {activeIndex + 1} de {videos.length}
          </Text>
        </View>
      </LinearGradient>

      <View
        className="overflow-hidden border-t border-primary/6 px-4 pb-3 pt-3"
        style={{ height: titleHeight }}
      >
        <Text
          className="font-sans-semibold text-[10px] uppercase tracking-[0.14em] text-primary"
          numberOfLines={1}
        >
          {activeCategory}
        </Text>
        <Text
          className="mt-1 font-sans-bold text-[17px] leading-snug text-brand-navy"
          numberOfLines={2}
          style={{ minHeight: 44 }}
        >
          {activeVideo?.titulo ?? ' '}
        </Text>
        <Text className="mt-0.5 font-sans text-sm text-text-muted" numberOfLines={1} style={{ minHeight: 20 }}>
          {activeVideo?.autor?.trim() ? activeVideo.autor : ' '}
        </Text>
      </View>
    </View>
  )
}

/** Carrossel único de vídeos vinculados ao catálogo (paridade com a web). */
export function CatalogVideoStrip({
  section,
  isLastOnHome = false,
  motionEnabled = true,
}: CatalogVideoStripProps) {
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()
  const anchor = section.catalogAnchor
  const { data: videos = [], isLoading, isFetched } = useVideosByCatalogAnchor(anchor)

  const playable = useMemo(
    () => videos.filter((video) => hasExternalVideoUrl(video.video_url)),
    [videos],
  )

  if (!anchor) return null

  const copy = ANCHOR_COPY[anchor]
  const carouselWidth = screenWidth - SCREEN_HORIZONTAL_PADDING * 2
  const { cardHeight } = catalogVideoCardLayout(carouselWidth)
  const bottomMargin = isLastOnHome ? 0 : SECTION_GAP
  const sectionSlotHeight = CATALOG_VIDEO_SECTION_HEADER_HEIGHT + 14 + cardHeight

  if (isLoading && !isFetched) {
    return (
      <View
        style={{
          marginBottom: bottomMargin,
          marginTop: -4,
          height: sectionSlotHeight,
          maxHeight: sectionSlotHeight,
          overflow: 'hidden',
        }}
        collapsable={false}
      >
        <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, height: CATALOG_VIDEO_SECTION_HEADER_HEIGHT }}>
          <View className="h-10 rounded-lg bg-primary/10" />
        </View>
        <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: 14 }}>
          <View
            className="overflow-hidden rounded-3xl border border-primary/10 bg-primary/5"
            style={{ width: carouselWidth, height: cardHeight }}
          />
        </View>
      </View>
    )
  }

  if (playable.length === 0) return null
  const speakLabel = [
    copy.eyebrow,
    copy.title,
    playable.map((v) => v.titulo).join(', '),
  ].join('. ')

  return (
    <View
      style={{
        marginBottom: bottomMargin,
        marginTop: -4,
        height: sectionSlotHeight,
        maxHeight: sectionSlotHeight,
        overflow: 'hidden',
      }}
      collapsable={false}
    >
      <View
        style={{
          paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
          height: CATALOG_VIDEO_SECTION_HEADER_HEIGHT,
          justifyContent: 'flex-end',
        }}
      >
        <Speakable label={speakLabel}>
          <Text className="font-sans-semibold text-[11px] uppercase tracking-wider text-text-muted" numberOfLines={1}>
            {copy.eyebrow}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-x-2.5">
            <Text className="min-w-0 flex-1 font-sans-bold text-lg text-brand-navy" numberOfLines={1}>
              {copy.title}
            </Text>
            <Pressable
              onPress={() => router.push('/(aluno)/(tabs)/explorar?tipo=video')}
              className="shrink-0 flex-row items-center gap-0.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Ver todos os vídeos"
            >
              <Text className="font-sans-semibold text-sm text-text-muted">Ver todos</Text>
              <ChevronRight color="#5a7282" size={16} />
            </Pressable>
          </View>
        </Speakable>
      </View>

      <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: 14 }}>
        <CatalogVideoCarousel
          videos={playable}
          featuredLabel={copy.featuredLabel}
          carouselWidth={carouselWidth}
          autoAdvanceEnabled={motionEnabled}
        />
      </View>
    </View>
  )
}
