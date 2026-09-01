import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/** Indicação visual de que há conteúdo abaixo — complementa o sumário, não substitui. */
export function ScrollContinueHint({ className }: { className?: string }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hide = () => {
      if (window.scrollY > 64) setVisible(false)
    }
    hide()
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [])

  if (!visible) return null

  return (
    <p
      className={cn(
        'flex items-center justify-center gap-1.5 py-1 text-center text-xs font-medium text-text-muted motion-safe:animate-pulse',
        className,
      )}
      aria-live="polite"
    >
      <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
      Continue rolando para ver texto, reflexão e comentários
    </p>
  )
}
