import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FieldHintProps {
  text: string
  className?: string
}

/** Ícone (i) com explicação ao passar o mouse ou focar. */
export function FieldHint({ text, className }: FieldHintProps) {
  return (
    <span
      className={cn('field-hint inline-flex align-middle', className)}
      tabIndex={0}
      role="note"
      aria-label={text}
    >
      <Info className="field-hint__icon h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      <span className="field-hint__tooltip">{text}</span>
    </span>
  )
}

interface LabelWithHintProps {
  htmlFor?: string
  children: ReactNode
  hint?: string
  required?: boolean
}

export function LabelWithHint({ htmlFor, children, hint, required }: LabelWithHintProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-text">
        {children}
        {required && ' *'}
      </label>
      {hint && <FieldHint text={hint} />}
    </span>
  )
}
