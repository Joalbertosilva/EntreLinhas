import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { View, useWindowDimensions, type ViewStyle } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { BRAND } from '@/lib/brandTheme'

interface SplashBookHeroProps {
  size?: number
  exiting?: boolean
  style?: ViewStyle
}

/** Livro fechado com folha virando — mais limpo que o spread aberto em RN. */
export function SplashBookHero({ size = 96, exiting = false, style }: SplashBookHeroProps) {
  const { width: screenW, height: screenH } = useWindowDimensions()
  const fillScale = (Math.max(screenW, screenH) / size) * 0.55

  const intro = useSharedValue(0)
  const scale = useSharedValue(0.78)
  const opacity = useSharedValue(0)
  const bob = useSharedValue(0)
  const breathe = useSharedValue(1)
  const pageTurn = useSharedValue(0)
  const glow = useSharedValue(0.28)

  const bookW = size
  const bookH = size * 1.26
  const pageW = bookW * 0.86
  const pageH = bookH * 0.8
  const pageLeft = bookW * 0.07
  const pageTop = bookH * 0.1
  const flipW = pageW * 0.54

  useEffect(() => {
    intro.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) })
    scale.value = withTiming(1, { duration: 720, easing: Easing.out(Easing.back(1.2)) })
    opacity.value = withDelay(80, withTiming(1, { duration: 420 }))

    bob.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(2, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )

    breathe.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 950, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 950, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )

    glow.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )

    pageTurn.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }),
        withDelay(180, withTiming(0, { duration: 460, easing: Easing.inOut(Easing.cubic) })),
        withDelay(320, withTiming(0, { duration: 0 })),
      ),
      -1,
      false,
    )
  }, [bob, breathe, glow, intro, opacity, pageTurn, scale])

  useEffect(() => {
    if (!exiting) return
    bob.value = withTiming(0, { duration: 120 })
    breathe.value = withTiming(1, { duration: 120 })
    pageTurn.value = withSequence(
      withTiming(0.4, { duration: 160, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 380, easing: Easing.inOut(Easing.cubic) }),
    )
    scale.value = withSequence(
      withTiming(1.06, { duration: 240, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(fillScale, { duration: 640, easing: Easing.in(Easing.cubic) }),
    )
    glow.value = withSequence(withTiming(0.7, { duration: 260 }), withTiming(0, { duration: 480 }))
    opacity.value = withDelay(360, withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) }))
  }, [bob, breathe, exiting, fillScale, glow, opacity, pageTurn, scale])

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: intro.value * opacity.value,
    transform: [{ translateY: bob.value }, { scale: scale.value * breathe.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * intro.value * opacity.value,
    transform: [{ scale: scale.value * 1.4 }],
  }))

  const pageStyle = useAnimatedStyle(() => {
    const pivot = flipW / 2
    return {
      transform: [
        { perspective: 900 },
        { translateX: -pivot },
        { rotateY: `${-pageTurn.value * 86}deg` },
        { translateX: pivot },
      ],
      opacity: 0.92 + pageTurn.value * 0.08,
    }
  })

  const pageShadowStyle = useAnimatedStyle(() => ({
    opacity: 0.1 + pageTurn.value * 0.35,
    transform: [{ scaleX: 0.78 + pageTurn.value * 0.22 }],
  }))

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: bookH + 16,
          alignItems: 'center',
          justifyContent: 'center',
        },
        wrapStyle,
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          glowStyle,
          {
            position: 'absolute',
            width: size * 2.4,
            height: size * 2.4,
            borderRadius: size * 1.2,
            backgroundColor: BRAND.primary,
          },
        ]}
      />

      <View
        style={{
          width: bookW,
          height: bookH,
          borderRadius: size * 0.11,
          overflow: 'hidden',
          shadowColor: BRAND.navy,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.22,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={['#152a38', BRAND.navy, '#2a4a5c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: bookW * 0.07 }}
        >
          {/* Página de fundo */}
          <View
            style={{
              flex: 1,
              borderRadius: 4,
              backgroundColor: '#f7f4ee',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
            }}
          >
            {[0.22, 0.38, 0.54, 0.7].map((t) => (
              <View
                key={t}
                style={{
                  position: 'absolute',
                  left: pageW * 0.12,
                  top: pageH * t,
                  width: pageW * 0.7,
                  height: 1.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(26,51,66,0.1)',
                }}
              />
            ))}
          </View>
        </LinearGradient>

        {/* Faixa dourada da capa */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: bookH * 0.38,
            height: 3,
            backgroundColor: BRAND.gold,
            opacity: 0.85,
          }}
        />

        {/* Folha virando */}
        {!exiting ? (
          <>
            <Animated.View
              pointerEvents="none"
              style={[
                pageShadowStyle,
                {
                  position: 'absolute',
                  left: pageLeft + flipW * 0.55,
                  top: pageTop + 2,
                  width: flipW * 0.42,
                  height: pageH - 4,
                  borderRadius: 2,
                  backgroundColor: BRAND.navy,
                },
              ]}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                pageStyle,
                {
                  position: 'absolute',
                  left: pageLeft,
                  top: pageTop,
                  width: flipW,
                  height: pageH,
                  borderRadius: 4,
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: 'rgba(26,51,66,0.06)',
                  overflow: 'hidden',
                },
              ]}
            >
              {[0.22, 0.38, 0.54, 0.7].map((t) => (
                <View
                  key={t}
                  style={{
                    position: 'absolute',
                    left: flipW * 0.14,
                    top: pageH * t,
                    width: flipW * 0.68,
                    height: 1.5,
                    borderRadius: 1,
                    backgroundColor: 'rgba(26,51,66,0.08)',
                  }}
                />
              ))}
            </Animated.View>
          </>
        ) : null}

        {/* Lombada */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: bookW * 0.05,
            top: bookH * 0.12,
            width: 2,
            height: bookH * 0.76,
            borderRadius: 1,
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />
      </View>
    </Animated.View>
  )
}
