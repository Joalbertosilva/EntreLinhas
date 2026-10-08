import { Volume2, VolumeX } from 'lucide-react'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { cn } from '@/lib/utils'

interface SpeakButtonProps {
  label: string
  className?: string
}

export function SpeakButton({ label, className }: SpeakButtonProps) {
  const { toggleSpeak, isSpeakingText } = useAccessibility()
  const active = isSpeakingText(label)

  return (
    <button
      type="button"
      onClick={() => toggleSpeak(label)}
      aria-label={active ? 'Parar leitura' : `Ouvir: ${label}`}
      aria-pressed={active}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-elevated shadow-sm transition-colors hover:bg-primary-light',
        active && 'border-primary bg-primary-light',
        className,
      )}
    >
      {active ? (
        <VolumeX className="h-3.5 w-3.5 text-primary" strokeWidth={2} aria-hidden />
      ) : (
        <Volume2 className="h-3.5 w-3.5 text-primary" strokeWidth={2} aria-hidden />
      )}
    </button>
  )
}
