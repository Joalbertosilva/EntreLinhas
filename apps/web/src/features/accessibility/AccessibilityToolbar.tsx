import { Accessibility, Minus, Plus, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useScreenReader } from '@/features/accessibility/useScreenReader'
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
    audioEnabled,
    setAudioEnabled,
    increaseFont,
    decreaseFont,
    resetFont,
    speechSupported,
  } = useAccessibility()

  const reader = useScreenReader()

  if (!modeEnabled) return null

  return (
    <div
      className={cn(
        'a11y-toolbar z-50 flex max-h-[min(85vh,32rem)] flex-col gap-3 overflow-y-auto rounded-2xl border border-primary/15 bg-elevated p-3 shadow-[var(--shadow-card)]',
        floating && 'fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80',
        className,
      )}
      role="region"
      aria-label="Ferramentas de acessibilidade"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text">Acessibilidade</p>
          <p className="text-xs text-text-muted">Texto maior e leitura em voz alta</p>
        </div>
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
        <div className="space-y-3 border-t border-border pt-3">
          <div>
            <p className="text-xs font-medium text-text-muted">Áudio e leitura</p>
            <p className="mt-1 text-[0.6875rem] leading-relaxed text-text-muted">
              Ative a leitura da tela para ouvir cada card e seção, ou ouça um trecho selecionado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <AudioChoice
              active={audioEnabled === true}
              label="Sim, prefiro áudio"
              icon={Volume2}
              onPress={() => setAudioEnabled(true)}
            />
            <AudioChoice
              active={audioEnabled === false}
              label="Só texto"
              icon={VolumeX}
              onPress={() => setAudioEnabled(false)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                if (reader.isSpeaking) {
                  reader.stopSpeech()
                  return
                }
                if (audioEnabled !== true) setAudioEnabled(true)
                setModeEnabled(false)
                requestAnimationFrame(() => {
                  setTimeout(() => reader.speakScreen(), 500)
                })
              }}
            >
              {reader.isSpeaking ? 'Parar leitura' : 'Ouvir tudo desta tela'}
            </Button>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={reader.speakSelection}>
              <Volume2 className="h-4 w-4" />
              Ouvir seleção
            </Button>
          </div>

          <p className="text-[0.6875rem] leading-relaxed text-text-muted">
            Com o áudio ativo, cada caixa de texto ganha um ícone de som. Clique nele para ouvir
            somente aquele trecho.
          </p>
        </div>
      )}
    </div>
  )
}

function AudioChoice({
  active,
  label,
  icon: Icon,
  onPress,
}: {
  active: boolean
  label: string
  icon: typeof Volume2
  onPress: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        'flex min-w-0 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors',
        active ? 'border-primary bg-primary-light text-primary' : 'border-border bg-elevated text-text-muted',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="text-left leading-tight">{label}</span>
    </button>
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
