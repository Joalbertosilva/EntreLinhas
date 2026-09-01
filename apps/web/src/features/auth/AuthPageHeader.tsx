import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthPageHeaderProps {
  title: string
  description: string
  className?: string
  children?: ReactNode
}

export function AuthPageHeader({ title, description, className, children }: AuthPageHeaderProps) {
  return (
    <header className={cn('space-y-2', className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Acesso</p>
      <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">{title}</h1>
      <p className="text-sm leading-relaxed text-text-muted">{description}</p>
      {children}
    </header>
  )
}
