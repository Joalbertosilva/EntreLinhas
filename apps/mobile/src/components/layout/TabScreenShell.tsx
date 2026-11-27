import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { ScrollViewProps } from 'react-native'
import { ScrollView, View } from 'react-native'
import { useFocusEffect, useSegments } from 'expo-router'
import { AppTopBar } from '@/components/layout/AppTopBar'
import { PlatformBackground } from '@/components/layout/PlatformBackground'
import { useTabScreenInsets } from '@/lib/useTabScreenInsets'
import type { NativeScrollViewRef } from '@/lib/nativeRefs'

const STACK_ROUTE_NAMES = new Set(['obra', 'conteudo', 'minha-obra', 'progresso', 'perfil', 'alterar-senha'])

export function TabScreenShell({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1">
      <AppTopBar />
      <PlatformBackground>{children}</PlatformBackground>
    </View>
  )
}

interface TabScrollViewProps extends ScrollViewProps {
  /** Ao voltar do stack (obra, conteúdo…), zera o scroll uma vez — evita “vão” com offset antigo. */
  restoreScrollAfterStack?: boolean
}

export function TabScrollView({
  children,
  contentContainerStyle,
  restoreScrollAfterStack = false,
  ...rest
}: TabScrollViewProps) {
  const { scrollPaddingBottom } = useTabScreenInsets()
  const scrollRef = useRef<NativeScrollViewRef>(null)
  const pendingStackRestoreRef = useRef(false)
  const segments = useSegments()

  const containerStyle = useMemo(
    () => [{ paddingTop: 16, paddingBottom: scrollPaddingBottom }, contentContainerStyle],
    [scrollPaddingBottom, contentContainerStyle],
  )

  useEffect(() => {
    if (!restoreScrollAfterStack) return
    const onStack = (segments as string[]).some((segment) => STACK_ROUTE_NAMES.has(segment))
    if (onStack) pendingStackRestoreRef.current = true
  }, [restoreScrollAfterStack, segments])

  useFocusEffect(
    useCallback(() => {
      if (!restoreScrollAfterStack || !pendingStackRestoreRef.current) return
      pendingStackRestoreRef.current = false
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false })
      })
    }, [restoreScrollAfterStack]),
  )

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      removeClippedSubviews={false}
      contentContainerStyle={containerStyle}
      {...rest}
    >
      {children}
    </ScrollView>
  )
}