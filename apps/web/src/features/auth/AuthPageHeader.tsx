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
    <header className={cn('space-y-1.5', className)}>
      <h1 className="text-[1.35rem] font-semibold tracking-tight text-text">{title}</h1>
      <p className="text-sm leading-relaxed text-text-muted">{description}</p>
      {children}
    </header>
  )
}
