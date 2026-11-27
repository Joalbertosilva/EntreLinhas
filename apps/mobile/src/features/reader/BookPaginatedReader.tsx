import AsyncStorage from '@react-native-async-storage/async-storage'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Maximize2, Minimize2, Volume2 } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type ScrollEvent,
  type TextInputSelectionChangeEvent,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { Speakable } from '@/features/accessibility/Speakable'
import {
  registerSpeakScreen,
  registerSpeakSelection,
} from '@/features/accessibility/accessibilitySpeechRegistry'
import { useSpeechContext } from '@/features/accessibility/SpeechProvider'
import type { BookPage } from '@/features/reader/bookPagination'
import { getBookPageSpeakLabel, getBookPageStorageKey } from '@/features/reader/bookPagination'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { READER_PARAGRAPH_STYLE } from '@/lib/readerTypography'

interface BookPaginatedReaderProps {
  pages: BookPage[]
  conteudoId: string
  titulo: string
  storageKey?: string
  allowImmersive?: boolean
}

/** Fallback quando o TextInput não reporta contentSize (comum no Android). */
function estimateReaderContentHeight(
  text: string,
  lineHeight: number,
  fontSize: number,
  boxWidth: number,
): number {
  const innerWidth = Math.max(boxWidth - 32, 160)
  const charsPerLine = Math.max(10, Math.floor(innerWidth / (fontSize * 0.48)))
  const lines = text.split('\n').reduce((sum, paragraph) => {
    const chunk = paragraph.trim()
    if (!chunk) return sum + 1
    return sum + Math.ceil(chunk.length / charsPerLine)
  }, 0)
  return lines * lineHeight + 32
}

