import { useEffect } from 'react'
import { Text, View, useWindowDimensions, type ViewStyle } from 'react-native'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated'
import { BRAND } from '@/lib/brandTheme'

type BookPhase = 'loading' | 'opening'

interface BookPageLoaderProps {
  size?: number
  label?: string
  style?: ViewStyle
  /** Cor da capa do livrinho */
  coverColor?: string
  phase?: BookPhase
  onOpeningComplete?: () => void
}

export function BookPageLoader({
  size = 52,
  label,
  style,
  coverColor = BRAND.navy,
  phase = 'loading',
  onOpeningComplete,
}: BookPageLoaderProps) {
  const { width: screenW, height: screenH } = useWindowDimensions()
  const pageTurn = useSharedValue(0)
  const bob = useSharedValue(0)
  const breathe = useSharedValue(1)
  const expand = useSharedValue(0.72)
  const introOpacity = useSharedValue(0)
  const bookFade = useSharedValue(1)
  const glow = useSharedValue(0.35)

  const bookW = size
  const bookH = size * 1.28
  const pageW = bookW * 0.88
  const fillScale = (Math.max(screenW, screenH) / size) * 0.55

  useEffect(() => {
    if (phase === 'opening') {
      cancelAnimation(pageTurn)
      cancelAnimation(bob)
      cancelAnimation(breathe)

      bob.value = withTiming(0, { duration: 120 })
      breathe.value = withTiming(1, { duration: 120 })

      pageTurn.value = withSequence(
        withTiming(0.35, { duration: 180, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.cubic) }),
      )

      expand.value = withSequence(
        withTiming(1.08, { duration: 260, easing: Easing.out(Easing.back(1.8)) }),
        withTiming(fillScale, { duration: 620, easing: Easing.in(Easing.cubic) }),
      )

      glow.value = withSequence(
        withTiming(0.85, { duration: 280 }),
        withTiming(0, { duration: 520 }),
      )

      bookFade.value = withDelay(
        420,
        withTiming(0, { duration: 420, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished && onOpeningComplete) runOnJS(onOpeningComplete)()
        }),
      )
      return
    }

    introOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    expand.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.4)) })

    pageTurn.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 480, easing: Easing.inOut(Easing.cubic) }),
        withDelay(140, withTiming(0, { duration: 440, easing: Easing.inOut(Easing.cubic) })),
        withDelay(260, withTiming(0, { duration: 0 })),
      ),
      -1,
      false,
    )

    bob.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 820, easing: Easing.inOut(Easing.sin) }),
        withTiming(2, { duration: 820, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )

    breathe.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )

    glow.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [bob, bookFade, breathe, expand, fillScale, glow, introOpacity, onOpeningComplete, pageTurn, phase])

  const bookStyle = useAnimatedStyle(() => ({
    opacity: introOpacity.value * bookFade.value,
    transform: [
      { translateY: bob.value },
      { scale: expand.value * breathe.value },
    ],
  }))

  const pageStyle = useAnimatedStyle(() => {
    const rotate = `${-pageTurn.value * 88}deg`
    return {
      transform: [{ perspective: 800 }, { rotateY: rotate }],
      opacity: 0.9 + pageTurn.value * 0.1,
    }
  })

  const shadowPageStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + pageTurn.value * 0.4,
    transform: [{ scaleX: 0.82 + pageTurn.value * 0.18 }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * introOpacity.value * bookFade.value,
    transform: [{ scale: expand.value * 1.35 }],
  }))

  return (
    <View style={[{ alignItems: 'center', width: '100%' }, style]}>
      <Animated.View
        style={[
          glowStyle,
          {
            position: 'absolute',
            width: size * 2.2,
            height: size * 2.2,
            borderRadius: size * 1.1,
            backgroundColor: coverColor,
          },
        ]}
      />

      <Animated.View style={[{ alignItems: 'center' }, bookStyle]}>
        <View
          style={{
            width: bookW,
            height: bookH,
            borderRadius: size * 0.1,
            backgroundColor: coverColor,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.25)',
            shadowColor: coverColor,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.28,
            shadowRadius: 14,
            elevation: 6,
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: bookW * 0.08,
              top: bookH * 0.1,
              width: pageW,
              height: bookH * 0.8,
              borderRadius: 3,
              backgroundColor: '#f8fafc',
            }}
          />
          {[0.22, 0.38, 0.54, 0.7].map((t) => (
            <View
              key={t}
              style={{
                position: 'absolute',
                left: bookW * 0.14,
                top: bookH * t,
                width: pageW * 0.72,
                height: 2,
                borderRadius: 1,
                backgroundColor: 'rgba(26,51,66,0.12)',
              }}
            />
          ))}

          <Animated.View
            style={[
              {
                position: 'absolute',
                left: bookW * 0.08,
                top: bookH * 0.1,
                width: pageW * 0.52,
                height: bookH * 0.8,
                borderRadius: 3,
                backgroundColor: '#ffffff',
                transformOrigin: 'left center',
              },
              pageStyle,
            ]}
          />

          <Animated.View
            style={[
              {
                position: 'absolute',
                left: bookW * 0.42,
                top: bookH * 0.12,
                width: pageW * 0.35,
                height: bookH * 0.76,
                borderRadius: 2,
                backgroundColor: '#000',
              },
              shadowPageStyle,
            ]}
          />

          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              backgroundColor: 'rgba(0,0,0,0.15)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: bookW * 0.06,
              top: bookH * 0.14,
              width: 2,
              height: bookH * 0.72,
              borderRadius: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}
          />
        </View>
      </Animated.View>

      {label ? (
        <Text
          style={{
            marginTop: 14,
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 14,
            color: BRAND.navy,
            textAlign: 'center',
            width: '100%',
            paddingHorizontal: 8,
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  )
}
