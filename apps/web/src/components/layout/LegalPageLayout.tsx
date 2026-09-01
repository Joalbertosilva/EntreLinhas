import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { BRAND_INSTITUTION, BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { cn } from '@/lib/utils'

interface LegalPageLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  backTo?: string
  backLabel?: string
}

export function LegalPageLayout({
  title,
  subtitle,
  children,
  backTo = '/login',
  backLabel = 'Voltar ao login',
}: LegalPageLayoutProps) {
  const year = new Date().getFullYear()

  return (
    <div className="app-shell relative flex min-h-screen flex-col">
      <div className="app-atmosphere-gradient pointer-events-none fixed inset-0 -z-20" aria-hidden />
      <div className="app-atmosphere-dots pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link to="/app" className="flex items-center gap-2.5">
            <BrandLogo variant="icon" className="h-9 w-9" />
            <span className="hidden text-sm font-semibold text-brand-navy sm:inline">{BRAND_NAME}</span>
          </Link>
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {backLabel}
          </Link>
        </div>
      </header>

      <main id="conteudo-principal" className="flex-1 px-5 py-8 sm:px-8 sm:py-10" tabIndex={-1}>
        <article className="legal-page mx-auto max-w-3xl">
          <header className="mb-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Institucional</p>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">{title}</h1>
            <p className="text-base leading-relaxed text-text-muted">{subtitle}</p>
            <p className="text-xs text-text-muted/90">
              Última atualização: setembro de 2026 · {BRAND_INSTITUTION}
            </p>
          </header>

          <div className={cn('space-y-6')}>{children}</div>
        </article>
      </main>

      <footer className="mt-auto border-t border-primary/10 bg-elevated-muted px-5 py-6 text-center text-xs text-text-muted sm:px-8">
        <p>
          © {year} {BRAND_NAME} · {BRAND_INSTITUTION}
        </p>
        <p className="mt-1">
          <Link to="/privacidade" className="font-medium text-primary hover:underline">
            Política de privacidade
          </Link>
        </p>
      </footer>
    </div>
  )
}

interface LegalSectionProps {
  id: string
  title: string
  children: ReactNode
}

export function LegalSection({ id, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-primary/10 bg-white/88 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm"
    >
      <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-text-muted [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_strong]:font-medium [&_strong]:text-text">
        {children}
      </div>
    </section>
  )
}
