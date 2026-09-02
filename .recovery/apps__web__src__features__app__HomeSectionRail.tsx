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

  /** Um pill branco por vez — hover tem prioridade sobre scroll */
  const highlightedId = hoveredId ?? activeSection

  return (
    <div className="home-section-rail-wrap">
      <nav
        className="home-section-rail"
        aria-label="Tipos de conteúdo"
        onMouseLeave={() => setHoveredId(null)}
      >
        <div className="home-section-rail__cap" aria-hidden>
          <SiteWeaveArt variant="rail" className="home-section-rail__weave" />
        </div>

        <div className="home-section-rail__track">
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
                  'flex items-center justify-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold',
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
                      : 'opacity-65 group-hover:translate-x-0.5 group-hover:opacity-85',
                  )}
                  aria-hidden
                />
              </Link>
            )
          })}
        </div>

        <div className="home-section-rail__cap home-section-rail__cap--foot" aria-hidden>
          <SiteWeaveArt variant="rail" className="home-section-rail__weave" />
        </div>
      </nav>
    </div>
  )
}
