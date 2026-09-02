import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { AppSearchBar } from '@/features/app/AppSearchBar'
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
          <div className="border-b border-border px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar name={profile.nome} className="h-10 w-10 text-xs" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{profile.nome}</p>
                <p className="truncate text-xs text-text-muted">@{profile.nome_usuario}</p>
              </div>
            </div>
            <AppSearchBar onNavigate={onClose} className="sm:hidden" />
            <Link
              to="/app/perfil"
              onClick={onClose}
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              Minha conta
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
