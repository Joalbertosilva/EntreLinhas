import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BookReadingShellProps {
  children: ReactNode
  className?: string
}

/** Moldura de leitura — preenche laterais e remete a uma página de livro em telas grandes. */
export function BookReadingShell({ children, className }: BookReadingShellProps) {
  return (
    <div className={cn('book-reading-shell', className)}>
      <div className="book-reading-page">{children}</div>
    </div>
  )
}
