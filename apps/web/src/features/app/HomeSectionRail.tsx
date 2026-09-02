import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { APP_NAV_SECTIONS, type AppSectionId } from '@/features/app/appNavigation'
import { SectionIcon } from '@/features/app/SectionIcon'
import { SiteWeaveArt } from '@/components/layout/SiteWeaveArt'
import { cn } from '@/lib/utils'

interface HomeSectionRailProps {
  activeSection?: AppSectionId | null
}

export function HomeSectionRail({ activeSection = null }: HomeSectionRailProps) {
  const [hoveredId, setHoveredId] = useState<AppSectionId | null>(null)

  const highlightedId = hoveredId ?? activeSection

  return (
    <div className="home-section-rail-wrap">
      <nav
        className="home-section-rail"
        aria-label="Tipos de conteúdo"
        onMouseLeave={() => setHoveredId(null)}
      >
        <SiteWeaveArt variant="rail" className="home-section-rail__weave" />

        {APP_NAV_SECTIONS.map((item) => {
          const highlighted = highlightedId === item.id

          return (
            <Link
              key={item.id}
              to={item.to}
              data-section={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              className={cn(
                'home-section-rail-item group',
                  'flex items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[0.8125rem] font-semibold sm:px-2.5 sm:py-2 sm:text-sm',
                highlighted && 'is-emphasis',
                activeSection === item.id && 'is-active',
              )}
            >
              <SectionIcon section={item.id} size="sm" active={highlighted} flat />
              <span>{item.label}</span>
              <ChevronRight
                className={cn(
                  'home-section-rail-chevron h-3 w-3 shrink-0 transition-transform duration-200',
                  highlighted
                    ? 'translate-x-0.5 opacity-90'
                    : 'opacity-70 group-hover:translate-x-0.5 group-hover:opacity-85',
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
