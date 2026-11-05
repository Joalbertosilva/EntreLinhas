import type { ReactNode } from 'react'
import { Speakable } from '@/features/accessibility/Speakable'
import { SpeakButton } from '@/features/accessibility/SpeakButton'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { cn } from '@/lib/utils'

interface SectionSpeakHeaderProps {
  label: string
  /** Ícone da seção — o botão de ouvir fica logo ao lado. */
  icon?: ReactNode
  children: ReactNode
  className?: string
}

/** Cabeçalho de seção com botão de áudio colado ao ícone (não no canto oposto). */
export function SectionSpeakHeader({ label, icon, children, className }: SectionSpeakHeaderProps) {
  const { audioEnabled } = useAccessibility()

  return (
    <div className={cn('section-speak-header', className)}>
      {icon}
      {audioEnabled === true && (
        <SpeakButton label={label} className="section-speak-header__btn shrink-0" />
      )}
      <Speakable hideButton label={label} className="section-speak-header__content min-w-0 flex-1">
        {children}
      </Speakable>
    </div>
  )
}
