import type { CategoriaObra } from '@tcc-sistema/types'
import { getCategoryCoverMotifs, type CoverMotifColorKey } from '@tcc-sistema/cover-motifs'
import type { CoverPalette } from '@/lib/obraCategoriaLabels'

const BASE_WIDTH = 720

function motifColor(palette: CoverPalette, key: CoverMotifColorKey): string {
  return palette[key]
}

/** Paridade com `apps/mobile/.../ObraCoverDecorations.tsx`. */
export function ObraCoverDecorations({
  width,
  height,
  palette,
  categoria,
}: {
  width: number
  height: number
  palette: CoverPalette
  categoria: CategoriaObra
}) {
  const s = width / BASE_WIDTH
  const pad = 36 * s
  const corners = [
    [pad + 4, pad + 4],
    [width - pad - 4, pad + 4],
    [pad + 4, height - pad - 4],
    [width - pad - 4, height - pad - 4],
  ] as const

  const motifs = getCategoryCoverMotifs(categoria)

  return (
    <>
      <svg width={width} height={height} className="pointer-events-none absolute inset-0" aria-hidden>
        {corners.map(([cx, cy], i) => (
          <circle key={`c-${i}`} cx={cx} cy={cy} r={3 * s} fill={palette.frame} opacity={0.85} />
        ))}
      </svg>

      {motifs.map((motif, i) => {
        const vb = motif.viewBoxWidth ?? 24
        const size = motif.size * s
        const color = motifColor(palette, motif.colorKey)
        const left = motif.x * s - size / 2
        const top = motif.y * s - size / 2

        return (
          <svg
            key={`motif-${categoria}-${i}`}
            width={size}
            height={size}
            viewBox={`0 0 ${vb} ${vb}`}
            className="pointer-events-none absolute"
            style={{
              left,
              top,
              opacity: motif.opacity ?? 0.24,
              transform: `rotate(${motif.rotation ?? 0}deg)`,
            }}
            aria-hidden
          >
            <path
              d={motif.path}
              fill={motif.stroke ? 'none' : color}
              stroke={color}
              strokeWidth={motif.stroke ? (motif.strokeWidth ?? 2.1) : (motif.strokeWidth ?? 2.1) * 0.42}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      })}
    </>
  )
}
