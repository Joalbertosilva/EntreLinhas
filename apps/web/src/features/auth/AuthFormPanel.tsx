import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthFormPanelProps {
  children: ReactNode
  className?: string
}

/** Painel do formulário auth — contenção visual sobre fundo pontilhado */
export function AuthFormPanel({ children, className }: AuthFormPanelProps) {
  return (
    <div className={cn('auth-form-panel', className)}>
      {children}
    </div>
  )
}
