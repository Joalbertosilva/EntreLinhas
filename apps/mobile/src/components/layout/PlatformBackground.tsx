import type { ReactNode } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { View, type ViewProps } from 'react-native'
import { PLATFORM_GRADIENT, PLATFORM_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { cn } from '@/lib/cn'

interface PlatformBackgroundProps extends ViewProps {
  children: ReactNode
}

/** Fundo das telas logadas — mesmo degradê mint da plataforma web (`platform-bg`). */
export function PlatformBackground({ children, className, style, ...rest }: PlatformBackgroundProps) {
  return (
    <View className={cn('flex-1', className)} style={style} {...rest}>
      <LinearGradient
        colors={[...PLATFORM_GRADIENT]}
        locations={[...PLATFORM_GRADIENT_LOCATIONS]}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        pointerEvents="none"
      />
      {children}
    </View>
  )
}
