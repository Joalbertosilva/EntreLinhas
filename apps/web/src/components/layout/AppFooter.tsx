import { Link } from '@tanstack/react-router'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'

const FOOTER_LINKS = [
  { to: '/app', label: 'Início', end: true },
  { to: '/app/livros', label: 'Livros' },
  { to: '/app/perfil', label: 'Minha conta' },
] as const

export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-primary/10 bg-white/75 backdrop-blur-sm">
      <div className="mx-auto w-full px-4 py-8 lg:px-6 lg:py-10 xl:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-sm gap-3">
            <BrandLogo variant="icon" className="h-10 w-10 shrink-0" />
            <div>
              <p className="font-semibold text-brand-navy">{BRAND_NAME}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">{BRAND_TAGLINE}</p>
              <p className="mt-2 text-xs font-medium text-primary/80">{BRAND_INSTITUTION}</p>
            </div>
          </div>

          <nav aria-label="Links do rodapé">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Navegação
            </p>
            <ul className="flex flex-col gap-2 sm:items-end">
              {FOOTER_LINKS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-text-muted transition-colors hover:text-primary"
                    activeOptions={'end' in item && item.end ? { exact: true } : undefined}
                    activeProps={{ className: 'text-sm font-medium text-primary' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-border/80 pt-5 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND_NAME}. Todos os direitos reservados.
          </p>
          <p className="text-text-muted/90">Plataforma de leitura e formação — {BRAND_INSTITUTION}</p>
        </div>
      </div>
    </footer>
  )
}
