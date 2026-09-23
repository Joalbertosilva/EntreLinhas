import { useEffect } from 'react'
import { Text, View } from 'react-native'
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

function LoadingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.35)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 380, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.35, { duration: 380, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    )
  }, [delay, opacity])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={[
        style,
        {
          width: 5,
          height: 5,
          borderRadius: 3,
          backgroundColor: BRAND.primary,
          marginHorizontal: 3,
        },
      ]}
    />
  )
}

interface SplashLoadingCaptionProps {
  visible?: boolean
}

export function SplashLoadingCaption({ visible = true }: SplashLoadingCaptionProps) {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(900, withTiming(visible ? 1 : 0, { duration: 500 }))
  }, [opacity, visible])

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: (1 - opacity.value) * 6 }],
  }))

  return (
    <Animated.View style={[wrapStyle, { alignItems: 'center', width: '100%', paddingHorizontal: 24 }]}>
      <Text
        style={{
          textAlign: 'center',
          fontFamily: 'PlusJakartaSans_500Medium',
          fontSize: 14,
          lineHeight: 21,
          color: BRAND.textMuted,
        }}
      >
        Abrindo sua biblioteca
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <LoadingDot delay={0} />
        <LoadingDot delay={160} />
        <LoadingDot delay={320} />
      </View>
    </Animated.View>
  )
}
