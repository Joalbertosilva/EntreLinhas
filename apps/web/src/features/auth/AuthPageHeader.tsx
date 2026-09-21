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
    <header className={cn('mb-6 space-y-2', className)}>
      <h1 className="text-2xl font-bold tracking-tight text-brand-navy">{title}</h1>
      <p className="text-base leading-relaxed text-text-muted">{description}</p>
      {children}
    </header>
  )
}
