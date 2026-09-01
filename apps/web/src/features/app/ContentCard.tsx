import { useNavigate } from '@tanstack/react-router'
import type { TipoConteudo } from '@tcc-sistema/types'
import { BookMarked, FileText, Music, Quote, Sparkles } from 'lucide-react'
import { ContentCardLeituraMenu } from '@/features/app/ContentCardLeituraMenu'
import { useLeiturasMap } from '@/features/app/useLeiturasMap'
import { useAuth } from '@/features/auth/AuthProvider'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { cn } from '@/lib/utils'

const TIPO_META: Record<
  TipoConteudo,
  { icon: typeof BookMarked; tint: string }
> = {
  livro: { icon: BookMarked, tint: 'from-primary-light/90 to-white' },
  cronica: { icon: FileText, tint: 'from-accent-light/80 to-white' },
  poema: { icon: Quote, tint: 'from-primary-light/70 to-accent-light/40' },
  musica: { icon: Music, tint: 'from-accent-light/90 to-primary-light/50' },
  frase: { icon: Quote, tint: 'from-primary-light/60 to-white' },
  outro: { icon: Sparkles, tint: 'from-surface to-white' },
}

interface ContentCardProps {
  conteudo: ConteudoCardData
  showTipo?: boolean
}

export function ContentCard({ conteudo, showTipo = false }: ContentCardProps) {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: leiturasMap } = useLeiturasMap(profile?.id)
  const meta = TIPO_META[conteudo.tipo]
  const Icon = meta.icon
  const showMenu = conteudo.tipo === 'livro' && Boolean(profile)
  const leituraStatus = leiturasMap?.[conteudo.id] ?? null

  const open = () => {
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: conteudo.id } })
  }

  return (
    <article
      role="listitem"
      className={cn(
        'group content-card card-lift snap-start shrink-0',
        'relative z-[2] flex w-[140px] flex-col sm:w-[152px]',
      )}
    >
      <button
        type="button"
        onClick={open}
        className={cn(
          'flex w-full flex-col rounded-xl text-left',
          'cursor-pointer border-0 bg-transparent p-0 text-inherit',
          'hover:ring-2 hover:ring-primary/25',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
        )}
        aria-label={`Abrir ${conteudo.titulo}`}
      >
        <div
          className={cn(
            'relative aspect-[3/4] overflow-hidden rounded-xl border border-primary/10',
            'bg-gradient-to-br shadow-[var(--shadow-soft)]',
            !conteudo.capa_url && meta.tint,
          )}
        >
          {conteudo.capa_url ? (
            <img
              src={conteudo.capa_url}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.55),transparent_55%)]" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/85 text-primary shadow-sm">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </div>
              </div>
            </>
          )}

          {leituraStatus === 'em_andamento' && (
            <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
              Lendo
            </span>
          )}
          {leituraStatus === 'concluido' && (
            <span className="absolute bottom-2 left-2 rounded-full bg-success px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
              Lido
            </span>
          )}
        </div>

        <div className="mt-2.5 space-y-0.5 px-0.5">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-text">{conteudo.titulo}</h3>
          {conteudo.autor && (
            <p className="line-clamp-1 text-xs text-text-muted">{conteudo.autor}</p>
          )}
          {showTipo && (
            <p className="pt-0.5 text-[10px] font-medium uppercase tracking-wide text-text-muted">
              {TIPO_CONTEUDO_LABEL[conteudo.tipo]}
            </p>
          )}
        </div>
      </button>

      {showMenu && (
        <ContentCardLeituraMenu
          conteudoId={conteudo.id}
          status={leituraStatus}
          variant="cover"
          className="absolute right-2 top-2 z-[5]"
        />
      )}
    </article>
  )
}
