import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { SplashAccentLine } from '@/components/splash/SplashAmbientBackground'
import { BRAND } from '@/lib/brandTheme'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'

export function SplashBrandLockup() {
  const markScale = useSharedValue(0.6)
  const markOpacity = useSharedValue(0)
  const logoOpacity = useSharedValue(0)
  const logoY = useSharedValue(16)
  const textOpacity = useSharedValue(0)

  useEffect(() => {
    markOpacity.value = withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) })
    markScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.35)) })
    logoOpacity.value = withDelay(280, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
    logoY.value = withDelay(280, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }))
    textOpacity.value = withDelay(520, withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) }))
  }, [logoOpacity, logoY, markOpacity, markScale, textOpacity])

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }))

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 10 }],
  }))

  return (
    <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 12 }}>
      <Animated.View style={markStyle}>
        <LinearGradient
          colors={['#ffffff', '#f0faf8', '#e3f5f0']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(28,117,106,0.18)',
            shadowColor: BRAND.navy,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: 31,
              borderWidth: 1.5,
              borderColor: 'rgba(26,51,66,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.65)',
            }}
          >
            <Image
              source={require('../../../assets/images/favicon.png')}
              style={{ width: 38, height: 38 }}
              contentFit="contain"
              accessibilityLabel={BRAND_NAME}
            />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[logoStyle, { marginTop: 22, width: '100%', alignItems: 'center' }]}>
        <Image
          source={require('../../../assets/images/entrelinhas-logo.png')}
          style={{ width: 248, height: 82, maxWidth: '92%' }}
          contentFit="contain"
          accessibilityLabel={BRAND_NAME}
        />
      </Animated.View>

      <SplashAccentLine />

      <Animated.View style={[textStyle, { marginTop: 16, width: '100%', alignItems: 'center', paddingHorizontal: 8 }]}>
        <Text
          style={{
            textAlign: 'center',
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 17,
            lineHeight: 26,
            color: BRAND.navy,
            letterSpacing: 0.2,
          }}
        >
          {BRAND_TAGLINE}
        </Text>
        <Text
          style={{
            marginTop: 10,
            textAlign: 'center',
            fontSize: 10,
            fontFamily: 'PlusJakartaSans_600SemiBold',
            letterSpacing: 2.4,
            textTransform: 'uppercase',
            color: BRAND.textMuted,
          }}
        >
          {BRAND_INSTITUTION}
        </Text>
      </Animated.View>
    </View>
  )
}
