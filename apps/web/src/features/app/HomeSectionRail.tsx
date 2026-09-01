import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { APP_NAV_SECTIONS, type AppSectionId } from '@/features/app/appNavigation'
import { SectionIcon } from '@/features/app/SectionIcon'
import { cn } from '@/lib/utils'

const RAIL_SECTIONS = APP_NAV_SECTIONS

export function HomeSectionRail() {
  return (
    <div className="home-section-rail-wrap">
      <nav className="home-section-rail" aria-label="Tipos de conteúdo">
        {RAIL_SECTIONS.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className={cn(
              'home-section-rail-item group',
              'flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200',
              'text-text-muted hover:bg-primary-light/55 hover:text-text',
            )}
          >
            <SectionIcon section={item.id as AppSectionId} size="sm" className="shadow-none" />
            <span>{item.label}</span>
            <ChevronRight
              className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-60"
              aria-hidden
            />
          </Link>
        ))}
      </nav>
    </div>
  )
}
