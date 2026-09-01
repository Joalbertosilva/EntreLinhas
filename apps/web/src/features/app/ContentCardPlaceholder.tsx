import type { TipoConteudo } from '@tcc-sistema/types'
import type { AppSectionId } from '@/features/app/appNavigation'
import { SectionIcon } from '@/features/app/SectionIcon'
import { cn } from '@/lib/utils'

const TIPO_SECTION: Partial<Record<TipoConteudo, AppSectionId>> = {
  livro: 'livros',
  cronica: 'cronicas',
  musica: 'musicas',
  poema: 'poemas',
}

const TIPO_LABEL: Record<TipoConteudo, string> = {
  livro: 'Livro',
  cronica: 'Crônica',
  poema: 'Poema',
  musica: 'Música',
  frase: 'Frase',
  outro: 'Conteúdo',
}

interface ContentCardPlaceholderProps {
  tipo: TipoConteudo
  index: number
}

export function ContentCardPlaceholder({ tipo, index }: ContentCardPlaceholderProps) {
  const section = TIPO_SECTION[tipo]
  const label = TIPO_LABEL[tipo]

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
          'relative aspect-[3/4] overflow-hidden rounded-xl',
          'border-2 border-dashed border-primary/25',
          'bg-gradient-to-br from-primary-light/35 via-white to-accent-light/20',
          'shadow-[var(--shadow-soft)]',
        )}
      >
        <div className="absolute left-2 top-2 z-10 rounded-md border border-primary/12 bg-white/95 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-text-muted shadow-sm">
          Em breve
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 to-transparent p-3 pt-6">
          {section ? (
            <SectionIcon section={section} size="sm" className="shadow-sm opacity-90" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-primary/70 shadow-sm">
              <span className="text-xs font-bold">?</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2.5 space-y-1 px-0.5">
        <div
          className="h-2.5 rounded-full bg-primary/12"
          style={{ width: `${68 + (index % 3) * 10}%` }}
        />
        <div
          className="h-2 rounded-full bg-primary/6"
          style={{ width: `${42 + (index % 4) * 8}%` }}
        />
        <p className="pt-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
      </div>
    </article>
  )
}
