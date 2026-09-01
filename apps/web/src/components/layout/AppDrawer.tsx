import { X } from 'lucide-react'
import { resolveSectionId } from '@/features/app/appNavigation'
import { BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { AppNavLinks } from '@/components/layout/AppNavLinks'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

interface AppDrawerProps {
  open: boolean
  pathname: string
  isStaff: boolean
  onClose: () => void
  onSignOut: () => void
}

/** Menu lateral deslizante — apenas mobile/tablet (< lg). */
export function AppDrawer({ open, pathname, isStaff, onClose, onSignOut }: AppDrawerProps) {
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

        <AppNavLinks
          activeId={activeId}
          onNavigate={onClose}
          isStaff={isStaff}
          onSignOut={onSignOut}
        />

        <div className="mt-auto border-t border-border px-4 py-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Aparência
          </p>
          <ThemeToggle />
        </div>
      </aside>
    </div>
  )
}
