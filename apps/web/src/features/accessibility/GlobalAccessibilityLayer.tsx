import { Volume2, X } from 'lucide-react'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useScreenAudioSession } from '@/features/accessibility/useScreenAudioSession'
import { useScreenReader } from '@/features/accessibility/useScreenReader'
import { Button } from '@/components/ui/Button'

/** Banner de leitura da tela quando o modo explorer está ativo. */
export function GlobalAccessibilityLayer() {
  const { audioEnabled, setAudioEnabled } = useAccessibility()
  const reader = useScreenReader()
  useScreenAudioSession()

  if (audioEnabled !== true) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-40 flex justify-center px-4 sm:top-20"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex max-w-lg items-center gap-2 rounded-2xl border border-primary/20 bg-elevated px-3 py-2 shadow-md">
        <p className="min-w-0 flex-1 text-xs font-semibold text-brand-navy">
          Leitura da tela · clique nos ícones de som
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full bg-primary-light"
          onClick={() => reader.speakScreen()}
          aria-label="Ouvir tudo desta tela"
        >
          <Volume2 className="h-4 w-4 text-primary" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full"
          onClick={() => setAudioEnabled(false)}
          aria-label="Desativar áudio"
        >
          <X className="h-4 w-4 text-text-muted" />
        </Button>
      </div>
    </div>
  )
}
