import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { APP_NAV_HEADER, type AppSectionId } from '@/features/app/appNavigation'
import { SectionIcon } from '@/features/app/SectionIcon'
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator'
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
  const indicatorActiveId = items.some((item) => item.id === activeSection) ? activeSection : null
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const indicatorTargetId = hoveredId ?? indicatorActiveId
  const isHovering = hoveredId != null

  const { containerRef, register, rect } = useSlidingIndicator(indicatorTargetId)

  return (
    <nav
      ref={containerRef}
      className={cn('app-header-nav relative', className)}
      aria-label="Navegação principal"
      onMouseLeave={() => setHoveredId(null)}
    >
      {rect && (
        <span
          className={cn('app-header-nav-indicator', isHovering && 'is-hovering')}
          style={{
            width: rect.width,
            transform: `translateX(${rect.left}px)`,
          }}
          aria-hidden
        />
      )}

      {items.map((item) => {
        const active = item.id === 'admin' ? false : activeSection === item.id
        const preview = hoveredId === item.id

        return (
          <Link
            key={item.id}
            to={item.to}
            ref={(el) => register(item.id, el)}
            onMouseEnter={() => setHoveredId(item.id)}
            onClick={onNavigate}
            className={cn('app-header-nav-item', active && 'is-active', preview && 'is-preview')}
            activeOptions={'end' in item ? { exact: item.end } : undefined}
          >
            <SectionIcon
              section={item.id === 'admin' ? 'admin' : (item.id as AppSectionId)}
              size="sm"
              active={active || preview}
              className="shadow-none"
            />
            <span className="app-header-nav-label">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
