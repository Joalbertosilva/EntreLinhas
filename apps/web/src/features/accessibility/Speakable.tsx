import { useEffect, useId, type HTMLAttributes, type ReactNode } from 'react'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { SpeakButton } from '@/features/accessibility/SpeakButton'
import {
  registerScreenAudioRegion,
  unregisterScreenAudioRegion,
} from '@/features/accessibility/screenAudioRegistry'
import { cn } from '@/lib/utils'

interface SpeakableProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  children: ReactNode
  buttonPosition?: 'top-right' | 'top-left'
}

export function Speakable({
  label,
  children,
  buttonPosition = 'top-right',
  className,
  ...props
}: SpeakableProps) {
  const { audioEnabled } = useAccessibility()
  const showSpeakButton = audioEnabled === true
  const regionId = useId()

  useEffect(() => {
    if (!showSpeakButton) {
      unregisterScreenAudioRegion(regionId)
      return
    }
    registerScreenAudioRegion(regionId, () => label)
    return () => unregisterScreenAudioRegion(regionId)
  }, [label, regionId, showSpeakButton])

  if (!showSpeakButton) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    )
  }

  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      <div
        className={cn(
          'pointer-events-none absolute z-10',
          buttonPosition === 'top-right' ? 'right-2 top-2' : 'left-2 top-2',
        )}
      >
        <div className="pointer-events-auto">
          <SpeakButton label={label} />
        </div>
      </div>
    </div>
  )
}
