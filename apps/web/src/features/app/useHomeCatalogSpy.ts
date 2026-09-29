import { useEffect, useState } from 'react'
import type { AppSectionId } from '@/features/app/appNavigation'

/** Ordem de leitura na home — inclui faixas de vídeo entre seções */
const SCROLL_MARKERS: Array<{ id: string; nav: AppSectionId }> = [
  { id: 'section-livros', nav: 'livros' },
  { id: 'section-videos-livros', nav: 'videos' },
  { id: 'section-cronicas', nav: 'cronicas' },
  { id: 'section-videos-cronicas', nav: 'videos' },
  { id: 'section-musicas', nav: 'musicas' },
  { id: 'section-videos-musicas', nav: 'videos' },
  { id: 'section-poemas', nav: 'poemas' },
  { id: 'section-videos-poemas', nav: 'videos' },
]

const ANCHOR_VIEWPORT_RATIO = 0.34

function resolveVisibleSection(): AppSectionId {
  const anchorY = window.innerHeight * ANCHOR_VIEWPORT_RATIO
  let current: AppSectionId = 'livros'

  for (const marker of SCROLL_MARKERS) {
    const el = document.getElementById(marker.id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= anchorY) {
      current = marker.nav
    }
  }

  return current
}

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

/** True quando o usuário está numa faixa de vídeos (não na seção principal de tipo). */
export function isVideosZoneActive(activeId: AppSectionId | null): boolean {
  if (activeId !== 'videos') return false
  const anchorY = window.innerHeight * ANCHOR_VIEWPORT_RATIO

  for (const marker of SCROLL_MARKERS) {
    if (!marker.id.startsWith('section-videos-')) continue
    const el = document.getElementById(marker.id)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    if (rect.top <= anchorY && rect.bottom > anchorY * 0.5) {
      return true
    }
  }

  return false
}
