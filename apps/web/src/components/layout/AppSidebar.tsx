import { Link } from '@tanstack/react-router'
import { resolveSectionId } from '@/features/app/appNavigation'
import { BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { AppNavLinks } from '@/components/layout/AppNavLinks'

interface AppSidebarProps {
  pathname: string
  isStaff: boolean
  onSignOut: () => void
}

/** Barra lateral fixa — visível em telas grandes (lg+). */
export function AppSidebar({ pathname, isStaff, onSignOut }: AppSidebarProps) {
  const activeId = resolveSectionId(pathname)

  return (
    <aside
      className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[17.5rem] lg:shrink-0 lg:flex-col lg:border-r lg:border-primary/10 lg:bg-elevated-muted lg:backdrop-blur-md"
      aria-label="Navegação principal"
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/app" className="flex min-w-0 items-center gap-3 rounded-xl transition-colors hover:opacity-90">
          <BrandLogo variant="icon" className="h-10 w-10 shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-navy">{BRAND_NAME}</p>
            <p className="truncate text-xs text-text-muted">Plataforma do aluno</p>
          </div>
        </Link>
      </div>

      <AppNavLinks activeId={activeId} isStaff={isStaff} onSignOut={onSignOut} />
    </aside>
  )
}
