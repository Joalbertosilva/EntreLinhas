import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConteudoPageSection {
  id: string
  label: string
  hint?: string
}

interface ConteudoPageNavProps {
  sections: ConteudoPageSection[]
  className?: string
}

/** Sumário com âncoras — acessível por teclado e leitor de tela (WCAG 2.4.1, 2.4.8). */
export function ConteudoPageNav({ sections, className }: ConteudoPageNavProps) {
  if (sections.length < 2) return null

  return (
    <nav
      aria-label="Navegação desta página"
      className={cn(
        'rounded-2xl border border-primary/12 bg-white/88 p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm sm:p-5',
        className,
      )}
    >
      <p className="text-sm font-semibold text-brand-navy">O que tem nesta página</p>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">
        Role para baixo ou escolha uma seção — reflexão e comentários ficam mais abaixo.
      </p>
      <ol className="mt-4 space-y-2">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="group flex items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-primary/15 hover:bg-primary-light/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary"
                aria-hidden
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-sm font-semibold text-text group-hover:text-primary">
                  {section.label}
                  <ChevronRight
                    className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </span>
                {section.hint && (
                  <span className="mt-0.5 block text-xs text-text-muted">{section.hint}</span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
