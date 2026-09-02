import type { ReactNode } from 'react'
import { LoginWeaveBackground } from '@/components/layout/SiteWeaveBackground'
import { cn } from '@/lib/utils'

interface AuthSplitLayoutProps {
  hero: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Login em duas colunas (desktop): ilustração | formulário.
 * Mobile: ilustração compacta acima do form.
 */
export function AuthSplitLayout({ hero, children, footer, className }: AuthSplitLayoutProps) {
  return (
    <div className={cn('relative flex min-h-screen flex-col lg:flex-row', className)}>
      <div className="app-atmosphere-gradient pointer-events-none fixed inset-0 -z-20" aria-hidden />
      <div className="app-atmosphere-dots pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <aside
        className={cn(
          'relative flex shrink-0 flex-col justify-center',
          'border-b border-primary/10 bg-gradient-to-br from-primary-light/55 via-white to-accent-light/25',
          'px-6 py-8 sm:px-10 sm:py-10',
          'lg:fixed lg:inset-y-0 lg:left-0 lg:z-10 lg:min-h-screen lg:w-1/2 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-12 xl:px-16',
        )}
        aria-label="Leitura e reflexão"
      >
        {hero}
      </aside>

      <main
        id="conteudo-principal"
        className="relative flex flex-1 flex-col bg-white lg:ml-[50%] lg:min-h-screen lg:w-1/2"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-primary-light/15" aria-hidden />
        <div className="relative flex flex-1 flex-col justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
          {children}
        </div>
        {footer}
      </main>
    </div>
  )
}
