import type { CategoriaObra } from '@tcc-sistema/types'
import { getCategoryCoverMotifs, type CoverMotifColorKey } from '@tcc-sistema/cover-motifs'
import type { CoverPalette } from '@/lib/obraCategoriaLabels'

const BASE_WIDTH = 720
const BASE_HEIGHT = 1080

function motifColor(palette: CoverPalette, key: CoverMotifColorKey): string {
  return palette[key]
}

export function ObraCoverCategoryMotifs({
  categoria,
  palette,
  className,
}: {
  categoria: CategoriaObra
  palette: CoverPalette
  className?: string
}) {
  const motifs = getCategoryCoverMotifs(categoria)

  return (
    <svg
      className={className}
      viewBox={`0 0 ${BASE_WIDTH} ${BASE_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{
        filter: 'drop-shadow(0 1px 0 rgb(255 255 255 / 0.35)) drop-shadow(0 2px 6px rgb(0 0 0 / 0.14))',
      }}
    >
      {motifs.map((motif, i) => {
        const vb = motif.viewBoxWidth ?? 24
        const color = motifColor(palette, motif.colorKey)
        const strokeW = motif.strokeWidth ?? 2.1
        const transform = `translate(${motif.x} ${motif.y}) rotate(${motif.rotation ?? 0}) scale(${motif.size / vb}) translate(${-vb / 2} ${-vb / 2})`

        return (
          <g key={`motif-${categoria}-${i}`} opacity={motif.opacity ?? 0.68} transform={transform}>
            <path
              d={motif.path}
              fill={motif.stroke ? 'none' : color}
              stroke={color}
              strokeWidth={motif.stroke ? strokeW : strokeW * 0.42}
              strokeLinecap="round"
              strokeLinejoin="round"
              paintOrder={motif.stroke ? 'stroke fill' : 'fill stroke'}
            />
          </g>
        )
      })}
    </svg>
  )
}
