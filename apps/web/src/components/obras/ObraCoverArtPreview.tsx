import type { CategoriaObra } from '@tcc-sistema/types'
import { COVER_ART_BASE_HEIGHT, COVER_ART_BASE_WIDTH } from '@tcc-sistema/cover-motifs'
import { useLayoutEffect, useRef, useState } from 'react'
import { ObraCoverArtView } from '@/components/obras/ObraCoverArtView'
import { cn } from '@/lib/utils'

/** Mesma resolução interna que o mobile usa nas thumbs nítidas (`ObraCoverThumbnail`). */
const RENDER_WIDTH = 360

export interface ObraCoverArtPreviewProps {
  categoria: CategoriaObra
  titulo: string
  photoSrc?: string | null
  className?: string
  /** Ignorado — app sempre exibe kicker; mantido por compat. */
  showKicker?: boolean
}

/**
 * Capa ao vivo na web = mesmo desenho do app, escalado para caber no container
 * (idêntico à estratégia `transform: scale` do mobile).
 */
export function ObraCoverArtPreview({
  categoria,
  titulo,
  photoSrc,
  className,
}: ObraCoverArtPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [hostWidth, setHostWidth] = useState(0)

  useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return

    const measure = () => setHostWidth(el.getBoundingClientRect().width)
    measure()

    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const renderHeight = RENDER_WIDTH * (COVER_ART_BASE_HEIGHT / COVER_ART_BASE_WIDTH)
  const scale = hostWidth > 0 ? hostWidth / RENDER_WIDTH : 0
  const hostHeight = hostWidth > 0 ? hostWidth * (COVER_ART_BASE_HEIGHT / COVER_ART_BASE_WIDTH) : undefined

  return (
    <div
      ref={hostRef}
      className={cn('obra-cover-scaled-host relative w-full overflow-hidden', className)}
      style={{
        aspectRatio: hostHeight ? undefined : `${COVER_ART_BASE_WIDTH} / ${COVER_ART_BASE_HEIGHT}`,
        height: hostHeight,
      }}
    >
      {scale > 0 ? (
        <div
          style={{
            width: RENDER_WIDTH,
            height: renderHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <ObraCoverArtView
            width={RENDER_WIDTH}
            categoria={categoria}
            titulo={titulo}
            photoUri={photoSrc}
          />
        </div>
      ) : null}
    </div>
  )
}
