import { Image, Text, View } from 'react-native'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand'
import { cn } from '@/lib/cn'

interface BrandLogoProps {
  variant?: 'full' | 'mark'
  className?: string
  showTagline?: boolean
}

export function BrandLogo({ variant = 'full', className, showTagline = true }: BrandLogoProps) {
  if (variant === 'mark') {
    return (
      <Image
        source={require('../../../assets/images/favicon.png')}
        style={{ width: 40, height: 40 }}
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
