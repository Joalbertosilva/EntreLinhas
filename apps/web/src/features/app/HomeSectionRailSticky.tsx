import { useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { resolveSectionId } from '@/features/app/appNavigation'
import { HomeSectionRail } from '@/features/app/HomeSectionRail'
import { useHomeCatalogSpy } from '@/features/app/useHomeCatalogSpy'
import { cn } from '@/lib/utils'

/** Menu pill da home — gruda no topo quando o usuário rola a página */
export function HomeSectionRailSticky() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isHome = pathname === '/app' || pathname === '/app/'
  const routeSection = resolveSectionId(pathname)
  const scrollSection = useHomeCatalogSpy(isHome)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isPinned, setIsPinned] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsPinned(!entry.isIntersecting),
      { root: null, rootMargin: '0px', threshold: 0 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const activeSection = isHome ? scrollSection : routeSection

  return (
    <>
      <div ref={sentinelRef} className="home-rail-sentinel" aria-hidden />
      <div className={cn('home-section-rail-sticky', isPinned && 'is-pinned')}>
        <HomeSectionRail activeSection={activeSection} />
      </div>
    </>
  )
}
