import { cn } from '@/lib/utils'
import { type LabelHTMLAttributes } from 'react'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium text-text leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...props}
    />
  )
}

export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-xs text-error" role="alert" aria-live="polite">
      {message}
    </p>
  )
}
