import { useEffect, useId, type ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { SpeakButton } from '@/features/accessibility/SpeakButton'
import {
  registerScreenAudioRegion,
  unregisterScreenAudioRegion,
} from '@/features/accessibility/screenAudioRegistry'
import { cn } from '@/lib/cn'

interface SpeakableProps extends ViewProps {
  label: string
  children: ReactNode
  /** Onde posicionar o botão de ouvir */
  buttonPosition?: 'top-right' | 'top-left'
}

export function Speakable({
  label,
  children,
  buttonPosition = 'top-right',
  className,
  ...props
}: SpeakableProps) {
  const { screenExplorerMode } = useAccessibility()
  const regionId = useId()

  useEffect(() => {
    if (!screenExplorerMode) {
      unregisterScreenAudioRegion(regionId)
      return
    }
    registerScreenAudioRegion(regionId, () => label)
    return () => unregisterScreenAudioRegion(regionId)
  }, [label, regionId, screenExplorerMode])

  if (!screenExplorerMode) {
    return (
      <View className={className} {...props}>
        {children}
      </View>
    )
  }

  return (
    <View className={cn('relative', className)} {...props}>
      {children}
      <View
        pointerEvents="box-none"
        className={cn(
          'absolute z-10',
          buttonPosition === 'top-right' ? 'right-1 top-1' : 'left-1 top-1',
        )}
      >
        <SpeakButton label={label} />
      </View>
    </View>
  )
}
