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
  /** Exibe o botão de som no canto superior do bloco. */
  hideButton?: boolean
  /** Reserva espaço à direita para não cobrir ícones de fechar ou navegar. */
  reserveEnd?: boolean
}

export function Speakable({
  label,
  children,
  hideButton = false,
  reserveEnd = false,
  className,
  ...props
}: SpeakableProps) {
  const { audioEnabled } = useAccessibility()
  const showSpeakButton = audioEnabled === true && !hideButton
  const regionId = useId()

  useEffect(() => {
    if (audioEnabled !== true) {
      unregisterScreenAudioRegion(regionId)
      return
    }
    registerScreenAudioRegion(regionId, () => label)
    return () => unregisterScreenAudioRegion(regionId)
  }, [audioEnabled, label, regionId])

  return (
    <div
      className={cn(
        'a11y-speakable',
        audioEnabled === true && 'a11y-speakable--audio',
        reserveEnd && 'a11y-speakable--reserve-end',
        className,
      )}
      {...props}
    >
      <div className={cn('a11y-speakable__content', 'a11y-scaled-text', 'a11y-scaled-text--block')}>
        {children}
      </div>
      {showSpeakButton && (
        <div className="a11y-speakable__fab">
          <SpeakButton label={label} />
        </div>
      )}
    </div>
  )
}
