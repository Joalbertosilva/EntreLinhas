import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { APP_NAV_SECTIONS, type AppSectionId } from '@/features/app/appNavigation'
import { SectionIcon } from '@/features/app/SectionIcon'
import { useSlidingIndicator } from '@/hooks/useSlidingIndicator'
import { cn } from '@/lib/utils'

interface HomeSectionRailProps {
  activeSection?: AppSectionId | null
}

export function HomeSectionRail({ activeSection = null }: HomeSectionRailProps) {
  const indicatorActiveId =
    activeSection && APP_NAV_SECTIONS.some((item) => item.id === activeSection)
      ? activeSection
      : null

  const [hoveredId, setHoveredId] = useState<AppSectionId | null>(null)
  const indicatorTargetId = hoveredId ?? indicatorActiveId
  const isHovering = hoveredId != null

  const { containerRef, register, rect } = useSlidingIndicator(indicatorTargetId)

  return (
    <div className="home-section-rail-wrap">
      <nav
        ref={containerRef}
        className="home-section-rail relative"
        aria-label="Tipos de conteúdo"
        onMouseLeave={() => setHoveredId(null)}
      >
        {rect && (
          <span
            className={cn('home-section-rail-indicator', isHovering && 'is-hovering')}
            style={{
              width: rect.width,
              height: rect.height,
              transform: `translate(${rect.left}px, ${rect.top}px)`,
            }}
            aria-hidden
          />
        )}

        {APP_NAV_SECTIONS.map((item) => {
          const active = activeSection === item.id

          return (
            <Link
              key={item.id}
              to={item.to}
              ref={(el) => register(item.id, el)}
              onMouseEnter={() => setHoveredId(item.id)}
              className={cn(
                'home-section-rail-item group relative z-[1]',
                'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium',
                'transition-colors duration-200',
                active || hoveredId === item.id
                  ? 'text-primary'
                  : 'text-text-muted hover:text-text',
              )}
            >
              <SectionIcon
                section={item.id}
                size="sm"
                active={active || hoveredId === item.id}
                className="shadow-none"
              />
              <span className={cn((active || hoveredId === item.id) && 'font-semibold')}>
                {item.label}
              </span>
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 transition-all duration-200',
                  active || hoveredId === item.id
                    ? 'translate-x-0.5 text-primary opacity-80'
                    : 'opacity-0 group-hover:translate-x-0.5 group-hover:opacity-60',
                )}
                aria-hidden
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
