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

/** Login em duas colunas sobre fundo mint — logo + card de acesso */
export function AuthSplitLayout({ hero, children, footer, className }: AuthSplitLayoutProps) {
  return (
    <div className={cn('auth-split relative flex min-h-screen w-full flex-col', className)}>
      <LoginWeaveBackground />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-5">
        <AccessibilityTrigger />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row">
        {hero}

        <main
          id="conteudo-principal"
          className="flex w-full flex-col lg:w-1/2 lg:shrink-0 lg:grow-0"
        >
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8 lg:px-10 xl:px-14">
            <div className="login-stack w-full max-w-[420px]">
              <div className="login-card">{children}</div>
              {footer ? <div className="auth-split__footer mt-5">{footer}</div> : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
