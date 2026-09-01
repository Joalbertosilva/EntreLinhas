import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Layers,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Conteudo, StatusLeitura, TipoConteudo } from '@tcc-sistema/types'
import { BookMarked, FileText, Music, Quote, Sparkles } from 'lucide-react'
import { LivroDetailPage } from '@/features/app/LivroDetailPage'
import { ConteudoCurtidasPanel } from '@/features/app/ConteudoCurtidasPanel'
import { ConteudoPageNav, type ConteudoPageSection } from '@/features/app/ConteudoPageNav'
import { ScrollContinueHint } from '@/features/app/ScrollContinueHint'
import {
  ConteudoComentariosSection,
  ConteudoReflexoesSection,
} from '@/features/app/ConteudoInteracoesSections'
import { getAppRouteForTipo } from '@/features/app/appNavigation'
import { ScrollReveal } from '@/features/app/ScrollReveal'
import { scrollToConteudoTexto } from '@/features/app/useConteudoEngagement'
import {
  useAtualizarLeitura,
  useConteudoDetail,
  useConteudoMateriais,
  useConteudoTemas,
  useMinhaLeitura,
} from '@/features/app/useConteudoDetail'
import { useAuth } from '@/features/auth/AuthProvider'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { TIPO_CONTEUDO_LABEL, TIPO_MATERIAL_LABEL } from '@/lib/labels'
import { STATUS_LEITURA_LABEL } from '@/lib/leituraLabels'
import { cn } from '@/lib/utils'

const TIPO_META: Record<TipoConteudo, { icon: typeof BookMarked; tint: string }> = {
  livro: { icon: BookMarked, tint: 'from-primary-light/90 to-white' },
  cronica: { icon: FileText, tint: 'from-accent-light/80 to-white' },
  poema: { icon: Quote, tint: 'from-primary-light/70 to-accent-light/40' },
  musica: { icon: Music, tint: 'from-accent-light/90 to-primary-light/50' },
  frase: { icon: Quote, tint: 'from-primary-light/60 to-white' },
  outro: { icon: Sparkles, tint: 'from-surface to-white' },
}

interface AppConteudoDetailPageProps {
  conteudoId: string
}

