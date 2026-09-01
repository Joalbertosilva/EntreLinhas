import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

const variants = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15',
  error: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15',
  warning: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/15',
  primary: 'bg-primary-light text-primary ring-1 ring-inset ring-primary/20',
  accent: 'bg-accent-light text-[#5c4800] ring-1 ring-inset ring-accent/30',
  outline: 'border border-border text-text-muted bg-white',
} as const

export function Badge({
  className,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
