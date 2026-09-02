import type { ReactNode } from 'react'
import { AccessibilityTrigger } from '@/features/accessibility'
import { LoginWeaveBackground } from '@/components/layout/SiteWeaveBackground'
import { cn } from '@/lib/utils'

interface AuthSplitLayoutProps {
  hero: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Login em duas colunas: hero (entrelaçado) + formulário.
 */
export function AuthSplitLayout({ hero, children, footer, className }: AuthSplitLayoutProps) {
  return (
    <div className={cn('relative flex min-h-screen flex-col lg:flex-row', className)}>
      <LoginWeaveBackground />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-5">
        <AccessibilityTrigger />
      </div>
      {hero}

      <main
        id="conteudo-principal"
        className="relative flex flex-1 flex-col bg-login-form lg:min-w-0 lg:w-1/2"
      >
        <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-16">
          <div className="login-form-wrap mx-auto w-full max-w-[420px]">{children}</div>
        </div>
        {footer}
      </main>
    </div>
  )
}
