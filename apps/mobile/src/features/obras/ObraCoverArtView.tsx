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
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ImagePlus } from 'lucide-react-native'
import { forwardRef, useEffect, useRef } from 'react'
import { Platform, Text, View } from 'react-native'
import { ObraCoverDecorations } from '@/features/obras/ObraCoverDecorations'
import type { NativeViewRef } from '@/lib/nativeRefs'
import {
  CATEGORIA_COVER_PALETTE,
  CATEGORIA_OBRA_KICKER,
  CATEGORIA_OBRA_SUBTITLE,
} from '@/lib/obraCategoriaLabels'

export const OBRA_COVER_BASE_WIDTH = COVER_ART_BASE_WIDTH
export const OBRA_COVER_BASE_HEIGHT = COVER_ART_BASE_HEIGHT

const COVER_TITLE_FONT = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
})

export interface ObraCoverArtViewProps {
  photoUri?: string | null
  categoria: CategoriaObra
  titulo: string
  width?: number
  onPhotoLoad?: () => void
}

export const ObraCoverArtView = forwardRef<NativeViewRef, ObraCoverArtViewProps>(function ObraCoverArtView(
  { photoUri, categoria, titulo, width = OBRA_COVER_BASE_WIDTH, onPhotoLoad },
  ref,
) {
  const palette = CATEGORIA_COVER_PALETTE[categoria]
  const kicker = CATEGORIA_OBRA_KICKER[categoria]
  const subtitle = CATEGORIA_OBRA_SUBTITLE[categoria]
  const textGradient = coverTextOnGradient(palette)
  const textPanel = coverTextOnLightPanel(palette)
  const layout = scaledCoverLayout(width)
  const { height, s, photo, framePad, frameInnerPad, panel, kicker: kick, blob } = layout
  const photoLoadNotified = useRef(false)

  useEffect(() => {
    photoLoadNotified.current = false
  }, [photoUri])

  const handlePhotoLoad = () => {
    if (!onPhotoLoad || photoLoadNotified.current) return
    photoLoadNotified.current = true
    onPhotoLoad()
  }

  const innerBorderPad = COVER_FRAME.inset * s

  return (
    <View ref={ref} collapsable={false} style={{ width, height, overflow: 'hidden', backgroundColor: palette.bottom }}>
      <LinearGradient
        colors={[palette.top, palette.mid, palette.bottom]}
        start={{ x: 0.35, y: 0.2 }}
        end={{ x: 0.5, y: 0.85 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View
        style={{
          position: 'absolute',
          left: blob.cx - blob.r,
          top: blob.cy - blob.r,
          width: blob.r * 2,
          height: blob.r * 2,
          borderRadius: blob.r,
          backgroundColor: palette.accent,
          opacity: 0.18,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: framePad,
          top: framePad,
          right: framePad,
          bottom: framePad,
          borderWidth: COVER_FRAME.outerBorder * s,
          borderColor: palette.frame,
          borderRadius: 2 * s,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: frameInnerPad,
          top: frameInnerPad,
          right: frameInnerPad,
          bottom: frameInnerPad,
          borderWidth: COVER_FRAME.innerBorder * s,
          borderColor: palette.accent,
          opacity: COVER_FRAME.innerOpacity,
          borderRadius: 2 * s,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: photo.x,
          top: photo.y,
          width: photo.width,
          height: photo.height,
          borderRadius: layout.photoRadius,
          overflow: 'hidden',
          borderWidth: layout.photoBorder,
          borderColor: COVER_PHOTO_STYLE.borderColor,
          backgroundColor: palette.mid,
        }}
      >
        {photoUri?.trim() ? (
          <>
            <Image
              source={{ uri: photoUri.trim() }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              onLoad={handlePhotoLoad}
              onDisplay={() => handlePhotoLoad()}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.08)', 'transparent', 'rgba(0,0,0,0.28)']}
              style={{ position: 'absolute', inset: 0 }}
            />
          </>
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 }}>
            <ImagePlus color={textGradient} size={28 * s} strokeWidth={1.75} />
            <Text
              style={{
                textAlign: 'center',
                fontSize: 11 * s,
                fontFamily: 'PlusJakartaSans_500Medium',
                color: textGradient,
                opacity: 0.65,
              }}
            >
              Sua foto entra neste espaço
            </Text>
          </View>
        )}
      </View>

      <ObraCoverDecorations width={width} height={height} palette={palette} categoria={categoria} />

      <Text
        style={{
          position: 'absolute',
          top: kick.y,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: kick.fontSize,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          color: textGradient,
          opacity: 0.75,
          letterSpacing: kick.letterSpacing,
        }}
      >
        {kicker.split('').join('\u2009')}
      </Text>

      <View
        style={{
          position: 'absolute',
          top: kick.ruleY,
          left: width / 2 - kick.ruleHalfWidth,
          width: kick.ruleHalfWidth * 2,
          height: kick.ruleHeight,
          backgroundColor: palette.frame,
        }}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.88)']}
        style={{
          position: 'absolute',
          left: panel.x,
          top: panel.y,
          width: panel.width,
          height: panel.height,
        }}
      />

      <Text
        numberOfLines={3}
        style={{
          position: 'absolute',
          left: panel.titlePadX,
          right: panel.titlePadX,
          top: panel.titleY,
          textAlign: 'center',
          fontSize: panel.titleFontSize,
          lineHeight: panel.titleLineHeight,
          fontFamily: COVER_TITLE_FONT,
          fontWeight: '600',
          color: textPanel,
        }}
      >
        {titulo.trim() || 'Minha obra'}
      </Text>

      <View
        style={{
          position: 'absolute',
          top: panel.dividerY,
          left: width / 2 - panel.dividerHalfWidth,
          width: panel.dividerHalfWidth * 2,
          height: 1 * s,
          backgroundColor: palette.frame,
        }}
      />

      <Text
        style={{
          position: 'absolute',
          left: panel.titlePadX,
          right: panel.titlePadX,
          top: panel.subtitleY,
          textAlign: 'center',
          fontSize: panel.subtitleFontSize,
          fontFamily: COVER_TITLE_FONT,
          fontStyle: 'italic',
          color: textPanel,
          opacity: 0.82,
        }}
      >
        {subtitle}
      </Text>

    </View>
  )
})
