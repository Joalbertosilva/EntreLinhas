import { Link, useNavigate } from '@tanstack/react-router'
import { AmbientCanvasField } from '@/components/layout/LoginAmbientBackground'
import { ChevronDown, ChevronRight, Loader2, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { useHomeContinueReading } from '@/features/app/useHomeContinueReading'
import { resolveConteudoCoverUrl } from '@/lib/conteudoCover'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface HomeLeiturasWidgetProps {
  userId: string | undefined
}

export function HomeLeiturasWidget({ userId }: HomeLeiturasWidgetProps) {
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)
  const { data: leituras = [], isLoading } = useHomeContinueReading(userId)

  useEffect(() => {
    if (!expanded) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      setExpanded(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [expanded])

  const countLabel =
    leituras.length === 1 ? '1 em andamento' : `${leituras.length} em andamento`

  return (
    <div
      ref={rootRef}
      className={cn('home-leituras-widget', expanded && 'home-leituras-widget--expanded')}
    >
      <AmbientCanvasField compact className="home-leituras-widget__ambient ambient-canvas-field" />

      <button
        type="button"
        className="home-leituras-widget__trigger"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((open) => !open)}
      >
        <span className="home-leituras-widget__trigger-text">
          <span className="home-leituras-widget__trigger-label">Minhas leituras</span>
          {!isLoading && leituras.length > 0 && (
            <span className="home-leituras-widget__trigger-meta">{countLabel}</span>
          )}
          {isLoading && (
            <span className="home-leituras-widget__trigger-meta">Carregando…</span>
          )}
          {!isLoading && leituras.length === 0 && (
            <span className="home-leituras-widget__trigger-meta">Retome de onde parou</span>
          )}
        </span>
        {expanded ? (
          <X className="home-leituras-widget__chev" aria-hidden />
        ) : (
          <ChevronDown className="home-leituras-widget__chev" aria-hidden />
        )}
      </button>

      <div
        id={panelId}
        className={cn('home-leituras-widget__panel', expanded && 'home-leituras-widget__panel--open')}
        aria-hidden={!expanded}
      >
        <div className="home-leituras-widget__panel-head">
          <p className="home-leituras-widget__panel-title">Em andamento</p>
        </div>

        {isLoading ? (
          <p className="home-leituras-widget__loading">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Buscando leituras…
          </p>
        ) : leituras.length === 0 ? (
          <p className="home-leituras-widget__empty">
            Nenhuma leitura em andamento. Explore o catálogo e comece uma obra.
          </p>
        ) : (
          <ul className="home-leituras-widget__list" role="list">
            {leituras.map((item) => (
              <LeituraWidgetItem key={item.id} conteudo={item} onOpen={() => setExpanded(false)} />
            ))}
          </ul>
        )}

        <Link to="/app/minhas-leituras" className="home-leituras-widget__footer-link">
          Ir para Minhas leituras
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

function LeituraWidgetItem({
  conteudo,
  onOpen,
}: {
  conteudo: ConteudoCardData
  onOpen: () => void
}) {
  const navigate = useNavigate()
  const coverUrl = resolveConteudoCoverUrl(conteudo)

  const open = () => {
    onOpen()
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: conteudo.id } })
  }

  return (
    <li>
      <button type="button" className="home-leituras-widget__item" onClick={open}>
        <div className="home-leituras-widget__item-cover">
          {coverUrl ? (
            <img src={coverUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <span className="home-leituras-widget__item-cover-fallback" aria-hidden />
          )}
        </div>
        <span className="home-leituras-widget__item-body">
          <span className="home-leituras-widget__item-tipo">{TIPO_CONTEUDO_LABEL[conteudo.tipo]}</span>
          <span className="home-leituras-widget__item-titulo">{conteudo.titulo}</span>
          {conteudo.autor && (
            <span className="home-leituras-widget__item-autor">{conteudo.autor}</span>
          )}
        </span>
        <ChevronRight className="home-leituras-widget__item-chev" aria-hidden />
      </button>
    </li>
  )
}
