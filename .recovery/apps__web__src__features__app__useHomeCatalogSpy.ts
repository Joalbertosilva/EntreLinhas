import { useEffect, useState } from 'react'
import type { AppSectionId } from '@/features/app/appNavigation'

const CATALOG_SECTIONS: AppSectionId[] = ['livros', 'cronicas', 'musicas', 'poemas']

/** Linha de referência abaixo do menu sticky — só uma seção ativa por vez */
const ANCHOR_VIEWPORT_RATIO = 0.34

function resolveVisibleSection(): AppSectionId {
  const anchorY = window.innerHeight * ANCHOR_VIEWPORT_RATIO
  let current: AppSectionId = CATALOG_SECTIONS[0]

  for (const id of CATALOG_SECTIONS) {
    const el = document.getElementById(`section-${id}`)
    if (!el) continue
    if (el.getBoundingClientRect().top <= anchorY) {
      current = id
    }
  }

  return current
}

/** Destaca o pill conforme a seção de catálogo visível na viewport. */
export function useHomeCatalogSpy(enabled: boolean) {
  const [activeId, setActiveId] = useState<AppSectionId | null>(null)

  useEffect(() => {
    if (!enabled) {
      setActiveId(null)
      return
    }

    const sync = () => setActiveId(resolveVisibleSection())

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync, { passive: true })

    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [enabled])

  return activeId
}
