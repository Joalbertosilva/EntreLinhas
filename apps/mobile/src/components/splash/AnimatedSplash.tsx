import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { Image } from 'expo-image'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'

interface AnimatedSplashProps {
  exiting?: boolean
  onExitComplete?: () => void
}

export function AnimatedSplash({ exiting = false, onExitComplete }: AnimatedSplashProps) {
  const insets = useSafeAreaInsets()
  const logoScale = useSharedValue(0.88)
  const logoOpacity = useSharedValue(0)
  const textOpacity = useSharedValue(0)
  const screenOpacity = useSharedValue(1)
  const ringScale = useSharedValue(0.72)

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.15)) })
    ringScale.value = withSequence(
      withTiming(1.06, { duration: 850, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 400 }),
    )
    textOpacity.value = withDelay(380, withTiming(1, { duration: 550 }))
  }, [logoOpacity, logoScale, ringScale, textOpacity])

  useEffect(() => {
    if (!exiting) return
    screenOpacity.value = withTiming(
      0,
      { duration: 420, easing: Easing.in(Easing.cubic) },
      (finished) => {
        if (finished && onExitComplete) runOnJS(onExitComplete)()
      },
    )
    logoScale.value = withTiming(0.96, { duration: 420 })
  }, [exiting, logoScale, onExitComplete, screenOpacity])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }))

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: logoOpacity.value * 0.28,
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 10 }],
  }))

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }))

  return (
    <Animated.View style={[{ flex: 1 }, screenStyle]}>
      <LinearGradient
        colors={['#fafefc', '#e5f7f3', '#d4f0ea', '#ffffff']}
        locations={[0, 0.32, 0.68, 1]}
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="items-center justify-center px-8"
      >
        <Animated.View
          style={ringStyle}
          className="absolute h-48 w-48 rounded-full bg-primary-soft/20"
        />

        <Animated.View style={logoStyle} className="items-center">
          <View className="rounded-3xl bg-white/95 px-6 py-4 shadow-sm">
            <Image
              source={require('../../../assets/images/entrelinhas-logo.png')}
              style={{ width: 220, height: 76 }}
              contentFit="contain"
              accessibilityLabel={BRAND_NAME}
            />
          </View>
        </Animated.View>

        <Animated.View style={textStyle} className="mt-7 items-center">
          <Text className="text-center font-sans-semibold text-base text-brand-navy">{BRAND_TAGLINE}</Text>
          <Text className="mt-2 text-[10px] font-sans-semibold uppercase tracking-[0.2em] text-text-muted">
            {BRAND_INSTITUTION}
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  )
}
