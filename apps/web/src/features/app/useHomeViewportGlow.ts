import { useEffect } from 'react'

/** Atualiza variáveis CSS da “mancha” clara que acompanha o campo de visão na home */
export function useHomeViewportGlow(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const root = document.querySelector('.home-page') as HTMLElement | null
    if (!root) return

    const update = () => {
      const y = window.scrollY
      const vh = window.innerHeight
      const offset = Math.min(Math.max(y / vh, 0), 1) * 12
      root.style.setProperty('--home-glow-y', `${38 + offset}%`)
      root.style.setProperty('--home-glow-opacity', `${0.88 - offset * 0.08}`)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      root.style.removeProperty('--home-glow-y')
      root.style.removeProperty('--home-glow-opacity')
    }
  }, [enabled])
}
