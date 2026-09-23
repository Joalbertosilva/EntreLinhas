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
import { BookPageLoader } from '@/components/ui/BookPageLoader'
import { BRAND, SPLASH_GRADIENT, SPLASH_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
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
  const loaderOpacity = useSharedValue(0)
  const screenOpacity = useSharedValue(1)
  const ringScale = useSharedValue(0.72)

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) })
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.15)) })
    ringScale.value = withSequence(
      withTiming(1.08, { duration: 850, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 400 }),
    )
    textOpacity.value = withDelay(380, withTiming(1, { duration: 550 }))
    loaderOpacity.value = withDelay(650, withTiming(1, { duration: 500 }))
  }, [loaderOpacity, logoOpacity, logoScale, ringScale, textOpacity])

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
    opacity: logoOpacity.value * 0.22,
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 10 }],
  }))

  const loaderStyle = useAnimatedStyle(() => ({
    opacity: loaderOpacity.value,
    transform: [{ translateY: (1 - loaderOpacity.value) * 8 }],
  }))

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }))

  return (
    <Animated.View style={[{ flex: 1 }, screenStyle]}>
      <LinearGradient
        colors={[...SPLASH_GRADIENT]}
        locations={[...SPLASH_GRADIENT_LOCATIONS]}
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="items-center justify-center px-8"
      >
        <Animated.View
          style={[
            ringStyle,
            {
              position: 'absolute',
              height: 200,
              width: 200,
              borderRadius: 999,
              backgroundColor: BRAND.navy,
            },
          ]}
        />
        <Animated.View
          style={[
            ringStyle,
            {
              position: 'absolute',
              height: 160,
              width: 160,
              borderRadius: 999,
              backgroundColor: BRAND.primary,
              opacity: 0.08,
            },
          ]}
        />

        <Animated.View style={logoStyle} className="items-center">
          <LinearGradient
            colors={['#ffffff', '#f4f8fc', '#eef7f4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderWidth: 1,
              borderColor: BRAND.borderSoft,
            }}
          >
            <Image
              source={require('../../../assets/images/entrelinhas-logo.png')}
              style={{ width: 220, height: 76 }}
              contentFit="contain"
              accessibilityLabel={BRAND_NAME}
            />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={textStyle} className="mt-7 items-center">
          <Text
            style={{
              textAlign: 'center',
              fontFamily: 'PlusJakartaSans_600SemiBold',
              fontSize: 16,
              color: BRAND.navy,
            }}
          >
            {BRAND_TAGLINE}
          </Text>
          <Text
            style={{
              marginTop: 8,
              fontSize: 10,
              fontFamily: 'PlusJakartaSans_600SemiBold',
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: BRAND.textMuted,
            }}
          >
            {BRAND_INSTITUTION}
          </Text>
        </Animated.View>

        <Animated.View style={[loaderStyle, { marginTop: 36 }]}>
          <BookPageLoader size={48} coverColor={BRAND.navy} />
          <Text
            style={{
              marginTop: 10,
              fontFamily: 'PlusJakartaSans_500Medium',
              fontSize: 13,
              color: BRAND.textMuted,
            }}
          >
            Abrindo sua biblioteca…
          </Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  )
}
