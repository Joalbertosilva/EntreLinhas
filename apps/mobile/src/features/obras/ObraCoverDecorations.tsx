import type { CategoriaObra } from '@tcc-sistema/types'
import { getCategoryCoverMotifs, type CoverMotifColorKey } from '@tcc-sistema/cover-motifs'
import Svg, { Circle, Path } from 'react-native-svg'
import type { CoverPalette } from '@/lib/obraCategoriaLabels'

const BASE_WIDTH = 720

function motifColor(palette: CoverPalette, key: CoverMotifColorKey): string {
  return palette[key]
}

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
      <Svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
        {corners.map(([cx, cy], i) => (
          <Circle key={`c-${i}`} cx={cx} cy={cy} r={3 * s} fill={palette.frame} opacity={0.85} />
        ))}
      </Svg>

      {motifs.map((motif, i) => {
        const vb = motif.viewBoxWidth ?? 24
        const size = motif.size * s
        const color = motifColor(palette, motif.colorKey)
        const left = motif.x * s - size / 2
        const top = motif.y * s - size / 2

        return (
          <Svg
            key={`motif-${categoria}-${i}`}
            width={size}
            height={size}
            viewBox={`0 0 ${vb} ${vb}`}
            style={{
              position: 'absolute',
              left,
              top,
              opacity: motif.opacity ?? 0.24,
              transform: [{ rotate: `${motif.rotation ?? 0}deg` }],
            }}
          >
            <Path
              d={motif.path}
              fill={motif.stroke ? 'none' : color}
              stroke={color}
              strokeWidth={
                motif.stroke ? (motif.strokeWidth ?? 2.1) : (motif.strokeWidth ?? 2.1) * 0.42
              }
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )
      })}
    </>
  )
}
