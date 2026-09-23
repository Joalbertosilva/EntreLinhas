import { useEffect } from 'react'
import { Text, View, type ViewStyle } from 'react-native'
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

interface BookPageLoaderProps {
  size?: number
  label?: string
  style?: ViewStyle
  /** Cor da capa do livrinho */
  coverColor?: string
}

export function BookPageLoader({
  size = 52,
  label,
  style,
  coverColor = BRAND.navy,
}: BookPageLoaderProps) {
  const pageTurn = useSharedValue(0)
  const bob = useSharedValue(0)

  const bookW = size
  const bookH = size * 1.28
  const pageW = bookW * 0.88

  useEffect(() => {
    pageTurn.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.cubic) }),
        withDelay(180, withTiming(0, { duration: 480, easing: Easing.inOut(Easing.cubic) })),
        withDelay(220, withTiming(0, { duration: 0 })),
      ),
      -1,
      false,
    )
    bob.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [bob, pageTurn])

  const bookStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }))

  const pageStyle = useAnimatedStyle(() => {
    const rotate = `${-pageTurn.value * 78}deg`
    return {
      transform: [{ perspective: 600 }, { rotateY: rotate }],
      opacity: 0.92 + pageTurn.value * 0.08,
    }
  })

  const shadowPageStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + pageTurn.value * 0.35,
    transform: [{ scaleX: 0.85 + pageTurn.value * 0.12 }],
  }))

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <Animated.View style={[{ alignItems: 'center' }, bookStyle]}>
        <View
          style={{
            width: bookW,
            height: bookH,
            borderRadius: size * 0.1,
            backgroundColor: coverColor,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.2)',
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
          {[0.22, 0.38, 0.54].map((t) => (
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
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  )
}
