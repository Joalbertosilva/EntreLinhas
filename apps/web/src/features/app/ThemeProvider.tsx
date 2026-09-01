import { useEffect, type ReactNode } from 'react'
import { applyTheme } from '@/lib/theme'

/** Mantém apenas o tema claro — modo escuro removido do produto. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    applyTheme('light')
  }, [])

  return <>{children}</>
}
