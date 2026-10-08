import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Heart,
  Layers,
  Loader2,
  Lock,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Conteudo, MaterialComplementar, StatusLeitura, Tema, TipoConteudo } from '@tcc-sistema/types'
import { BookPaginatedReader } from '@/features/app/BookPaginatedReader'
import { buildBookPages } from '@/features/app/bookPagination'
import { BookReadingShell } from '@/features/app/BookReadingShell'
import {
  ConteudoComentariosSection,
  ConteudoReflexoesSection,
} from '@/features/app/ConteudoInteracoesSections'
import { ScrollReveal } from '@/features/app/ScrollReveal'
import { scrollToConteudoTexto, useMinhaCurtida, useToggleCurtida } from '@/features/app/useConteudoEngagement'
import { YouTubeEmbed } from '@/components/media/YouTubeEmbed'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { TIPO_CONTEUDO_LABEL, TIPO_MATERIAL_LABEL } from '@/lib/labels'
import { isYouTubeUrl } from '@/lib/youtube'
import { STATUS_LEITURA_LABEL } from '@/lib/leituraLabels'
import { Speakable } from '@/features/accessibility/Speakable'
import { cn } from '@/lib/utils'

const STATUS_LABEL = STATUS_LEITURA_LABEL

interface LivroDetailPageProps {
  conteudo: Conteudo
  conteudoId: string
  usuarioId: string | undefined
  backRoute: string
  temas: Tema[]
  loadingTemas: boolean
  materiais: MaterialComplementar[] | undefined
  loadingMateriais: boolean
  leituraStatus: StatusLeitura | null | undefined
  loadingLeitura: boolean
  leituraPending: boolean
  onLeitura: (status: StatusLeitura, irParaTexto?: boolean) => void
}

export function LivroDetailPage({
  conteudo,
  conteudoId,
  usuarioId,
  backRoute,
  temas,
  loadingTemas,
  materiais,
  loadingMateriais,
  leituraStatus,
  loadingLeitura,
  leituraPending,
  onLeitura,
}: LivroDetailPageProps) {
  const metaSections = [
    { label: 'Resumo', value: conteudo.resumo },
    { label: 'Personagens', value: conteudo.personagens },
    { label: 'Contexto', value: conteudo.contexto },
    { label: 'Pontos importantes', value: conteudo.pontos_importantes },
    { label: 'Curiosidades', value: conteudo.curiosidades },
  ].filter((s) => s.value?.trim())

  const hasTexto = Boolean(conteudo.conteudo_textual?.trim())
  const hasTemasReflexao = !loadingTemas && temas.some((t) => t.questionamento?.trim())
  const hasMateriais = !loadingMateriais && (materiais?.length ?? 0) > 0

  const journeySteps = [
    ...(hasTexto || metaSections.length > 0
      ? [{ id: 'conteudo-texto', label: 'Ler', icon: BookOpen }]
      : []),
    ...(hasTemasReflexao ? [{ id: 'secao-reflexao', label: 'Refletir', icon: Lock }] : []),
    { id: 'secao-comentarios', label: 'Comentar', icon: MessageCircle },
  ]

  return (
    <BookReadingShell>
      <div className="book-page-inner space-y-10 lg:space-y-14">
        <Link
          to={backRoute}
          className="book-back-link inline-flex items-center gap-2 text-sm font-medium text-primary/90 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Link>

        <BookHero
          conteudo={conteudo}
          conteudoId={conteudoId}
          usuarioId={usuarioId}
          status={leituraStatus ?? null}
          isLoading={loadingLeitura}
          isPending={leituraPending}
          temTexto={hasTexto || Boolean(conteudo.resumo?.trim())}
          onLeitura={onLeitura}
        />

        {conteudo.tipo === 'musica' && conteudo.video_url && isYouTubeUrl(conteudo.video_url) && (
          <ScrollReveal delayMs={40}>
            <section aria-label="Player de música" className="mx-auto max-w-3xl">
              <YouTubeEmbed
                url={conteudo.video_url}
                title={conteudo.titulo}
                allowSizeToggle
                defaultSize="compact"
              />
            </section>
          </ScrollReveal>
        )}

        {journeySteps.length > 1 && (
          <ScrollReveal>
            <BookJourneyNav steps={journeySteps} />
          </ScrollReveal>
        )}

        {(hasTexto || metaSections.length > 0) && (
          <ScrollReveal delayMs={80}>
            <BookReadingBlock conteudo={conteudo} conteudoId={conteudoId} metaSections={metaSections} />
          </ScrollReveal>
        )}

        <ScrollReveal delayMs={120}>
          <BookSectionDivider label="Depois da leitura" />
        </ScrollReveal>

        <ScrollReveal delayMs={140}>
          <ConteudoReflexoesSection
            conteudoId={conteudoId}
            usuarioId={usuarioId}
            temas={loadingTemas ? [] : temas}
            variant="book"
          />
        </ScrollReveal>

        <ScrollReveal delayMs={180}>
          <ConteudoComentariosSection
            conteudoId={conteudoId}
            usuarioId={usuarioId}
            variant="book"
          />
        </ScrollReveal>

        {hasMateriais && (
          <ScrollReveal delayMs={220}>
            <BookMateriaisSection materiais={materiais ?? []} />
          </ScrollReveal>
        )}
      </div>
    </BookReadingShell>
  )
}

