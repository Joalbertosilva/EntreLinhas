import { Accessibility, Minus, Plus, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AccessibilityToolbarProps {
  className?: string
  floating?: boolean
}

export function AccessibilityToolbar({ className, floating = false }: AccessibilityToolbarProps) {
  const {
    modeEnabled,
    setModeEnabled,
    fontScale,
    fontScalePercent,
    increaseFont,
    decreaseFont,
    resetFont,
    speakPage,
    speakSelection,
    stopSpeech,
    speechSupported,
  } = useAccessibility()

  if (!modeEnabled) return null

  return (
    <div
      className={cn(
        'a11y-toolbar z-50 flex flex-col gap-2 rounded-2xl border border-primary/15 bg-elevated p-3 shadow-[var(--shadow-card)]',
        floating && 'fixed bottom-4 right-4 left-4 sm:left-auto sm:w-72',
        className,
      )}
      role="region"
      aria-label="Ferramentas de acessibilidade"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-text">Acessibilidade</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setModeEnabled(false)}
          aria-label="Fechar ferramentas de acessibilidade"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-text-muted">Tamanho do texto</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={decreaseFont}
            disabled={fontScale === 'normal'}
            aria-label="Diminuir texto"
          >
            <Minus className="h-4 w-4" />
            A-
          </Button>
          <span className="min-w-[3rem] text-center text-sm font-semibold tabular-nums text-text">
            {fontScalePercent}%
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={increaseFont}
            disabled={fontScale === 'xxlarge'}
            aria-label="Aumentar texto"
          >
            <Plus className="h-4 w-4" />
            A+
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFont}
            disabled={fontScale === 'normal'}
            aria-label="Restaurar tamanho padrão"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {speechSupported && (
        <div className="space-y-2 border-t border-border pt-2">
          <p className="text-xs font-medium text-text-muted">Leitura em voz alta</p>
          <div className="flex flex-col gap-2">
            <Button type="button" variant="secondary" size="sm" className="w-full" onClick={speakPage}>
              <Volume2 className="h-4 w-4" />
              Ler esta página
            </Button>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={speakSelection}>
              <Volume2 className="h-4 w-4" />
              Ler texto selecionado
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={stopSpeech}
              aria-label="Parar leitura"
            >
              <VolumeX className="h-4 w-4" />
              Parar leitura
            </Button>
          </div>
          <p className="text-[0.6875rem] leading-relaxed text-text-muted">
            Selecione um trecho na tela e toque em &quot;Ler texto selecionado&quot;, ou ouça a página inteira em
            português.
          </p>
        </div>
      )}
    </div>
  )
}

interface AccessibilityTriggerProps {
  className?: string
}

export function AccessibilityTrigger({ className }: AccessibilityTriggerProps) {
  const { modeEnabled, setModeEnabled } = useAccessibility()

  return (
    <Button
      type="button"
      variant={modeEnabled ? 'primary' : 'outline'}
      size="icon"
      className={cn('h-9 w-9 shrink-0 rounded-xl', className)}
      onClick={() => setModeEnabled(!modeEnabled)}
      aria-label={modeEnabled ? 'Fechar acessibilidade' : 'Abrir acessibilidade'}
      aria-pressed={modeEnabled}
      title="Acessibilidade"
    >
      <Accessibility className="h-4 w-4" />
    </Button>
  )
}
