import {
  APP_NAV_ACCOUNT,
  APP_NAV_HEADER,
  APP_NAV_SECTIONS,
  type AppNavItem,
} from '@/features/app/appNavigation'
import { Link } from '@tanstack/react-router'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { SectionIcon } from '@/features/app/SectionIcon'
import { cn } from '@/lib/utils'

interface AppNavLinksProps {
  activeId: string
  onNavigate?: () => void
  isStaff?: boolean
  onSignOut?: () => void
  compact?: boolean
}

export function AppNavLinks({
  activeId,
  onNavigate,
  isStaff,
  onSignOut,
  compact = false,
}: AppNavLinksProps) {
  return (
    <>
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin" aria-label="Seções">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Principal
        </p>
        <ul className="space-y-0.5">
          {APP_NAV_HEADER.map((item) => (
            <NavLinkItem
              key={item.id}
              item={item}
              active={activeId === item.id}
              onNavigate={onNavigate}
              compact={compact}
            />
          ))}
        </ul>

        <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Conteúdos
        </p>
        <ul className="space-y-0.5">
          {APP_NAV_SECTIONS.map((item) => (
            <NavLinkItem
              key={item.id}
              item={item}
              active={activeId === item.id}
              onNavigate={onNavigate}
              compact={compact}
            />
          ))}
        </ul>

        <p className="mb-2 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Conta
        </p>
        <ul className="space-y-0.5">
          <NavLinkItem
            item={APP_NAV_ACCOUNT}
            active={activeId === 'perfil'}
            onNavigate={onNavigate}
            compact={compact}
          />
        </ul>
      </nav>

      {(isStaff || onSignOut) && (
        <div className="space-y-1 border-t border-border p-3">
          {isStaff && (
            <Link
              to="/admin"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light/50 hover:text-primary"
            >
              <LayoutDashboard className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              Painel administrativo
            </Link>
          )}
          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onNavigate?.()
                onSignOut()
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light/50 hover:text-text"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              Sair
            </button>
          )}
        </div>
      )}
    </>
  )
}

function NavLinkItem({
  item,
  active,
  onNavigate,
  compact,
}: {
  item: AppNavItem
  active: boolean
  onNavigate?: () => void
  compact?: boolean
}) {
  return (
    <li>
      <Link
        to={item.to}
        onClick={onNavigate}
        className={cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
          active
            ? 'bg-primary-light text-primary shadow-[var(--shadow-soft)] ring-1 ring-primary/10'
            : 'text-text-muted hover:bg-primary-light/40 hover:text-text',
          compact && 'py-2',
        )}
        activeOptions={{ exact: item.end }}
      >
        <SectionIcon
          section={item.id}
          size="sm"
          className={cn(!active && 'opacity-90 group-hover:opacity-100')}
        />
        <span className="min-w-0">
          <span className={cn('block text-sm', active ? 'font-semibold' : 'font-medium')}>
            {item.label}
          </span>
          {!compact && (
            <span className="block truncate text-[11px] text-text-muted">{item.description}</span>
          )}
        </span>
      </Link>
    </li>
  )
}
