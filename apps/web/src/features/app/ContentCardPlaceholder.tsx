import type { TipoConteudo } from '@tcc-sistema/types'
import { BookMarked, FileText, Music, Quote, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const TIPO_META: Record<
  TipoConteudo,
  { label: string; icon: typeof BookMarked; tint: string }
> = {
  livro: { label: 'Livro', icon: BookMarked, tint: 'from-primary-light/90 to-white' },
  cronica: { label: 'Crônica', icon: FileText, tint: 'from-accent-light/80 to-white' },
  poema: { label: 'Poema', icon: Quote, tint: 'from-primary-light/70 to-accent-light/40' },
  musica: { label: 'Música', icon: Music, tint: 'from-accent-light/90 to-primary-light/50' },
  frase: { label: 'Frase', icon: Quote, tint: 'from-primary-light/60 to-white' },
  outro: { label: 'Conteúdo', icon: Sparkles, tint: 'from-surface to-white' },
}

interface ContentCardPlaceholderProps {
  tipo: TipoConteudo
  index: number
}

export function ContentCardPlaceholder({ tipo, index }: ContentCardPlaceholderProps) {
  const meta = TIPO_META[tipo]
  const Icon = meta.icon

  return (
    <article
      className={cn(
        'content-card-placeholder snap-start shrink-0',
        'flex w-[140px] cursor-default flex-col sm:w-[152px]',
      )}
      aria-hidden
    >
      <div
        className={cn(
          'relative aspect-[3/4] overflow-hidden rounded-xl border border-dashed border-primary/20',
          'bg-gradient-to-br shadow-[var(--shadow-soft)]',
          meta.tint,
        )}
      >
        <div className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-text-muted">
          Em breve
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.55),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/85 text-primary shadow-sm">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
      </div>
      <div className="mt-2.5 space-y-1 px-0.5">
        <div
          className="h-2.5 rounded-full bg-primary/12"
          style={{ width: `${68 + (index % 3) * 10}%` }}
        />
        <div
          className="h-2 rounded-full bg-border/80"
          style={{ width: `${42 + (index % 4) * 8}%` }}
        />
        <p className="pt-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
          {meta.label}
        </p>
      </div>
    </article>
  )
}
