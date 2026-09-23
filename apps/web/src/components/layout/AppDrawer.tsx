import { Link } from '@tanstack/react-router'
import { ChevronRight, X } from 'lucide-react'
import { AppSearchBar } from '@/features/app/AppSearchBar'
import { ACCOUNT_MENU_ITEMS, PERFIL_LABELS } from '@/features/app/accountMenu'
import { resolveSectionId } from '@/features/app/appNavigation'
import type { Profile } from '@tcc-sistema/types'
import { BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { AppNavLinks } from '@/components/layout/AppNavLinks'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

interface AppDrawerProps {
  open: boolean
  pathname: string
  isStaff: boolean
  profile: Profile | null
  onClose: () => void
  onSignOut: () => void
}

const DRAWER_ACCOUNT_LINKS = ACCOUNT_MENU_ITEMS.filter((item) => item.to !== '/app/perfil').slice(0, 3)

/** Menu lateral deslizante — mobile/tablet (< lg). Único menu de navegação no celular. */
export function AppDrawer({ open, pathname, isStaff, profile, onClose, onSignOut }: AppDrawerProps) {
  const activeId = resolveSectionId(pathname)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-brand-navy/20 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="relative flex h-full w-[min(300px,88vw)] flex-col border-r border-primary/10 bg-elevated-muted shadow-2xl backdrop-blur-md animate-fade-in"
        aria-label="Menu de navegação"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo variant="icon" />
            <div>
              <p className="font-semibold text-brand-navy">{BRAND_NAME}</p>
              <p className="text-xs text-text-muted">Plataforma do aluno</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {profile && (
          <div className="space-y-3 border-b border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <Avatar name={profile.nome} className="h-10 w-10 text-xs" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-navy">{profile.nome}</p>
                <p className="truncate text-xs text-primary">@{profile.nome_usuario}</p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                  {PERFIL_LABELS[profile.perfil]}
                </p>
              </div>
            </div>
            <AppSearchBar onNavigate={onClose} className="sm:hidden" />
            <ul className="overflow-hidden rounded-xl border border-border/70 bg-white/80">
              {DRAWER_ACCOUNT_LINKS.map((item, index) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={`group flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors hover:bg-primary-light/40 ${
                      index < DRAWER_ACCOUNT_LINKS.length - 1 ? 'border-b border-border/60' : ''
                    }`}
                  >
                    <item.icon className="h-4 w-4 text-primary" strokeWidth={1.75} aria-hidden />
                    <span className="flex-1 font-medium text-text group-hover:text-primary">{item.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-text-muted/70" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/app/perfil"
              onClick={onClose}
              className="inline-flex text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              Ver todas as opções da conta
            </Link>
          </div>
        )}

        <AppNavLinks
          activeId={activeId}
          onNavigate={onClose}
          isStaff={isStaff}
          onSignOut={onSignOut}
        />
      </aside>
    </div>
  )
}
