import { Link } from '@tanstack/react-router'
import type { StatusLeitura } from '@tcc-sistema/types'
import {
  BookMarked,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { ContentCardLeituraMenu } from '@/features/app/ContentCardLeituraMenu'
import type { LeituraComConteudo, MinhasLeiturasAgrupadas } from '@/features/app/useMinhasLeituras'
import { useMinhasLeituras } from '@/features/app/useMinhasLeituras'
import { useAuth } from '@/features/auth/AuthProvider'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'

type SectionKey = keyof MinhasLeiturasAgrupadas

const SECTIONS: Array<{
  key: SectionKey
  title: string
  description: string
  icon: typeof BookOpen
  tone: 'blue' | 'neutral' | 'green'
  emptyTitle: string
  emptyHint: string
}> = [
  {
    key: 'em_andamento',
    title: 'Em andamento',
    description: 'Retome de onde parou.',
    icon: BookOpen,
    tone: 'blue',
    emptyTitle: 'Nada em andamento',
    emptyHint: 'Abra um livro e toque em “Iniciar leitura”.',
  },
  {
    key: 'na_lista',
    title: 'Lista de leitura',
    description: 'Salvos para ler depois.',
    icon: Bookmark,
    tone: 'neutral',
    emptyTitle: 'Lista vazia',
    emptyHint: 'Use “Salvar para depois” nos livros do catálogo.',
  },
  {
    key: 'concluido',
    title: 'Finalizadas',
    description: 'O que você já terminou.',
    icon: CheckCircle2,
    tone: 'green',
    emptyTitle: 'Nenhuma conclusão ainda',
    emptyHint: 'Marque um livro como lido quando terminar.',
  },
]

const STATUS_LABEL: Record<StatusLeitura, string> = {
  em_andamento: 'Em andamento',
  na_lista: 'Na lista',
  concluido: 'Concluída',
}

function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `${days} dias atrás`
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function MinhasLeiturasPage() {
  const { profile } = useAuth()
  const { data, isLoading } = useMinhasLeituras(profile?.id)

  const total =
    (data?.em_andamento.length ?? 0) +
    (data?.na_lista.length ?? 0) +
    (data?.concluido.length ?? 0)

  return (
    <div className="minhas-leituras-page">
      <section className="minhas-leituras-hero" aria-labelledby="minhas-leituras-title">
        <div className="minhas-leituras-hero-glow" aria-hidden />
        <div className="minhas-leituras-hero-inner">
          <header>
            <p className="minhas-leituras-kicker">Sua biblioteca</p>
            <h1 id="minhas-leituras-title" className="minhas-leituras-title">
              Minhas leituras
            </h1>
            <p className="minhas-leituras-subtitle">
              {total > 0
                ? `${total} ${total === 1 ? 'título' : 'títulos'} entre leituras ativas, lista e concluídas.`
                : 'Organize leituras ativas, sua lista e o que já terminou — tudo num só lugar.'}
            </p>
          </header>

          {!isLoading && data && (
            <div className="minhas-leituras-stats" role="list" aria-label="Resumo das leituras">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                const count = data[section.key].length
                return (
                  <div
                    key={section.key}
                    role="listitem"
                    className={cn('minhas-leituras-stat', `is-${section.tone}`)}
                  >
                    <span className="minhas-leituras-stat-icon" aria-hidden>
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="minhas-leituras-stat-value">{count}</span>
                    <span className="minhas-leituras-stat-label">{section.title}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <div className="minhas-leituras-body">
        {isLoading ? (
          <div className="minhas-leituras-loading">
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
            <span>Carregando sua biblioteca...</span>
          </div>
        ) : (
          <div className="minhas-leituras-sections">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              const items = data?.[section.key] ?? []

              return (
                <section
                  key={section.key}
                  className={cn('minhas-leituras-shelf', `is-${section.tone}`)}
                  aria-labelledby={`shelf-${section.key}`}
                >
                  <header className="minhas-leituras-shelf-head">
                    <div className="minhas-leituras-shelf-title-wrap">
                      <span className="minhas-leituras-shelf-icon" aria-hidden>
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div>
                        <h2 id={`shelf-${section.key}`} className="minhas-leituras-shelf-title">
                          {section.title}
                        </h2>
                        <p className="minhas-leituras-shelf-desc">{section.description}</p>
                      </div>
                    </div>
                    <span className="minhas-leituras-shelf-count">{items.length}</span>
                  </header>

                  {items.length === 0 ? (
                    <div className="minhas-leituras-empty">
                      <span className="minhas-leituras-empty-icon" aria-hidden>
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <p className="minhas-leituras-empty-title">{section.emptyTitle}</p>
                      <p className="minhas-leituras-empty-hint">{section.emptyHint}</p>
                    </div>
                  ) : (
                    <ul className="minhas-leituras-items" role="list">
                      {items.map((item) => (
                        <LeituraItemCard key={item.id} item={item} tone={section.tone} />
                      ))}
                    </ul>
                  )}
                </section>
              )
            })}
          </div>
        )}

        <p className="minhas-leituras-footer">
          Descubra mais na{' '}
          <Link to="/app" className="font-semibold text-primary hover:underline">
            página inicial
          </Link>
        </p>
      </div>
    </div>
  )
}

function LeituraItemCard({
  item,
  tone,
}: {
  item: LeituraComConteudo
  tone: 'blue' | 'neutral' | 'green'
}) {
  const { conteudo } = item
  const isActive = item.status_leitura === 'em_andamento'

  return (
    <li>
      <article className={cn('minhas-leituras-item', `is-${tone}`)}>
        <Link
          to="/app/conteudos/$conteudoId"
          params={{ conteudoId: conteudo.id }}
          className="minhas-leituras-item-main"
        >
          <div className="minhas-leituras-item-cover">
            {conteudo.capa_url ? (
              <img src={conteudo.capa_url} alt="" loading="lazy" decoding="async" />
            ) : (
              <div className="minhas-leituras-item-cover-fallback">
                <BookMarked className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </div>
            )}
            {isActive && <span className="minhas-leituras-item-spine" aria-hidden />}
          </div>

          <div className="minhas-leituras-item-copy">
            <p className="minhas-leituras-item-title">{conteudo.titulo}</p>
            {conteudo.autor && (
              <p className="minhas-leituras-item-author">{conteudo.autor}</p>
            )}
            <div className="minhas-leituras-item-meta">
              <span className={cn('minhas-leituras-item-badge', `is-${tone}`)}>
                {STATUS_LABEL[item.status_leitura]}
              </span>
              <span className="minhas-leituras-item-type">{TIPO_CONTEUDO_LABEL[conteudo.tipo]}</span>
              <span className="minhas-leituras-item-date">{formatRelativeDate(item.updated_at)}</span>
            </div>
            {isActive && (
              <span className="minhas-leituras-item-cta">
                Continuar lendo
                <Sparkles className="h-3 w-3 opacity-70" aria-hidden />
              </span>
            )}
          </div>
        </Link>

        <ContentCardLeituraMenu
          conteudoId={conteudo.id}
          status={item.status_leitura}
          variant="list"
          className="minhas-leituras-item-menu"
        />
      </article>
    </li>
  )
}
