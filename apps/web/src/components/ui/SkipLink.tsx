import { cn } from '@/lib/utils'

/** Link “pular para conteúdo” — primeiro foco via teclado (WCAG 2.4.1) */
export function SkipLink({ href = '#conteudo-principal' }: { href?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
        'focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white',
        'focus:shadow-[var(--shadow-card)] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary',
      )}
    >
      Pular para o conteúdo
    </a>
  )
}
