import { LinearGradient } from 'expo-linear-gradient'
import { Image, Text, View } from 'react-native'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'
import { cn } from '@/lib/cn'

interface BrandLogoProps {
  variant?: 'full' | 'mark'
  className?: string
  showTagline?: boolean
  markSize?: number
  /** Fundo suave para PNG transparente — mescla branco com a cor do contexto. */
  backdrop?: 'none' | 'light' | 'dark'
}

export function BrandLogo({
  variant = 'full',
  className,
  showTagline = true,
  markSize = 40,
  backdrop = 'none',
}: BrandLogoProps) {
  if (variant === 'mark') {
    const pad = backdrop === 'none' ? 0 : 6
    const innerSize = markSize - pad * 2

    const image = (
      <Image
        source={require('../../../assets/images/favicon.png')}
        style={{ width: innerSize, height: innerSize }}
        resizeMode="contain"
        accessibilityLabel={BRAND_NAME}
      />
    )

    if (backdrop === 'dark') {
      return (
        <LinearGradient
          colors={['#f8fffd', '#e3f5f0', '#c8ebe3']}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={{
            width: markSize,
            height: markSize,
            borderRadius: markSize / 2,
            padding: pad,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.35)',
          }}
          className={className}
        >
          {image}
        </LinearGradient>
      )
    }

    if (backdrop === 'light') {
      return (
        <LinearGradient
          colors={['#ffffff', '#f4fbf9', '#e8f7f4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: markSize,
            height: markSize,
            borderRadius: 12,
            padding: pad,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(28, 117, 106, 0.12)',
          }}
          className={className}
        >
          {image}
        </LinearGradient>
      )
    }

    return (
      <Image
        source={require('../../../assets/images/favicon.png')}
        style={{ width: markSize, height: markSize }}
        className={className}
        resizeMode="contain"
        accessibilityLabel={BRAND_NAME}
      />
    )
  }

  return (
    <View className={cn('items-center', className)}>
      <Image
        source={require('../../../assets/images/entrelinhas-logo.png')}
        className="h-16 w-64"
        resizeMode="contain"
        accessibilityLabel={`${BRAND_NAME} — ${BRAND_TAGLINE}`}
      />
      {showTagline ? (
        <>
          <Text className="mt-3 text-center font-sans-medium text-base text-brand-navy">
            {BRAND_TAGLINE}
          </Text>
          <Text className="mt-1 text-xs font-sans-semibold uppercase tracking-widest text-text-muted">
            {BRAND_INSTITUTION}
          </Text>
        </>
      ) : null}
    </View>
  )
}
