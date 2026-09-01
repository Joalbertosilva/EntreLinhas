import { Link } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'
import { APP_NAV_HEADER, type AppSectionId } from '@/features/app/appNavigation'
import { SectionIcon } from '@/features/app/SectionIcon'
import { cn } from '@/lib/utils'

interface AppHeaderNavProps {
  activeSection: string
  isStaff?: boolean
  onNavigate?: () => void
  className?: string
}

export function AppHeaderNav({
  activeSection,
  isStaff,
  onNavigate,
  className,
}: AppHeaderNavProps) {
  const staffNav = isStaff
    ? [{ id: 'admin' as const, to: '/admin', label: 'Painel administrativo' }]
    : []

  const items = [...APP_NAV_HEADER, ...staffNav]

  return (
    <nav className={cn('app-header-nav', className)} aria-label="Navegação principal">
      {items.map((item) => {
        const active = item.id === 'admin' ? false : activeSection === item.id

        return (
          <Link
            key={item.id}
            to={item.to}
            onClick={onNavigate}
            className={cn('app-header-nav-item', active && 'is-active')}
            activeOptions={'end' in item ? { exact: item.end } : undefined}
          >
            {item.id === 'admin' ? (
              <span className="app-header-nav-icon app-header-nav-icon-admin" aria-hidden>
                <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
              </span>
            ) : (
              <SectionIcon section={item.id as AppSectionId} size="sm" className="shadow-none" />
            )}
            <span className="app-header-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
