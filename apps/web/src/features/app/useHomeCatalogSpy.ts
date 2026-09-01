import { useEffect, useState } from 'react'
import type { AppSectionId } from '@/features/app/appNavigation'

const CATALOG_SECTIONS: AppSectionId[] = ['livros', 'cronicas', 'musicas', 'poemas']

/** Destaca o pill da home conforme a seção de catálogo visível na viewport. */
export function useHomeCatalogSpy(enabled: boolean) {
  const [activeId, setActiveId] = useState<AppSectionId | null>(null)

  useEffect(() => {
    if (!enabled) {
      setActiveId(null)
      return
    }

    const elements = CATALOG_SECTIONS.map((id) => document.getElementById(`section-${id}`)).filter(
      (el): el is HTMLElement => el != null,
    )

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length === 0) return

        const id = visible[0].target.id.replace('section-', '') as AppSectionId
        setActiveId(id)
      },
      { rootMargin: '-42% 0px -48% 0px', threshold: [0.12, 0.35, 0.55, 0.75] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [enabled])

  return activeId
}