export function AppConteudoDetailPage({ conteudoId }: AppConteudoDetailPageProps) {
  const { profile } = useAuth()
  const usuarioId = profile?.id

  const { data: conteudo, isLoading, error } = useConteudoDetail(conteudoId)
  const { data: temas = [], isLoading: loadingTemas } = useConteudoTemas(conteudoId)
  const { data: materiais, isLoading: loadingMateriais } = useConteudoMateriais(conteudoId)
  const { data: leitura, isLoading: loadingLeitura } = useMinhaLeitura(conteudoId, usuarioId)
  const atualizarLeitura = useAtualizarLeitura(conteudoId, usuarioId)

  const handleLeitura = async (status: StatusLeitura, irParaTexto = false) => {
    try {
      await atualizarLeitura.mutateAsync(status)
      const messages: Record<StatusLeitura, string> = {
        em_andamento: 'Leitura iniciada',
        na_lista: 'Adicionado à sua lista de leitura',
        concluido: 'Leitura marcada como concluída',
      }
      toast.success(messages[status])
      if (irParaTexto || status === 'em_andamento') {
        setTimeout(scrollToConteudoTexto, 150)
      }
    } catch {
      toast.error('Não foi possível atualizar sua leitura')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !conteudo) {
    return (
      <div className="py-16 text-center">
        <p className="font-semibold text-text">Conteúdo não encontrado</p>
        <p className="mt-2 text-sm text-text-muted">
          Este material pode ter sido removido ou não está disponível.
        </p>
        <Link to="/app" className="mt-6 inline-block">
          <Button variant="outline">Voltar ao início</Button>
        </Link>
      </div>
    )
  }

  const backRoute = getAppRouteForTipo(conteudo.tipo)
  const conteudoComCurtidas = { ...conteudo, curtidas_count: conteudo.curtidas_count ?? 0 }

  const hasTextoOuResumo = Boolean(
    conteudo.conteudo_textual?.trim() ||
      conteudo.resumo?.trim() ||
      conteudo.personagens?.trim() ||
      conteudo.contexto?.trim() ||
      conteudo.pontos_importantes?.trim() ||
      conteudo.curiosidades?.trim(),
  )
  const hasTemasReflexao = !loadingTemas && temas.some((t) => t.questionamento?.trim())
  const hasMateriais = !loadingMateriais && (materiais?.length ?? 0) > 0

  const pageSections: ConteudoPageSection[] = [
    ...(hasTextoOuResumo
      ? [{ id: 'conteudo-texto', label: 'Texto e informações', hint: 'Resumo, contexto e leitura' }]
      : []),
    ...(hasTemasReflexao
      ? [{ id: 'secao-reflexao', label: 'Sua reflexão', hint: 'Resposta privada — só você e a equipe' }]
      : []),
    { id: 'secao-comentarios', label: 'Comentários', hint: 'Visível para todos os alunos' },
    ...(hasMateriais
      ? [{ id: 'secao-materiais', label: 'Materiais complementares', hint: 'Vídeos, áudios e links' }]
      : []),
  ]

  const isLivro = conteudo.tipo === 'livro'

  if (isLivro) {
    return (
      <LivroDetailPage
        conteudo={conteudoComCurtidas}
        conteudoId={conteudoId}
        usuarioId={usuarioId}
        backRoute={backRoute}
        temas={temas}
        loadingTemas={loadingTemas}
        materiais={materiais}
        loadingMateriais={loadingMateriais}
        leituraStatus={leitura?.status_leitura}
        loadingLeitura={loadingLeitura}
        leituraPending={atualizarLeitura.isPending}
        onLeitura={handleLeitura}
      />
    )
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <ScrollReveal>
        <Link
          to={backRoute}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Voltar
        </Link>
      </ScrollReveal>

      <ScrollReveal delayMs={40}>
        <ConteudoHero conteudo={conteudo} />
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        <LeituraPanel
          status={leitura?.status_leitura ?? null}
          isLoading={loadingLeitura}
          isPending={atualizarLeitura.isPending}
          temTexto={Boolean(conteudo.conteudo_textual?.trim() || conteudo.resumo?.trim())}
          onUpdate={handleLeitura}
          onIrParaTexto={scrollToConteudoTexto}
        />
      </ScrollReveal>

      <ScrollReveal delayMs={90}>
        <ConteudoPageNav sections={pageSections} />
        <ScrollContinueHint className="mt-3" />
      </ScrollReveal>

      <ScrollReveal delayMs={100}>
        <ConteudoCurtidasPanel conteudo={conteudoComCurtidas} usuarioId={usuarioId} />
      </ScrollReveal>

      <ScrollReveal delayMs={120}>
        <ConteudoInfo conteudo={conteudo} />
      </ScrollReveal>

      <ScrollReveal delayMs={160}>
        <ConteudoReflexoesSection
          conteudoId={conteudoId}
          usuarioId={usuarioId}
          temas={loadingTemas ? [] : temas}
        />
      </ScrollReveal>

      <ScrollReveal delayMs={200}>
        <ConteudoComentariosSection conteudoId={conteudoId} usuarioId={usuarioId} />
      </ScrollReveal>

      {!loadingTemas && temas.length > 0 && (
        <ScrollReveal delayMs={240}>
          <TemasInfoSection temas={temas} />
        </ScrollReveal>
      )}

      {(loadingMateriais || (materiais && materiais.length > 0)) && (
        <ScrollReveal delayMs={280}>
          <MateriaisSection materiais={materiais ?? []} isLoading={loadingMateriais} />
        </ScrollReveal>
      )}
    </div>
  )
}

function ConteudoHero({ conteudo }: { conteudo: Conteudo }) {
  const meta = TIPO_META[conteudo.tipo]
  const Icon = meta.icon

  return (
    <Card className="border-primary/10 bg-white/85 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="mx-auto shrink-0 sm:mx-0">
            {conteudo.capa_url ? (
              <img
                src={conteudo.capa_url}
                alt=""
                className="aspect-[3/4] w-[140px] rounded-xl border border-primary/10 object-cover shadow-[var(--shadow-soft)] sm:w-[168px]"
              />
            ) : (
              <div
                className={cn(
                  'flex aspect-[3/4] w-[140px] items-end rounded-xl border border-primary/10 bg-gradient-to-br p-4 shadow-[var(--shadow-soft)] sm:w-[168px]',
                  meta.tint,
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/90 text-primary shadow-sm">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <Badge variant="accent">{TIPO_CONTEUDO_LABEL[conteudo.tipo]}</Badge>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
              {conteudo.titulo}
            </h1>
            {conteudo.autor && (
              <p className="mt-1 text-text-muted">por {conteudo.autor}</p>
            )}
            {conteudo.descricao && (
              <p className="mt-4 text-sm leading-relaxed text-text-muted sm:text-[15px]">
                {conteudo.descricao}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LeituraPanel({
  status,
  isLoading,
  isPending,
  temTexto,
  onUpdate,
  onIrParaTexto,
}: {
  status: StatusLeitura | null
  isLoading: boolean
  isPending: boolean
  temTexto: boolean
  onUpdate: (status: StatusLeitura, irParaTexto?: boolean) => void
  onIrParaTexto: () => void
}) {
  return (
    <Card className="border-primary/10 bg-white/82 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
            <BookOpen className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <p className="font-semibold text-text">Sua leitura</p>
            {isLoading ? (
              <p className="mt-0.5 text-sm text-text-muted">Carregando...</p>
            ) : status ? (
              <p className="mt-0.5 text-sm text-text-muted">
                Status:{' '}
                <span className="font-medium text-text">{STATUS_LEITURA_LABEL[status]}</span>
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-text-muted">
                Inicie a leitura para ir ao texto e acompanhar seu progresso.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isPending && (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Salvando...
            </Button>
          )}
          {!isPending && !isLoading && status === 'concluido' && (
            <>
              <Badge variant="success" className="self-center px-3 py-1">
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
                Concluída
              </Badge>
              {temTexto && (
                <Button variant="outline" size="sm" onClick={onIrParaTexto}>
                  Ler novamente
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => onUpdate('em_andamento')}>
                Continuar lendo
              </Button>
            </>
          )}
          {!isPending && !isLoading && status === 'em_andamento' && (
            <>
              <Badge variant="accent" className="self-center px-3 py-1 text-primary">
                Em andamento
              </Badge>
              {temTexto && (
                <Button variant="outline" size="sm" onClick={onIrParaTexto}>
                  Ir para o texto
                </Button>
              )}
              <Button size="sm" onClick={() => onUpdate('concluido')}>
                Marcar como concluída
              </Button>
            </>
          )}
          {!isPending && !isLoading && status === 'na_lista' && (
            <>
              <Badge variant="outline" className="self-center px-3 py-1">
                Na lista
              </Badge>
              <Button size="sm" onClick={() => onUpdate('em_andamento', true)}>
                Iniciar leitura
              </Button>
            </>
          )}
          {!isPending && !isLoading && !status && (
            <>
              <Button size="sm" onClick={() => onUpdate('em_andamento', true)}>
                Iniciar leitura
              </Button>
              <Button variant="outline" size="sm" onClick={() => onUpdate('na_lista')}>
                Salvar para depois
              </Button>
              <Button variant="secondary" size="sm" onClick={() => onUpdate('concluido')}>
                Já li
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ConteudoInfo({ conteudo }: { conteudo: Conteudo }) {
  const sections = [
    { label: 'Resumo', value: conteudo.resumo },
    { label: 'Personagens', value: conteudo.personagens },
    { label: 'Contexto', value: conteudo.contexto },
    { label: 'Pontos importantes', value: conteudo.pontos_importantes },
    { label: 'Curiosidades', value: conteudo.curiosidades },
  ].filter((s) => s.value?.trim())

  const hasTexto = Boolean(conteudo.conteudo_textual?.trim())
  const hasSections = sections.length > 0

  if (!hasSections && !hasTexto) return null

  return (
    <div id="conteudo-texto" className="scroll-mt-24 space-y-4">
      {sections.map((section, index) => (
        <details
          key={section.label}
          open={index === 0}
          className="group rounded-2xl border border-primary/10 bg-white/80 backdrop-blur-sm open:shadow-[var(--shadow-soft)]"
        >
          <summary className="cursor-pointer list-none rounded-2xl px-5 py-4 font-semibold text-brand-navy marker:content-none sm:px-6 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              {section.label}
              <span className="text-xs font-medium text-text-muted group-open:hidden">Toque para expandir</span>
              <span className="hidden text-xs font-medium text-text-muted group-open:inline">Toque para recolher</span>
            </span>
          </summary>
          <div className="border-t border-border/50 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted sm:text-[15px]">
              {section.value}
            </p>
          </div>
        </details>
      ))}

      {hasTexto && (
        <Card className="border-primary/10 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-brand-navy">Texto da leitura</h2>
            <div className="prose-content mt-4 whitespace-pre-wrap text-sm leading-relaxed text-text sm:text-[15px]">
              {conteudo.conteudo_textual}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function TemasInfoSection({
  temas,
}: {
  temas: Array<{ id: string; tema: string; descricao: string | null }>
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-light text-brand-navy">
          <Lightbulb className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand-navy">Temas abordados</h2>
          <p className="text-sm text-text-muted">Contexto preparado pela equipe</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {temas.map((tema) => (
          <Card key={tema.id} className="border-primary/10 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-5">
              <h3 className="font-semibold text-text">{tema.tema}</h3>
              {tema.descricao && (
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{tema.descricao}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function MateriaisSection({
  materiais,
  isLoading,
}: {
  materiais: Array<{ id: string; titulo: string; tipo: keyof typeof TIPO_MATERIAL_LABEL; link: string; descricao: string | null }>
  isLoading: boolean
}) {
  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />

  return (
    <section id="secao-materiais" className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Layers className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-brand-navy">Materiais complementares</h2>
          <p className="text-sm text-text-muted">Vídeos, áudios e links externos</p>
        </div>
      </div>

      <div className="space-y-3">
        {materiais.map((material) => (
          <Card key={material.id} className="border-primary/10 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-5">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
