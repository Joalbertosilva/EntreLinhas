import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'brand' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold cursor-pointer',
        'transition-all duration-200 ease-out',
        'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        {
          'bg-primary text-white shadow-sm hover:bg-primary-hover active:scale-[0.99]':
            variant === 'primary',
          'bg-accent text-text shadow-sm hover:bg-accent-hover active:scale-[0.99]':
            variant === 'secondary',
          'bg-brand-navy text-white shadow-sm hover:bg-[#002855] active:scale-[0.99] focus-visible:ring-brand-navy/30':
            variant === 'brand',
          'border-2 border-border bg-white text-text hover:border-primary/25 hover:bg-primary-light/40':
            variant === 'outline',
          'text-text-muted hover:bg-primary-light/50 hover:text-primary': variant === 'ghost',
          'border border-red-200 bg-red-50 text-error hover:bg-red-100': variant === 'destructive',
          'h-8 px-3.5 text-xs': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-11 px-6 text-sm': size === 'lg',
          'h-10 w-10 p-0': size === 'icon',
        },
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
