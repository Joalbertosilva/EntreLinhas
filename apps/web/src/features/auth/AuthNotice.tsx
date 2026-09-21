import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthNoticeProps {
  title: string
  children: ReactNode
  className?: string
}

/** Aviso institucional em telas auth (recuperação, orientações) */
export function AuthNotice({ title, children, className }: AuthNoticeProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-brand-navy/10 bg-brand-light/60 px-4 py-3.5 text-base leading-relaxed text-text-muted',
        className,
      )}
    >
      <p className="mb-1 font-medium text-text">{title}</p>
      {children}
    </div>
  )
}
