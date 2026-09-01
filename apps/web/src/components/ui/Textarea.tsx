import { cn } from '@/lib/utils'
import { type TextareaHTMLAttributes, forwardRef } from 'react'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[96px] w-full rounded-xl border-2 border-border bg-white px-3.5 py-2.5 text-sm text-text',
        'placeholder:text-text-muted/70 resize-y',
        'transition-colors duration-150 hover:border-primary/20',
        'focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[var(--shadow-glow)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
