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
}

interface CatalogVideoCarouselProps {
  videos: ConteudoCardData[]
  featuredLabel: string
  carouselWidth: number
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

function CatalogVideoCarousel({ videos, featuredLabel, carouselWidth }: CatalogVideoCarouselProps) {
  const listRef = useRef<FlatList<ConteudoCardData>>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const autoPausedRef = useRef(false)
  const resumeAutoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mediaHeight = Math.round((carouselWidth * 9) / 16)
  const activeVideo = videos[activeIndex]

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
    if (videos.length <= 1) return

    const timer = setInterval(() => {
      if (autoPausedRef.current) return
      setActiveIndex((current) => {
        const next = (current + 1) % videos.length
        listRef.current?.scrollToOffset({ offset: next * carouselWidth, animated: true })
        return next
      })
    }, AUTO_ADVANCE_MS)

    return () => clearInterval(timer)
  }, [carouselWidth, videos.length])

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

  const showControls = videos.length > 1
  const activeCategory = activeVideo?.video_categoria ?? featuredLabel

  return (
    <View
      className="overflow-hidden rounded-3xl border border-primary/10 bg-white"
      style={{ width: carouselWidth, ...CARD_SHADOW }}
    >
      <View className="overflow-hidden rounded-t-3xl">
        <FlatList
          ref={listRef}
          data={videos}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          bounces={false}
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

      {showControls ? (
        <LinearGradient
          colors={['#f4fbf9', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ paddingTop: CONTROLS_TOP_GAP }}
          className="px-4 pb-3.5"
        >
          <View
            className="flex-row items-center justify-between"
            style={{ columnGap: 12, minHeight: NAV_BUTTON_SIZE }}
          >
            <CarouselNavButton direction="prev" onPress={goPrev} label="Vídeo anterior" />
            <View
              className="min-w-0 flex-1 flex-row flex-wrap items-center justify-center gap-1.5"
              accessibilityRole="tablist"
              accessibilityLabel="Indicador do carrossel de vídeos"
            >
              {videos.map((video, index) => {
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
                    className={`rounded-full ${active ? 'h-2 bg-primary' : 'h-2 bg-primary/22'}`}
                    style={{ width: active ? 22 : 8 }}
                  />
                )
              })}
            </View>
            <CarouselNavButton direction="next" onPress={goNext} label="Próximo vídeo" />
          </View>
          <Text
            className="mt-2.5 text-center font-sans-medium text-[11px] tracking-wide text-text-muted"
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            {activeIndex + 1} de {videos.length}
          </Text>
        </LinearGradient>
      ) : null}

      {activeVideo ? (
        <View className="border-t border-primary/6 px-4 pb-4 pt-3">
          <Text className="font-sans-semibold text-[10px] uppercase tracking-[0.14em] text-primary">
            {activeCategory}
          </Text>
          <Text className="mt-1 font-sans-bold text-[17px] leading-snug text-brand-navy" numberOfLines={2}>
            {activeVideo.titulo}
          </Text>
          {activeVideo.autor ? (
            <Text className="mt-1 font-sans text-sm text-text-muted" numberOfLines={1}>
              {activeVideo.autor}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

/** Carrossel único de vídeos vinculados ao catálogo (paridade com a web). */
export function CatalogVideoStrip({ section }: CatalogVideoStripProps) {
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()
  const anchor = section.catalogAnchor
  const { data: videos = [], isLoading } = useVideosByCatalogAnchor(anchor)

  const playable = useMemo(
    () => videos.filter((video) => hasExternalVideoUrl(video.video_url)),
    [videos],
  )

  if (!anchor || isLoading || playable.length === 0) return null

  const copy = ANCHOR_COPY[anchor]
  const carouselWidth = screenWidth - SCREEN_HORIZONTAL_PADDING * 2
  const speakLabel = [
    copy.eyebrow,
    copy.title,
    playable.map((v) => v.titulo).join(', '),
  ].join('. ')

  return (
    <View style={{ marginBottom: SECTION_GAP, marginTop: -4 }}>
      <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-3.5">
        <Speakable label={speakLabel}>
          <Text className="font-sans-semibold text-[11px] uppercase tracking-wider text-text-muted">
            {copy.eyebrow}
          </Text>
          <View className="mt-0.5 flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
            <Text className="font-sans-bold text-lg text-brand-navy">{copy.title}</Text>
            <Pressable
              onPress={() => router.push('/(aluno)/(tabs)/explorar?tipo=video')}
              className="flex-row items-center gap-0.5 active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Ver todos os vídeos"
            >
              <Text className="font-sans-semibold text-sm text-text-muted">Ver todos</Text>
              <ChevronRight color="#5a7282" size={16} />
            </Pressable>
          </View>
        </Speakable>
      </View>

      <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}>
        <CatalogVideoCarousel
          videos={playable}
          featuredLabel={copy.featuredLabel}
          carouselWidth={carouselWidth}
        />
      </View>
    </View>
  )
}
