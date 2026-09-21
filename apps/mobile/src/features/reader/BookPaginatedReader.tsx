import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { ChevronDown, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type TextInputScrollEvent,
  type TextInputSelectionChangeEventData,
} from 'react-native'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { Speakable } from '@/features/accessibility/Speakable'
import {
  registerSpeakScreen,
  registerSpeakSelection,
} from '@/features/accessibility/accessibilitySpeechRegistry'
import { useSpeechContext } from '@/features/accessibility/SpeechProvider'
import type { BookPage } from '@/features/reader/bookPagination'
import { getBookPageStorageKey } from '@/features/reader/bookPagination'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface BookPaginatedReaderProps {
  pages: BookPage[]
  conteudoId: string
  titulo: string
  storageKey?: string
}

export function BookPaginatedReader({ pages, conteudoId, titulo, storageKey: storageKeyProp }: BookPaginatedReaderProps) {
  const storageKey = storageKeyProp ?? getBookPageStorageKey(conteudoId)
  const selectionRef = useRef({ start: 0, end: 0 })
  const [pageIndex, setPageIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [scrollMetrics, setScrollMetrics] = useState({
    contentHeight: 0,
    viewportHeight: 0,
    offsetY: 0,
  })
  const { fontMultiplier } = useAccessibility()
  const { speak, stop, isSpeaking } = useSpeechContext()
  const { height: windowHeight } = useWindowDimensions()

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
    setScrollMetrics({ contentHeight: 0, viewportHeight: 0, offsetY: 0 })
  }, [pageIndex])

  const current = pages[pageIndex]

  useEffect(() => {
    if (!current) {
      registerSpeakScreen(null)
      registerSpeakSelection(null)
      return
    }

    registerSpeakScreen(() => `${current.title}. ${current.body}`)
    registerSpeakSelection(() => {
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

  const onScroll = useCallback((event: TextInputScrollEvent) => {
    const offsetY = event.nativeEvent.contentOffset.y
    setScrollMetrics((metrics) => (metrics.offsetY === offsetY ? metrics : { ...metrics, offsetY }))
  }, [])

  const onContentSizeChange = useCallback(
    (event: NativeSyntheticEvent<{ contentSize: { width: number; height: number } }>) => {
      const contentHeight = event.nativeEvent.contentSize.height
      setScrollMetrics((metrics) =>
        metrics.contentHeight === contentHeight ? metrics : { ...metrics, contentHeight },
      )
    },
    [],
  )

  const onTextAreaLayout = useCallback(
    (event: NativeSyntheticEvent<{ layout: { height: number } }>) => {
      const viewportHeight = event.nativeEvent.layout.height
      setScrollMetrics((metrics) =>
        metrics.viewportHeight === viewportHeight ? metrics : { ...metrics, viewportHeight },
      )
    },
    [],
  )

  if (pages.length === 0 || !current) return null

  const atStart = pageIndex === 0
  const atEnd = pageIndex >= pages.length - 1
  const progress = ((pageIndex + 1) / pages.length) * 100
  const readerFontSize = Math.round(16 * fontMultiplier)
  const readerLineHeight = Math.round(24 * fontMultiplier)
  const textAreaMinHeight = Math.round(200 * Math.min(fontMultiplier, 1.35))
  const textAreaMaxHeight = Math.min(
    Math.round(320 * fontMultiplier),
    Math.round(windowHeight * 0.45),
  )

  const viewportHeight = scrollMetrics.viewportHeight || textAreaMaxHeight
  const scrollOverflow = scrollMetrics.contentHeight > viewportHeight + 2
  const maxScrollOffset = Math.max(scrollMetrics.contentHeight - viewportHeight, 1)
  const hasMoreBelow = scrollOverflow && scrollMetrics.offsetY < maxScrollOffset - 8

  const onSelectionChange = (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    selectionRef.current = event.nativeEvent.selection
  }

  const speakPage = () => {
    if (isSpeaking) {
      void stop()
      return
    }
    void speak(`${current.title}. ${current.body}`)
  }

  const speakSelection = () => {
    const { start, end } = selectionRef.current
    if (start === end) {
      void speak('Selecione um trecho primeiro. Toque e arraste sobre o texto.')
      return
    }
    const slice = current.body.slice(Math.min(start, end), Math.max(start, end))
    void speak(slice)
  }

  const pageSpeakLabel = `${current.title}. ${current.body}`

  return (
    <View accessibilityLabel={`Leitura paginada: ${titulo}`}>
      <Speakable
        label={pageSpeakLabel}
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm"
      >
        <View className="border-b border-border/60 bg-primary-light/30 px-4 py-3">
          <Text className="font-sans-semibold text-base text-brand-navy">{current.title}</Text>
        </View>

        <View
          onLayout={onTextAreaLayout}
          style={{
            position: 'relative',
            overflow: 'hidden',
            height: textAreaMaxHeight,
            minHeight: textAreaMinHeight,
          }}
        >
          <TextInput
            key={`reader-page-${pageIndex}`}
            defaultValue={current.body}
            readOnly
            multiline
            scrollEnabled
            onScroll={onScroll}
            onContentSizeChange={onContentSizeChange}
            showSoftInputOnFocus={false}
            caretHidden
            contextMenuHidden={false}
            selectTextOnFocus={false}
            selectionColor="#1c756a"
            onSelectionChange={onSelectionChange}
            style={{
              height: textAreaMaxHeight,
              minHeight: textAreaMinHeight,
              maxHeight: textAreaMaxHeight,
              paddingTop: 16,
              paddingBottom: hasMoreBelow ? 40 : 16,
              paddingLeft: 16,
              paddingRight: 16,
              fontFamily: 'PlusJakartaSans_400Regular',
              fontSize: readerFontSize,
              lineHeight: readerLineHeight,
              color: '#1a3342',
              textAlignVertical: 'top',
            }}
            className="w-full font-sans text-text"
          />

          {hasMoreBelow ? (
            <>
              <LinearGradient
                pointerEvents="none"
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)', '#ffffff']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 44,
                }}
              />
              <View
                pointerEvents="none"
                className="absolute bottom-2 left-0 right-0 flex-row items-center justify-center gap-1"
              >
                <ChevronDown color="#1c756a" size={14} />
                <Text className="font-sans-semibold text-[11px] text-primary">Role para ver mais</Text>
              </View>
            </>
          ) : null}
        </View>

        <View className="flex-row flex-wrap gap-2 border-t border-border/40 px-4 py-3">
          <Pressable
            onPress={speakPage}
            className="flex-row items-center gap-1.5 rounded-full border border-primary/25 bg-primary-light/40 px-3 py-1.5 active:opacity-80"
          >
            <Volume2 color="#1c756a" size={14} />
            <Text className="font-sans-semibold text-xs text-primary">
              {isSpeaking ? 'Parar' : 'Ouvir página'}
            </Text>
          </Pressable>
          <Pressable
            onPress={speakSelection}
            className="flex-row items-center gap-1.5 rounded-full border border-primary/25 bg-white px-3 py-1.5 active:opacity-80"
          >
            <Volume2 color="#1c756a" size={14} />
            <Text className="font-sans-semibold text-xs text-primary">Ouvir seleção</Text>
          </Pressable>
        </View>

        <Text className="border-t border-border/40 px-4 py-2 text-center font-sans text-[11px] text-text-muted">
          Toque e arraste para selecionar um trecho · role dentro da caixa para ler tudo
        </Text>
      </Speakable>

      <View
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10"
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: pages.length, now: pageIndex + 1 }}
      >
        <View className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
      </View>

      <View
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mt-4 flex-row items-center justify-between gap-3"
      >
        <Pressable
          onPress={() => goTo('prev')}
          disabled={atStart}
          accessibilityRole="button"
          accessibilityLabel="Página anterior"
          className={`flex-row items-center gap-1 rounded-full border px-3 py-2 ${atStart ? 'border-border opacity-40' : 'border-primary/25 active:bg-primary-light'}`}
        >
          <ChevronLeft color="#1c756a" size={18} />
          <Text className="font-sans-semibold text-sm text-primary">Anterior</Text>
        </Pressable>

        <View className="min-w-0 flex-1 items-center">
          <Text className="font-sans-semibold text-sm text-brand-navy">
            Página {pageIndex + 1} de {pages.length}
          </Text>
          <Text className="mt-0.5 font-sans text-xs text-text-muted" numberOfLines={1}>
            {current.title}
          </Text>
        </View>

        <Pressable
          onPress={() => goTo('next')}
          disabled={atEnd}
          accessibilityRole="button"
          accessibilityLabel="Próxima página"
          className={`flex-row items-center gap-1 rounded-full border px-3 py-2 ${atEnd ? 'border-border opacity-40' : 'border-primary/25 active:bg-primary-light'}`}
        >
          <Text className="font-sans-semibold text-sm text-primary">Próxima</Text>
          <ChevronRight color="#1c756a" size={18} />
        </Pressable>
      </View>
    </View>
  )
}