function BookHero({
  conteudo,
  conteudoId,
  usuarioId,
  status,
  isLoading,
  isPending,
  temTexto,
  onLeitura,
}: {
  conteudo: Conteudo
  conteudoId: string
  usuarioId: string | undefined
  status: StatusLeitura | null
  isLoading: boolean
  isPending: boolean
  temTexto: boolean
  onLeitura: (status: StatusLeitura, irParaTexto?: boolean) => void
}) {
  const { data: minhaCurtida, isLoading: loadingCurtida } = useMinhaCurtida(conteudoId, usuarioId)
  const toggle = useToggleCurtida(conteudoId, usuarioId)
  const curtido = Boolean(minhaCurtida)
  const curtidas = conteudo.curtidas_count ?? 0
  const coverUrl = resolveConteudoCoverUrl(conteudo)
  const tipoLabel = TIPO_CONTEUDO_LABEL[conteudo.tipo]
  const kicker =
    conteudo.tipo === 'musica'
      ? 'Ouça e leia a letra'
      : conteudo.tipo === 'poema'
        ? 'Seu poema'
        : conteudo.tipo === 'cronica'
          ? 'Sua crônica'
          : 'Sua próxima leitura'

  const handleCurtir = async () => {
    try {
      await toggle.mutateAsync(curtido)
      toast.success(curtido ? 'Curtida removida' : `Você curtiu este conteúdo`)
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
          {coverUrl ? (
            <img
              src={coverUrl}
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
          <Speakable
            label={[tipoLabel, conteudo.titulo, conteudo.autor ? `por ${conteudo.autor}` : '', conteudo.descricao ?? '']
              .filter(Boolean)
              .join('. ')}
          >
            <p className="book-hero-kicker flex items-center justify-center gap-1.5 lg:justify-start">
              <Sparkles className="h-3.5 w-3.5 text-accent-hover" aria-hidden />
              {kicker}
              <span className="sr-only"> — {tipoLabel}</span>
            </p>
            <h1 className="book-hero-title mt-2">{conteudo.titulo}</h1>
            {conteudo.autor && (
              <p className="book-hero-author mt-2">por {conteudo.autor}</p>
            )}
            {conteudo.descricao && (
              <p className="book-hero-desc mt-4 max-w-xl">{conteudo.descricao}</p>
            )}
          </Speakable>

          <div className="mt-6 flex flex-col items-center gap-4 lg:items-start">
            <BookLeituraActions
              tipo={conteudo.tipo}
              status={status}
              isLoading={isLoading}
              isPending={isPending}
              temTexto={temTexto}
              onLeitura={onLeitura}
            />

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button
                type="button"
                disabled={loadingCurtida || toggle.isPending}
                onClick={handleCurtir}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200',
                  curtido
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-primary/15 bg-white/60 text-text-muted hover:border-primary/25 hover:text-primary',
                )}
              >
                {toggle.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Heart className={cn('h-4 w-4', curtido && 'fill-current')} aria-hidden />
                )}
                {curtido ? 'Curtido' : 'Curtir'}
              </button>
              {curtidas > 0 && (
                <span className="text-xs text-text-muted">
                  {curtidas === 1 ? '1 leitor curtiu' : `${curtidas} leitores curtiram`}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function BookLeituraActions({
  tipo,
  status,
  isLoading,
  isPending,
  temTexto,
  onLeitura,
}: {
  tipo: TipoConteudo
  status: StatusLeitura | null
  isLoading: boolean
  isPending: boolean
  temTexto: boolean
  onLeitura: (status: StatusLeitura, irParaTexto?: boolean) => void
}) {
  const isMusica = tipo === 'musica'
  const iniciarLabel = isMusica ? 'Iniciar' : 'Iniciar leitura'
  const continuarLabel = isMusica ? 'Continuar' : 'Continuar lendo'
  if (isPending) {
    return (
      <Button size="lg" disabled className="book-cta-primary rounded-full px-8">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Salvando...
      </Button>
    )
  }

  if (isLoading) {
    return <p className="text-sm text-text-muted">Carregando seu progresso...</p>
  }

  if (status === 'concluido') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
        <Badge variant="success" className="rounded-full px-3 py-1">
          <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
          {STATUS_LABEL.concluido}
        </Badge>
        {temTexto && (
          <Button
            size="lg"
            className="book-cta-primary rounded-full px-8"
            onClick={() => {
              onLeitura('em_andamento')
              setTimeout(scrollToConteudoTexto, 150)
            }}
          >
            Ler novamente
          </Button>
        )}
      </div>
    )
  }

  if (status === 'em_andamento') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {STATUS_LABEL.em_andamento}
        </span>
        {temTexto && (
          <Button size="lg" className="book-cta-primary rounded-full px-8" onClick={scrollToConteudoTexto}>
            {continuarLabel}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          className="book-cta-secondary rounded-full px-6"
          onClick={() => onLeitura('concluido')}
        >
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Concluído
        </Button>
      </div>
    )
  }

  if (status === 'na_lista') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
        <Badge variant="accent" className="rounded-full px-3 py-1">
          {STATUS_LABEL.na_lista}
        </Badge>
        <Button size="lg" className="book-cta-primary rounded-full px-8" onClick={() => onLeitura('em_andamento', true)}>
          <BookOpen className="h-4 w-4" aria-hidden />
          {iniciarLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
      <Button size="lg" className="book-cta-primary rounded-full px-8" onClick={() => onLeitura('em_andamento', true)}>
        <BookOpen className="h-4 w-4" aria-hidden />
        {iniciarLabel}
      </Button>
      <Button variant="outline" size="lg" className="book-cta-secondary rounded-full px-6" onClick={() => onLeitura('na_lista')}>
        Salvar para depois
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="book-cta-secondary rounded-full px-6"
        onClick={() => onLeitura('concluido')}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden />
        Concluído
      </Button>
    </div>
  )
}

function BookJourneyNav({
  steps,
}: {
  steps: Array<{ id: string; label: string; icon: typeof BookOpen }>
}) {
  return (
    <nav aria-label="Etapas da leitura" className="book-journey-nav">
      <ul className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <li key={step.id}>
              <a href={`#${step.id}`} className="book-journey-pill group">
                <span className="book-journey-step" aria-hidden>
                  {index + 1}
                </span>
                <Icon className="h-4 w-4 opacity-70" strokeWidth={1.75} aria-hidden />
                {step.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function BookReadingBlock({
  conteudo,
  conteudoId,
  metaSections,
}: {
  conteudo: Conteudo
  conteudoId: string
  metaSections: Array<{ label: string; value: string | null | undefined }>
}) {
  const pages = buildBookPages(metaSections, conteudo.conteudo_textual)
  const pageCount = pages.length
  const coverUrl = resolveConteudoCoverUrl(conteudo)
  const readingLabel =
    conteudo.tipo === 'musica'
      ? 'Letra e leitura'
      : conteudo.tipo === 'poema'
        ? 'Leitura do poema'
        : conteudo.tipo === 'cronica'
          ? 'Leitura da crônica'
          : 'Leitura do livro'

  if (pageCount === 0) return null

  return (
    <div id="conteudo-texto" className="scroll-mt-24 space-y-6">
      <div className="book-info-card">
        <div className="book-info-card-summary cursor-default">
          <div className="book-info-card-spine" aria-hidden />
          <div className="book-info-card-cover">
            {coverUrl ? (
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <BookOpen className="h-6 w-6 text-primary/50" strokeWidth={1.5} aria-hidden />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-brand-navy">{readingLabel}</p>
            <p className="mt-0.5 text-xs text-text-muted">
              {pageCount} {pageCount === 1 ? 'página' : 'páginas'} · uma seção por folha · role
              dentro da página se precisar
            </p>
          </div>
        </div>
      </div>

      <div className="book-chapter-ornament text-center" aria-hidden>
        ✦
      </div>

      <BookPaginatedReader pages={pages} conteudoId={conteudoId} titulo={conteudo.titulo} />
    </div>
  )
}

function BookSectionDivider({ label }: { label: string }) {
  return (
    <div className="book-section-divider" role="presentation">
      <span className="book-section-divider-line" aria-hidden />
      <span className="book-section-divider-label">{label}</span>
      <span className="book-section-divider-line" aria-hidden />
    </div>
  )
}

function BookMateriaisSection({ materiais }: { materiais: MaterialComplementar[] }) {
  return (
    <details id="secao-materiais" className="book-meta-panel group scroll-mt-24">
      <summary className="book-meta-summary">
        <span className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" aria-hidden />
          Materiais complementares
        </span>
        <span className="text-xs font-normal text-text-muted group-open:hidden">
          {materiais.length} {materiais.length === 1 ? 'item' : 'itens'}
        </span>
      </summary>
      <div className="book-meta-body space-y-4">
        {materiais.map((material) => (
          <Speakable
            key={material.id}
            label={[
              `Material complementar. ${material.titulo}`,
              TIPO_MATERIAL_LABEL[material.tipo],
              material.descricao ?? '',
            ]
              .filter(Boolean)
              .join('. ')}
          >
            <div className="rounded-xl border border-primary/8 bg-white/50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-text">{material.titulo}</h3>
                <Badge variant="primary">{TIPO_MATERIAL_LABEL[material.tipo]}</Badge>
              </div>
              {material.descricao && (
                <p className="mt-2 text-sm text-text-muted">{material.descricao}</p>
              )}
              <a
                href={material.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Abrir material
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </Speakable>
        ))}
      </div>
    </details>
  )
}