export function BookPaginatedReader({
  pages,
  conteudoId,
  titulo,
  storageKey: storageKeyProp,
  allowImmersive = true,
}: BookPaginatedReaderProps) {
  const storageKey = storageKeyProp ?? getBookPageStorageKey(conteudoId)
  const selectionRef = useRef({ start: 0, end: 0 })
  const [pageIndex, setPageIndex] = useState(0)
  const [immersive, setImmersive] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const insets = useSafeAreaInsets()
  type ReaderScrollMetrics = { contentHeight: number; viewportHeight: number; offsetY: number }
  const emptyScrollMetrics = (): ReaderScrollMetrics => ({
    contentHeight: 0,
    viewportHeight: 0,
    offsetY: 0,
  })
  const [inlineScrollMetrics, setInlineScrollMetrics] = useState(emptyScrollMetrics)
  const [immersiveScrollMetrics, setImmersiveScrollMetrics] = useState(emptyScrollMetrics)
  const { fontMultiplier, audioEnabled } = useAccessibility()
  const { toggleSpeak, stop, isSpeaking } = useSpeechContext()
  const { height: windowHeight, width: windowWidth } = useWindowDimensions()

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const saved = await AsyncStorage.getItem(storageKey)
      if (cancelled) return
      if (saved) {
        const n = Number.parseInt(saved, 10)
        if (!Number.isNaN(n) && n >= 0 && n < pages.length) {
          setPageIndex(n)
        }
      }
      setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [storageKey, pages.length])

  useEffect(() => {
    if (!hydrated) return
    void AsyncStorage.setItem(storageKey, String(pageIndex))
  }, [pageIndex, storageKey, hydrated])

  useEffect(() => {
    selectionRef.current = { start: 0, end: 0 }
    setInlineScrollMetrics(emptyScrollMetrics())
    setImmersiveScrollMetrics(emptyScrollMetrics())
    void stop()
  }, [pageIndex, stop])

  const current = pages[pageIndex]

  const makeScrollHandlers = useCallback((immersiveMode: boolean) => {
    const setMetrics = immersiveMode ? setImmersiveScrollMetrics : setInlineScrollMetrics
    return {
      onScroll: (event: ScrollEvent) => {
        const offsetY = event.nativeEvent.contentOffset.y
        setMetrics((metrics) => (metrics.offsetY === offsetY ? metrics : { ...metrics, offsetY }))
      },
      onContentSizeChange: (event: NativeSyntheticEvent<{ contentSize: { width: number; height: number } }>) => {
        const nextHeight = event.nativeEvent.contentSize.height
        if (nextHeight <= 0) return
        setMetrics((metrics) =>
          metrics.contentHeight === nextHeight ? metrics : { ...metrics, contentHeight: nextHeight },
        )
      },
      onTextAreaLayout: (event: NativeSyntheticEvent<{ layout: { height: number } }>) => {
        const viewportHeight = event.nativeEvent.layout.height
        setMetrics((metrics) =>
          metrics.viewportHeight === viewportHeight ? metrics : { ...metrics, viewportHeight },
        )
      },
    }
  }, [])

  useEffect(() => {
    if (!current) {
      registerSpeakScreen(null)
      registerSpeakSelection(null)
      return
    }

    registerSpeakScreen(() => getBookPageSpeakLabel(current))
    registerSpeakSelection(() => {
      if (current.kind === 'cover') return null
      const { start, end } = selectionRef.current
      if (start !== end) {
        return current.body.slice(Math.min(start, end), Math.max(start, end))
      }
      return null
    })

    return () => {
      registerSpeakScreen(null)
      registerSpeakSelection(null)
    }
  }, [current])

  const goTo = useCallback(
    (direction: 'next' | 'prev') => {
      const next = direction === 'next' ? pageIndex + 1 : pageIndex - 1
      if (next < 0 || next >= pages.length) return
      setPageIndex(next)
    },
    [pageIndex, pages.length],
  )

  if (pages.length === 0 || !current) return null

  const isCoverPage = current.kind === 'cover'
  const pageHeading = isCoverPage ? 'Capa' : current.title
  const atStart = pageIndex === 0
  const atEnd = pageIndex >= pages.length - 1
  const progress = ((pageIndex + 1) / pages.length) * 100
  const readerFontSize = Math.round(16 * fontMultiplier)
  const readerLineHeight = Math.round(24 * fontMultiplier)
  const textAreaMinHeight = Math.round(180 * fontMultiplier)
  const textAreaMaxHeight = Math.min(
    Math.round(300 * fontMultiplier),
    Math.round(windowHeight * 0.52),
  )
  const immersiveFooterReserve = Math.round(200 + 36 * fontMultiplier)
  const immersiveTextMaxHeight = Math.max(
    Math.round(windowHeight - insets.top - insets.bottom - immersiveFooterReserve),
    textAreaMinHeight,
  )

  const readerBoxWidth = windowWidth - SCREEN_HORIZONTAL_PADDING * 2

  const computePageScrollUi = (immersiveMode: boolean, metrics: ReaderScrollMetrics) => {
    const boxMax = immersiveMode ? immersiveTextMaxHeight : textAreaMaxHeight
    const viewportHeight = metrics.viewportHeight > 0 ? metrics.viewportHeight : boxMax
    const estimatedContentHeight = estimateReaderContentHeight(
      current.body,
      readerLineHeight,
      readerFontSize,
      readerBoxWidth,
    )
    const estimatedOverflow = estimatedContentHeight > boxMax + 4
    const measuredOverflow =
      metrics.contentHeight > 0 && metrics.contentHeight > viewportHeight + 4
    const scrollOverflow = measuredOverflow || estimatedOverflow
    const contentHeightForScroll =
      metrics.contentHeight > 0 ? Math.max(metrics.contentHeight, estimatedContentHeight) : estimatedContentHeight
    const maxScrollOffset = Math.max(contentHeightForScroll - viewportHeight, 0)
    const atScrollBottom = metrics.offsetY >= Math.max(maxScrollOffset - 20, 0)
    const hasMoreBelow = scrollOverflow && maxScrollOffset > 8 && !atScrollBottom
    const readerBottomPadding = scrollOverflow ? 44 : 16
    return { scrollOverflow, hasMoreBelow, readerBottomPadding, boxMax }
  }

  const onSelectionChange = (event: TextInputSelectionChangeEvent) => {
    selectionRef.current = event.nativeEvent.selection
  }

  const pageSpeakLabel = getBookPageSpeakLabel(current)

  const ensureAudioReady = () => {
    if (audioEnabled === false) {
      Alert.alert('Áudio desligado', 'Ative o áudio na barra de acessibilidade para ouvir o texto.')
      return false
    }
    return true
  }

  const speakPage = () => {
    if (!ensureAudioReady() && !isSpeaking) return
    void toggleSpeak(pageSpeakLabel)
  }

  const speakSelection = () => {
    if (!ensureAudioReady() && !isSpeaking) return
    const { start, end } = selectionRef.current
    if (start === end) {
      void toggleSpeak('Selecione um trecho primeiro. Toque e arraste sobre o texto.')
      return
    }
    const slice = current.body.slice(Math.min(start, end), Math.max(start, end))
    void toggleSpeak(slice)
  }

  const immersiveScrollUi = computePageScrollUi(true, immersiveScrollMetrics)
  const allowImmersiveEdgeTurn = !immersiveScrollUi.scrollOverflow || isCoverPage

  const renderPageBody = (immersiveMode: boolean) => {
    const metrics = immersiveMode ? immersiveScrollMetrics : inlineScrollMetrics
    const { hasMoreBelow, readerBottomPadding, boxMax } = computePageScrollUi(immersiveMode, metrics)
    const boxMin = textAreaMinHeight
    const scrollHandlers = makeScrollHandlers(immersiveMode)

    return (
      <>
        <View className="border-b border-border/60 bg-primary-light/30 px-4 py-3">
          <Text className="font-sans-semibold text-base text-brand-navy">{pageHeading}</Text>
        </View>

        {isCoverPage ? (
          <View className="items-center justify-center px-6 py-8" style={{ minHeight: boxMin }}>
            {current.coverUrl ? (
              <Image
                source={{ uri: current.coverUrl }}
                accessibilityIgnoresInvertColors
                style={{ width: immersiveMode ? 200 : 168, height: immersiveMode ? 266 : 224, borderRadius: 10 }}
                contentFit="cover"
              />
            ) : (
              <View
                className="items-center justify-center rounded-xl bg-primary-light"
                style={{ width: immersiveMode ? 200 : 168, height: immersiveMode ? 266 : 224 }}
              >
                <BookOpen color="rgba(0,102,204,0.7)" size={36} strokeWidth={1.5} />
              </View>
            )}
            <Text className="mt-5 text-center font-sans-semibold text-base text-brand-navy">{current.title}</Text>
            {current.body.trim() ? (
              <Text className="mt-1 text-center font-sans text-sm text-text-muted">por {current.body.trim()}</Text>
            ) : null}
          </View>
        ) : (
          <View
            onLayout={scrollHandlers.onTextAreaLayout}
            style={{ position: 'relative', overflow: 'hidden', height: boxMax, minHeight: boxMin }}
          >
            <TextInput
              key={`reader-page-${pageIndex}-${immersiveMode ? 'i' : 'n'}`}
              defaultValue={current.body}
              readOnly
              multiline
              scrollEnabled
              onScroll={scrollHandlers.onScroll}
              onContentSizeChange={scrollHandlers.onContentSizeChange}
              showSoftInputOnFocus={false}
              caretHidden
              contextMenuHidden={false}
              selectTextOnFocus={false}
              selectionColor="#1c756a"
              onSelectionChange={onSelectionChange}
              style={{
                height: boxMax,
                minHeight: boxMin,
                maxHeight: boxMax,
                paddingTop: 16,
                paddingBottom: readerBottomPadding,
                paddingLeft: 16,
                paddingRight: 16,
                fontFamily: 'PlusJakartaSans_400Regular',
                fontSize: readerFontSize,
                lineHeight: readerLineHeight,
                color: '#1a3342',
                textAlignVertical: 'top',
                ...READER_PARAGRAPH_STYLE,
              }}
              className="w-full font-sans text-text"
            />

            {hasMoreBelow ? (
              <>
                <LinearGradient
                  pointerEvents="none"
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)', '#ffffff']}
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 48 }}
                />
                <View
                  pointerEvents="none"
                  style={{ position: 'absolute', left: 0, right: 0, bottom: 8 }}
                  className="flex-row items-center justify-center gap-1"
                >
                  <ChevronDown color="#1c756a" size={14} />
                  <Text className="font-sans-semibold text-[11px] text-primary">Role para ler mais</Text>
                </View>
              </>
            ) : null}
          </View>
        )}
      </>
    )
  }

  const renderFooter = (immersiveMode: boolean) => {
    const audioBtnPrimary = immersiveMode
      ? 'flex-row items-center gap-1.5 rounded-full bg-[#1a3342] px-3.5 py-2 active:opacity-90'
      : 'flex-row items-center gap-1.5 rounded-full border border-primary/25 bg-primary-light/40 px-3 py-1.5 active:opacity-80'
    const audioBtnSecondary = immersiveMode
      ? 'flex-row items-center gap-1.5 rounded-full border border-[#1a3342]/30 bg-[#f4e4a8] px-3.5 py-2 active:opacity-90'
      : 'flex-row items-center gap-1.5 rounded-full border border-primary/25 bg-white px-3 py-1.5 active:opacity-80'
    const audioLabelPrimary = immersiveMode ? 'text-xs text-white' : 'text-xs text-primary'
    const audioLabelSecondary = immersiveMode ? 'text-xs text-[#1a3342]' : 'text-xs text-primary'
    const iconPrimary = immersiveMode ? '#ffffff' : '#1c756a'
    const iconSecondary = '#1a3342'

    return (
    <>
      <View className="flex-row flex-wrap gap-2 border-t border-border/40 px-4 py-3">
        <Pressable onPress={speakPage} className={audioBtnPrimary} accessibilityRole="button">
          <Volume2 color={iconPrimary} size={14} />
          <Text className={`font-sans-semibold ${audioLabelPrimary}`}>
            {isSpeaking ? 'Parar áudio' : 'Ouvir página'}
          </Text>
        </Pressable>
        {!isCoverPage ? (
          <Pressable onPress={speakSelection} className={audioBtnSecondary} accessibilityRole="button">
            <Volume2 color={iconSecondary} size={14} />
            <Text className={`font-sans-semibold ${audioLabelSecondary}`}>
              {isSpeaking ? 'Parar áudio' : 'Ouvir seleção'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {!immersiveMode ? (
        <Text className="border-t border-border/40 px-4 py-2 text-center font-sans text-[11px] text-text-muted">
          {isCoverPage
            ? 'Use Próxima para ver os créditos e começar a leitura'
            : 'Toque e arraste para selecionar um trecho · role dentro da caixa para ler tudo'}
        </Text>
      ) : null}
    </>
  )
  }

  const renderPagination = (compact?: boolean, immersiveMode?: boolean) => (
    <View className="mt-4 flex-row items-center justify-between gap-3">
      <Pressable
        onPress={() => goTo('prev')}
        disabled={atStart}
        accessibilityRole="button"
        accessibilityLabel="Página anterior"
        className={`flex-row items-center gap-1 rounded-full border px-3 py-2 ${
          atStart
            ? 'border-border opacity-40'
            : immersiveMode
              ? 'border-[#1a3342]/25 bg-[#f4e4a8] active:opacity-90'
              : 'border-primary/25 active:bg-primary-light'
        }`}
      >
        <ChevronLeft color={immersiveMode ? '#1a3342' : '#1c756a'} size={18} />
        {!compact ? (
          <Text className={`font-sans-semibold text-sm ${immersiveMode ? 'text-[#1a3342]' : 'text-primary'}`}>
            Anterior
          </Text>
        ) : null}
      </Pressable>

      <View className="min-w-0 flex-1 items-center">
        <Text className="font-sans-semibold text-sm text-brand-navy">
          Página {pageIndex + 1} de {pages.length}
        </Text>
        {!compact ? (
          <Text className="mt-0.5 font-sans text-xs text-text-muted" numberOfLines={1}>
            {current.title}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={() => goTo('next')}
        disabled={atEnd}
        accessibilityRole="button"
        accessibilityLabel="Próxima página"
        className={`flex-row items-center gap-1 rounded-full border px-3 py-2 ${
          atEnd
            ? 'border-border opacity-40'
            : immersiveMode
              ? 'border-[#1a3342]/25 bg-[#f4e4a8] active:opacity-90'
              : 'border-primary/25 active:bg-primary-light'
        }`}
      >
        {!compact ? (
          <Text className={`font-sans-semibold text-sm ${immersiveMode ? 'text-[#1a3342]' : 'text-primary'}`}>
            Próxima
          </Text>
        ) : null}
        <ChevronRight color={immersiveMode ? '#1a3342' : '#1c756a'} size={18} />
      </Pressable>
    </View>
  )

  return (
    <View accessibilityLabel={`Leitura paginada: ${titulo}`}>
      {!immersive ? (
        <Speakable
          label={pageSpeakLabel}
          style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
          className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm"
        >
          {renderPageBody(false)}
          {renderFooter(false)}
        </Speakable>
      ) : (
        <View
          style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
          className="overflow-hidden rounded-2xl border border-primary/15 bg-primary-light/20 p-4"
        >
          <Text className="text-center font-sans text-sm text-text-muted">Modo leitura em tela cheia</Text>
        </View>
      )}

      <View
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10"
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: pages.length, now: pageIndex + 1 }}
      >
        <View className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </View>

      <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}>
        {renderPagination(false)}
      </View>

      {allowImmersive ? (
        <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mt-4">
          <Pressable
            onPress={() => setImmersive(true)}
            accessibilityRole="button"
            accessibilityLabel="Modo leitura"
            className="w-full flex-row items-center justify-center gap-2 rounded-full border-2 border-accent bg-brand-navy py-3.5 active:opacity-90"
          >
            <Maximize2 color="#e8c547" size={18} strokeWidth={2} />
            <Text className="font-sans-bold text-base text-white">Modo leitura</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal visible={immersive} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setImmersive(false)}>
        <StatusBar style="dark" />
        <LinearGradient colors={['#e8f7f4', '#fafefc', '#ffffff']} style={{ flex: 1, paddingTop: insets.top }}>
          <View className="flex-row items-center gap-2 border-b border-primary/10 px-4 pb-3 pt-2">
            <View className="min-w-0 flex-1">
              <Text className="font-sans-semibold text-[10px] uppercase tracking-wide text-primary">
                EntreLinhas · leitura
              </Text>
              <Text className="font-sans-bold text-base text-brand-navy" numberOfLines={2}>
                {titulo}
              </Text>
            </View>
            <Pressable
              onPress={() => setImmersive(false)}
              accessibilityLabel="Sair do modo leitura"
              className="h-10 w-10 items-center justify-center rounded-full bg-[#f4e4a8]"
            >
              <Minimize2 color="#1a3342" size={20} />
            </Pressable>
          </View>

          <View className="flex-1 px-4 pb-4" style={{ paddingBottom: insets.bottom + 12 }}>
            <View className="relative min-h-0 flex-1">
              <View className="flex-1 overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm">
                {renderPageBody(true)}
                {renderFooter(true)}
              </View>

              {allowImmersiveEdgeTurn && !atStart ? (
                <Pressable
                  onPress={() => goTo('prev')}
                  accessibilityLabel="Página anterior"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 56,
                    bottom: 56,
                    width: '14%',
                    zIndex: 20,
                    elevation: 24,
                  }}
                />
              ) : null}
              {allowImmersiveEdgeTurn && !atEnd ? (
                <Pressable
                  onPress={() => goTo('next')}
                  accessibilityLabel="Próxima página"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 56,
                    bottom: 56,
                    width: '14%',
                    zIndex: 20,
                    elevation: 24,
                  }}
                />
              ) : null}
            </View>

            <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
              <View className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </View>
            {renderPagination(true, true)}
            <Text className="mt-2 text-center font-sans text-[11px] text-text-muted">
              {allowImmersiveEdgeTurn
                ? 'Toque bem nas beiradas para virar · ou use Anterior/Próxima'
                : 'Role o texto desta página · use Anterior/Próxima para mudar de página'}
            </Text>
          </View>
        </LinearGradient>
      </Modal>
    </View>
  )
}
