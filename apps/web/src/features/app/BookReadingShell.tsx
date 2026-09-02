import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BookReadingShellProps {
  children: ReactNode
  className?: string
}

/** Área de leitura — card branco central sobre o fundo mint. */
export function BookReadingShell({ children, className }: BookReadingShellProps) {
  return (
    <div className={cn('book-reading-shell', className)}>
      <div className="book-reading-page">{children}</div>
    </div>
  )
}
