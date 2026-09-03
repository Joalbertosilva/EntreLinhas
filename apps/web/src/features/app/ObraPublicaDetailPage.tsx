import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpen,
  Heart,
  Loader2,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BookPaginatedReader } from '@/features/app/BookPaginatedReader'
import { BookReadingShell } from '@/features/app/BookReadingShell'
import { ScrollReveal } from '@/features/app/ScrollReveal'
import { buildObraBookPages, getObraPageStorageKey } from '@/features/app/bookPagination'
import type { ObraPublica } from '@/features/app/useMinhaObra'
import {
  useMinhaObraCurtida,
  useObraComentarios,
  usePublicarObraComentario,
  useToggleObraCurtida,
} from '@/features/app/useObraEngagement'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import { cn } from '@/lib/utils'

interface ObraPublicaDetailPageProps {
  obra: ObraPublica
  usuarioId: string | undefined
}

export function ObraPublicaDetailPage({ obra, usuarioId }: ObraPublicaDetailPageProps) {
  const pages = buildObraBookPages(obra.capitulos)
  const isLivro = obra.tipo === 'livro'

  const journeySteps = [
    ...(pages.length > 0 ? [{ id: 'conteudo-texto', label: 'Ler' }] : []),
    { id: 'secao-comentarios', label: 'Comentar' },
  ]

  return (
    <BookReadingShell>
      <div className="book-page-inner space-y-10 lg:space-y-14">
        <Link
          to="/app"
          className="book-back-link inline-flex items-center gap-2 text-sm font-medium text-primary/90 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Link>

        <ObraHero obra={obra} usuarioId={usuarioId} />

        {journeySteps.length > 1 && (
          <ScrollReveal>
            <ObraJourneyNav steps={journeySteps} />
          </ScrollReveal>
        )}

        {pages.length > 0 && (
          <ScrollReveal delayMs={80}>
            <div id="conteudo-texto" className="scroll-mt-24 space-y-6">
              <div className="book-info-card">
                <div className="book-info-card-summary cursor-default">
                  <div className="book-info-card-spine" aria-hidden />
                  <div className="book-info-card-cover">
                    {obra.capa_url ? (
                      <img src={obra.capa_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-primary/50" strokeWidth={1.5} aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-brand-navy">
                      {isLivro ? 'Leitura do livro' : TIPO_OBRA_LABEL[obra.tipo]}
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      {pages.length} {pages.length === 1 ? 'página' : 'páginas'} · use as setas ou botões para
                      continuar
                    </p>
                  </div>
                </div>
              </div>

              <div className="book-chapter-ornament text-center" aria-hidden>
                ✦
              </div>

              <BookPaginatedReader
                pages={pages}
                conteudoId={obra.id}
                titulo={obra.titulo}
                storageKey={getObraPageStorageKey(obra.id)}
              />
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delayMs={120}>
          <div className="book-section-divider" role="presentation">
            <span className="book-section-divider-line" aria-hidden />
            <span className="book-section-divider-label">Comentários</span>
            <span className="book-section-divider-line" aria-hidden />
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={140}>
          <ObraComentariosSection obraId={obra.id} usuarioId={usuarioId} />
        </ScrollReveal>
      </div>
    </BookReadingShell>
  )
}

function ObraHero({
  obra,
  usuarioId,
}: {
  obra: ObraPublica
  usuarioId: string | undefined
}) {
  const { data: minhaCurtida, isLoading: loadingCurtida } = useMinhaObraCurtida(obra.id, usuarioId)
  const toggle = useToggleObraCurtida(obra.id, usuarioId)
  const curtido = Boolean(minhaCurtida)
  const curtidas = obra.curtidas_count ?? 0

  const handleCurtir = async () => {
    try {
      await toggle.mutateAsync(curtido)
      toast.success(curtido ? 'Curtida removida' : 'Você curtiu esta obra')
    } catch {
      toast.error('Não foi possível registrar sua curtida')
    }
  }

  return (
    <header className="book-hero book-hero-enter relative overflow-hidden rounded-2xl">
      <div className="book-hero-glow" aria-hidden />
      <div className="book-hero-sparkles" aria-hidden />

      <div className="relative z-10 flex flex-col items-center gap-8 px-2 py-2 sm:px-4 lg:flex-row lg:items-end lg:gap-12 lg:pb-2">
        <div className="book-cover-float shrink-0">
          {obra.capa_url ? (
            <img
              src={obra.capa_url}
              alt=""
              className="book-cover-image aspect-[3/4] w-[160px] object-cover sm:w-[190px] lg:w-[210px]"
            />
          ) : (
            <div className="book-cover-image flex aspect-[3/4] w-[160px] items-end bg-gradient-to-br from-primary-light to-accent-light/40 p-5 sm:w-[190px] lg:w-[210px]">
              <BookOpen className="h-8 w-8 text-primary/70" strokeWidth={1.5} aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 text-center lg:pb-2 lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <Badge variant="accent">{TIPO_OBRA_LABEL[obra.tipo]}</Badge>
            {obra.categoria && obra.categoria !== 'outro' && (
              <Badge variant="primary">{CATEGORIA_OBRA_LABEL[obra.categoria]}</Badge>
            )}
          </div>
          <p className="book-hero-kicker mt-3 flex items-center justify-center gap-1.5 lg:justify-start">
            <Sparkles className="h-3.5 w-3.5 text-accent-hover" aria-hidden />
            Obra de um colega
          </p>
          <h1 className="book-hero-title mt-2">{obra.titulo}</h1>
          {obra.autor && <p className="book-hero-author mt-2">por {obra.autor.nome}</p>}
          {obra.descricao && <p className="book-hero-desc mt-4 max-w-xl">{obra.descricao}</p>}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {pagesLink(obra)}
            <button
              type="button"
              onClick={() => void handleCurtir()}
              disabled={!usuarioId || loadingCurtida || toggle.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                curtido
                  ? 'border-primary/30 bg-primary-light text-primary'
                  : 'border-border bg-elevated text-text-muted hover:border-primary/25 hover:text-primary',
              )}
              aria-pressed={curtido}
            >
              <Heart className={cn('h-4 w-4', curtido && 'fill-current')} aria-hidden />
              {curtidas > 0 ? `${curtidas} curtida${curtidas === 1 ? '' : 's'}` : 'Curtir'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

function pagesLink(_obra: ObraPublica) {
  return (
    <a
      href="#conteudo-texto"
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
    >
      <BookOpen className="h-4 w-4" aria-hidden />
      Começar leitura
    </a>
  )
}

function ObraJourneyNav({ steps }: { steps: Array<{ id: string; label: string }> }) {
  return (
    <nav className="book-journey-nav flex flex-wrap justify-center gap-2" aria-label="Jornada de leitura">
      {steps.map((step) => (
        <a
          key={step.id}
          href={`#${step.id}`}
          className="book-journey-pill inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium"
        >
          {step.label === 'Comentar' ? (
            <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
          )}
          {step.label}
        </a>
      ))}
    </nav>
  )
}

function ObraComentariosSection({
  obraId,
  usuarioId,
}: {
  obraId: string
  usuarioId: string | undefined
}) {
  const { data: comentarios = [], isLoading } = useObraComentarios(obraId)
  const publicar = usePublicarObraComentario(obraId, usuarioId)
  const [texto, setTexto] = useState('')

  const handleSubmit = async () => {
    if (!texto.trim()) {
      toast.error('Escreva um comentário antes de publicar')
      return
    }
    try {
      await publicar.mutateAsync(texto)
      setTexto('')
      toast.success('Comentário publicado')
    } catch {
      toast.error('Não foi possível publicar o comentário')
    }
  }

  return (
    <section id="secao-comentarios" className="scroll-mt-24 space-y-5">
      <div className="flex items-start gap-3 book-interaction-header">
        <div className="book-interaction-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-light text-brand-navy">
          <MessageCircle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 className="book-interaction-title text-lg font-semibold text-brand-navy">Comentários</h2>
          <p className="text-sm text-text-muted">Compartilhe o que achou da obra — todos podem ler.</p>
        </div>
      </div>

      {usuarioId && (
        <div className="book-interaction-panel space-y-3">
          <Textarea
            rows={3}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva seu comentário..."
            className="min-h-[88px] resize-y bg-elevated"
          />
          <Button size="sm" onClick={() => void handleSubmit()} disabled={publicar.isPending}>
            {publicar.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Publicando...
              </>
            ) : (
              'Publicar'
            )}
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Carregando comentários...
        </p>
      ) : comentarios.length === 0 ? (
        <p className="text-sm text-text-muted">Seja o primeiro a comentar esta obra.</p>
      ) : (
        <ul className="space-y-3" role="list">
          {comentarios.map((c) => (
            <li key={c.id} className="book-comment-bubble">
              <div className="flex items-start gap-3">
                <Avatar name={c.profiles?.nome ?? '?'} className="h-8 w-8 shrink-0 text-[10px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-sm font-semibold text-text">{c.profiles?.nome ?? 'Aluno'}</p>
                    <time className="text-xs text-text-muted" dateTime={c.created_at}>
                      {formatRelativeTime(c.created_at)}
                    </time>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-text">{c.texto}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
