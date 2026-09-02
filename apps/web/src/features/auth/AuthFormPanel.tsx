import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthFormPanelProps {
  children: ReactNode
  className?: string
}

/** Painel do formulário auth — card branco sobre o fundo do login */
export function AuthFormPanel({ children, className }: AuthFormPanelProps) {
  return (
    <div className={cn('auth-form-panel', className)}>
      {children}
    </div>
  )
}
