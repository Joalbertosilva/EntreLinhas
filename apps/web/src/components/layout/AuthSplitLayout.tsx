import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthSplitLayoutProps {
  hero: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Layout base para telas de autenticação (login, recuperação, etc.).
 * Metade hero + metade formulário com fundo pontilhado.
 */
export function AuthSplitLayout({ hero, children, footer, className }: AuthSplitLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-brand-surface lg:flex-row', className)}>
      {hero}

      <main
        id="conteudo-principal"
        className="flex flex-1 flex-col bg-login-form lg:min-w-0 lg:w-1/2"
      >
        <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
          <div className="login-form-wrap mx-auto w-full max-w-[420px]">{children}</div>
        </div>
        {footer}
      </main>
    </div>
  )
}
