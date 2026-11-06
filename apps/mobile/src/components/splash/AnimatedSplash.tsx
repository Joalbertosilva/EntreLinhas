import { useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SplashAmbientBackground } from '@/components/splash/SplashAmbientBackground'
import { SplashBookHero } from '@/components/splash/SplashBookHero'
import { SplashBrandLockup } from '@/components/splash/SplashBrandLockup'
import { SplashLoadingCaption } from '@/components/splash/SplashLoadingCaption'
import { hideNativeSplashOnce } from '@/lib/nativeSplash'

interface AnimatedSplashProps {
  exiting?: boolean
  onExitComplete?: () => void
}

export function AnimatedSplash({ exiting = false, onExitComplete }: AnimatedSplashProps) {
  const insets = useSafeAreaInsets()
  const handoffScheduled = useRef(false)
  const screenOpacity = useSharedValue(1)
  const brandOpacity = useSharedValue(1)
  const captionOpacity = useSharedValue(1)

  const scheduleNativeHandoff = useCallback(() => {
    if (handoffScheduled.current) return
    handoffScheduled.current = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hideNativeSplashOnce()
      })
    })
  }, [])

  /** Fallback: evita splash nativa / overlay preso em builds antigos. */
  useEffect(() => {
    const t = setTimeout(() => hideNativeSplashOnce(), 8000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!exiting) return

    // Marca + texto somem primeiro e rápido; livro e fundo seguem um instante.
    brandOpacity.value = withTiming(0, { duration: 140, easing: Easing.in(Easing.quad) })
    captionOpacity.value = withTiming(0, { duration: 120, easing: Easing.in(Easing.quad) })

    screenOpacity.value = withDelay(
      220,
      withTiming(0, { duration: 340, easing: Easing.in(Easing.cubic) }, (finished) => {
        if (finished && onExitComplete) runOnJS(onExitComplete)()
      }),
    )
  }, [brandOpacity, captionOpacity, exiting, onExitComplete, screenOpacity])

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }))

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: (1 - brandOpacity.value) * -12 }],
  }))

  const captionStyle = useAnimatedStyle(() => ({
    opacity: captionOpacity.value,
  }))

  return (
    <Animated.View style={[{ flex: 1 }, screenStyle]} onLayout={scheduleNativeHandoff}>
      <SplashAmbientBackground />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 28,
        }}
      >
        <Animated.View style={[{ flex: 1, justifyContent: 'center' }, brandStyle]}>
          <SplashBrandLockup />
        </Animated.View>

        <View style={{ alignItems: 'center', paddingBottom: 8 }}>
          <SplashBookHero size={104} exiting={exiting} launchHandoff />
          <Animated.View style={[captionStyle, { marginTop: 8, width: '100%' }]}>
            <SplashLoadingCaption visible={!exiting} />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  )
}
