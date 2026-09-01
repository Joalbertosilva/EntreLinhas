import { cn } from '@/lib/utils'
import { type SelectHTMLAttributes, forwardRef } from 'react'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-xl border-2 border-border bg-white px-3.5 py-2 text-sm text-text',
        'transition-colors duration-150 hover:border-primary/20',
        'focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[var(--shadow-glow)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = 'Select'
