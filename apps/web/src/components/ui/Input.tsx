import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border-2 border-border bg-white px-3.5 py-2 text-sm text-text',
        'placeholder:text-text-muted/70',
        'transition-colors duration-150 hover:border-primary/20',
        'focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[var(--shadow-glow)]',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
