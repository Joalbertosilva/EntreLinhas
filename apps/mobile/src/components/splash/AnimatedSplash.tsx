import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'

interface AnimatedSplashProps {
  onFinish: () => void
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const logoScale = useSharedValue(0.82)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)
  const ringScale = useSharedValue(0.6)

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })
    logoScale.value = withTiming(1, { duration: 850, easing: Easing.out(Easing.back(1.2)) })
    ringScale.value = withSequence(
      withTiming(1.08, { duration: 900, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 350 }),
    )
    textOpacity.value = withDelay(420, withTiming(1, { duration: 500 }))

    const timer = setTimeout(onFinish, 2400)
    return () => clearTimeout(timer)
  }, [logoOpacity, logoScale, onFinish, ringScale, textOpacity])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: logoOpacity.value * 0.35,
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 12 }],
  }))

  return (
    <LinearGradient
      colors={['#fafefc', '#e5f7f3', '#c8ebe4', '#f6fcfa']}
      locations={[0, 0.38, 0.62, 1]}
      className="flex-1 items-center justify-center px-8"
    >
      <Animated.View
        style={ringStyle}
        className="absolute h-56 w-56 rounded-full bg-primary-soft/25"
      />

      <Animated.View style={logoStyle} className="items-center">
        <View className="rounded-3xl bg-white/90 p-5 shadow-sm">
          <Image
            source={require('../../../assets/images/entrelinhas-logo.png')}
            style={{ width: 260, height: 90 }}
            contentFit="contain"
            accessibilityLabel={BRAND_NAME}
          />
        </View>
      </Animated.View>

      <Animated.View style={textStyle} className="mt-8 items-center">
        <Text className="text-center font-sans-semibold text-lg text-brand-navy">{BRAND_TAGLINE}</Text>
        <Text className="mt-2 text-xs font-sans-semibold uppercase tracking-[0.18em] text-text-muted">
          {BRAND_INSTITUTION}
        </Text>
      </Animated.View>
    </LinearGradient>
  )
}
