import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { BRAND } from '@/lib/brandTheme'

function AmbientOrb({
  size,
  color,
  initialX,
  initialY,
  driftX,
  driftY,
  duration,
}: {
  size: number
  color: string
  initialX: number
  initialY: number
  driftX: number
  driftY: number
  duration: number
}) {
  const tx = useSharedValue(0)
  const ty = useSharedValue(0)
  const pulse = useSharedValue(1)

  useEffect(() => {
    tx.value = withRepeat(
      withSequence(
        withTiming(driftX, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
    ty.value = withRepeat(
      withSequence(
        withTiming(driftY, { duration: duration * 1.15, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: duration * 1.15, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: duration * 0.9, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.94, { duration: duration * 0.9, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [driftX, driftY, duration, pulse, tx, ty])

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: pulse.value }],
  }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          position: 'absolute',
          left: initialX,
          top: initialY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.55,
        },
      ]}
    />
  )
}

export function SplashAmbientBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#f8fbfe', '#eef4fa', '#e6f3ef', '#fafefd']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <AmbientOrb size={220} color="rgba(26,51,66,0.07)" initialX={-40} initialY={80} driftX={18} driftY={24} duration={4200} />
      <AmbientOrb size={180} color="rgba(28,117,106,0.09)" initialX={220} initialY={120} driftX={-22} driftY={16} duration={3800} />
      <AmbientOrb size={140} color="rgba(239,176,52,0.08)" initialX={60} initialY={420} driftX={14} driftY={-18} duration={3600} />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          backgroundColor: 'transparent',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(205,217,227,0.45)',
        }}
      />
    </View>
  )
}

export function SplashAccentLine() {
  return (
    <LinearGradient
      colors={['transparent', BRAND.primary, BRAND.navy, 'transparent']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{ width: 72, height: 3, borderRadius: 2, marginTop: 20, marginBottom: 4 }}
    />
  )
}
