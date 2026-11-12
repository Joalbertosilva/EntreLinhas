import type { CategoriaObra } from '@tcc-sistema/types'
import {
  COVER_ART_BASE_HEIGHT,
  COVER_ART_BASE_WIDTH,
  COVER_FRAME,
  COVER_PHOTO_STYLE,
  coverTextOnGradient,
  coverTextOnLightPanel,
  scaledCoverLayout,
} from '@tcc-sistema/cover-motifs'
import { ImagePlus } from 'lucide-react'
import {
  CATEGORIA_COVER_PALETTE,
  CATEGORIA_OBRA_KICKER,
  CATEGORIA_OBRA_SUBTITLE,
} from '@/lib/obraCategoriaLabels'
import { ObraCoverDecorations } from '@/components/obras/ObraCoverDecorations'
import { cn } from '@/lib/utils'

const COVER_TITLE_FONT = 'Georgia, "Times New Roman", serif'
const COVER_UI_FONT = 'var(--font-sans)'

export interface ObraCoverArtViewProps {
  photoUri?: string | null
  categoria: CategoriaObra
  titulo: string
  width?: number
  className?: string
}

/**
 * Réplica web de `apps/mobile/src/features/obras/ObraCoverArtView.tsx`
 * (mesmo layout via `scaledCoverLayout`).
 */
export function ObraCoverArtView({
  photoUri,
  categoria,
  titulo,
  width = COVER_ART_BASE_WIDTH,
  className,
}: ObraCoverArtViewProps) {
  const palette = CATEGORIA_COVER_PALETTE[categoria]
  const kicker = CATEGORIA_OBRA_KICKER[categoria]
  const subtitle = CATEGORIA_OBRA_SUBTITLE[categoria]
  const textGradient = coverTextOnGradient(palette)
  const textPanel = coverTextOnLightPanel(palette)
  const layout = scaledCoverLayout(width)
  const { height, s, photo, framePad, frameInnerPad, panel, kicker: kick, blob } = layout

  const innerBorderPad = COVER_FRAME.inset * s

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ width, height, backgroundColor: palette.bottom }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(155deg, ${palette.top} 0%, ${palette.mid} 48%, ${palette.bottom} 100%)`,
        }}
      />

      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          left: blob.cx - blob.r,
          top: blob.cy - blob.r,
          width: blob.r * 2,
          height: blob.r * 2,
          backgroundColor: palette.accent,
          opacity: 0.18,
        }}
      />

      <div
        className="pointer-events-none absolute"
        style={{
          left: framePad,
          top: framePad,
          right: framePad,
          bottom: framePad,
          borderWidth: COVER_FRAME.outerBorder * s,
          borderStyle: 'solid',
          borderColor: palette.frame,
          borderRadius: 2 * s,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          left: frameInnerPad,
          top: frameInnerPad,
          right: frameInnerPad,
          bottom: frameInnerPad,
          borderWidth: COVER_FRAME.innerBorder * s,
          borderStyle: 'solid',
          borderColor: palette.accent,
          opacity: COVER_FRAME.innerOpacity,
          borderRadius: 2 * s,
        }}
      />

      <div
        className="absolute z-[2] overflow-hidden"
        style={{
          left: photo.x,
          top: photo.y,
          width: photo.width,
          height: photo.height,
          borderRadius: layout.photoRadius,
          borderWidth: layout.photoBorder,
          borderStyle: 'solid',
          borderColor: COVER_PHOTO_STYLE.borderColor,
          backgroundColor: palette.mid,
        }}
      >
        {photoUri?.trim() ? (
          <>
            <img src={photoUri.trim()} alt="" className="h-full w-full object-cover" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 45%, rgba(0,0,0,0.28) 100%)',
              }}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4">
            <ImagePlus color={textGradient} size={28 * s} strokeWidth={1.75} aria-hidden />
            <p
              style={{
                textAlign: 'center',
                fontSize: 11 * s,
                fontFamily: COVER_UI_FONT,
                fontWeight: 500,
                color: textGradient,
                opacity: 0.65,
              }}
            >
              Sua foto entra neste espaço
            </p>
          </div>
        )}
      </div>

      <ObraCoverDecorations width={width} height={height} palette={palette} categoria={categoria} />

      <div
        className="pointer-events-none absolute z-[4]"
        style={{
          left: panel.x,
          top: panel.y,
          width: panel.width,
          height: panel.height,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.78) 22%, rgba(255,255,255,0.94) 100%)',
        }}
      />

      <p
        className="pointer-events-none absolute z-[5] line-clamp-3 text-center font-semibold"
        style={{
          left: panel.titlePadX,
          right: panel.titlePadX,
          top: panel.titleY,
          fontSize: panel.titleFontSize,
          lineHeight: `${panel.titleLineHeight}px`,
          fontFamily: COVER_TITLE_FONT,
          color: textPanel,
        }}
      >
        {titulo.trim() || 'Minha obra'}
      </p>

      <div
        className="pointer-events-none absolute z-[5]"
        style={{
          top: panel.dividerY,
          left: width / 2 - panel.dividerHalfWidth,
          width: panel.dividerHalfWidth * 2,
          height: Math.max(1, 1.2 * s),
          backgroundColor: palette.frame,
        }}
      />

      <p
        className="pointer-events-none absolute z-[5] text-center"
        style={{
          left: panel.titlePadX,
          right: panel.titlePadX,
          top: panel.subtitleY - 2 * s,
          fontSize: panel.subtitleFontSize * 1.12,
          fontFamily: COVER_TITLE_FONT,
          fontStyle: 'italic',
          fontWeight: 500,
          color: textPanel,
          opacity: 1,
          textShadow: '0 1px 0 rgb(255 255 255 / 0.85)',
        }}
      >
        {subtitle}
      </p>

      <p
        className="pointer-events-none absolute z-[5] text-center font-semibold uppercase"
        style={{
          left: panel.titlePadX,
          right: panel.titlePadX,
          top: panel.y + panel.height * 0.82,
          fontSize: kick.fontSize * 1.05,
          fontFamily: COVER_UI_FONT,
          color: textPanel,
          opacity: 0.72,
          letterSpacing: kick.letterSpacing * 1.1,
        }}
      >
        {kicker.split('').join('\u2009')}
      </p>
    </div>
  )
}
