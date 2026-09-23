import type { CategoriaObra } from '@tcc-sistema/types'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { forwardRef } from 'react'
import { Text, View } from 'react-native'
import {
  CATEGORIA_COVER_PALETTE,
  CATEGORIA_OBRA_KICKER,
  CATEGORIA_OBRA_SUBTITLE,
} from '@/lib/obraCategoriaLabels'

export const OBRA_COVER_BASE_WIDTH = 720
export const OBRA_COVER_BASE_HEIGHT = 1080

export interface ObraCoverArtViewProps {
  photoUri: string
  categoria: CategoriaObra
  titulo: string
  autorNome?: string
  /** Largura de render — 720 para exportação em alta resolução. */
  width?: number
}

export const ObraCoverArtView = forwardRef<View, ObraCoverArtViewProps>(function ObraCoverArtView(
  { photoUri, categoria, titulo, autorNome, width = OBRA_COVER_BASE_WIDTH },
  ref,
) {
  const palette = CATEGORIA_COVER_PALETTE[categoria]
  const kicker = CATEGORIA_OBRA_KICKER[categoria]
  const subtitle = CATEGORIA_OBRA_SUBTITLE[categoria]
  const height = width * (OBRA_COVER_BASE_HEIGHT / OBRA_COVER_BASE_WIDTH)
  const s = width / OBRA_COVER_BASE_WIDTH

  const pad = 36 * s
  const photoW = width * 0.72
  const photoH = height * 0.48
  const photoX = (width - photoW) / 2
  const photoY = height * 0.12
  const panelY = height * 0.68
  const panelH = height * 0.26

  return (
    <View ref={ref} collapsable={false} style={{ width, height, overflow: 'hidden' }}>
      <LinearGradient
        colors={[palette.top, palette.mid, palette.bottom]}
        start={{ x: 0.35, y: 0.2 }}
        end={{ x: 0.5, y: 0.85 }}
        style={{ position: 'absolute', inset: 0 }}
      />

      <View
        style={{
          position: 'absolute',
          right: width * 0.12,
          top: height * 0.18,
          width: 140 * s,
          height: 140 * s,
          borderRadius: 999,
          backgroundColor: palette.accent,
          opacity: 0.18,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: pad,
          top: pad,
          right: pad,
          bottom: pad,
          borderWidth: 2.5 * s,
          borderColor: palette.frame,
          borderRadius: 2 * s,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: pad + 8 * s,
          top: pad + 8 * s,
          right: pad + 8 * s,
          bottom: pad + 8 * s,
          borderWidth: 1 * s,
          borderColor: palette.accent,
          opacity: 0.35,
          borderRadius: 2 * s,
        }}
      />

      <View
        style={{
          position: 'absolute',
          left: photoX,
          top: photoY,
          width: photoW,
          height: photoH,
          borderRadius: 14 * s,
          overflow: 'hidden',
          borderWidth: 2 * s,
          borderColor: 'rgba(255,255,255,0.55)',
        }}
      >
        <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'transparent', 'rgba(0,0,0,0.28)']}
          style={{ position: 'absolute', inset: 0 }}
        />
      </View>

      <Text
        style={{
          position: 'absolute',
          top: 78 * s,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: 13 * s,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          color: palette.text,
          opacity: 0.75,
          letterSpacing: 2.5 * s,
        }}
      >
        {kicker}
      </Text>

      <View
        style={{
          position: 'absolute',
          top: 92 * s,
          left: width / 2 - 28 * s,
          width: 56 * s,
          height: 1.5 * s,
          backgroundColor: palette.frame,
        }}
      />

      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.72)', 'rgba(255,255,255,0.88)']}
        style={{
          position: 'absolute',
          left: 48 * s,
          top: panelY,
          width: width - 96 * s,
          height: panelH,
        }}
      />

      <Text
        numberOfLines={3}
        style={{
          position: 'absolute',
          left: 50 * s,
          right: 50 * s,
          top: panelY + 28 * s,
          textAlign: 'center',
          fontSize: 32 * s,
          lineHeight: 38 * s,
          fontFamily: 'PlusJakartaSans_700Bold',
          color: palette.text,
        }}
      >
        {titulo.trim() || 'Minha obra'}
      </Text>

      <View
        style={{
          position: 'absolute',
          top: panelY + panelH * 0.55,
          left: width / 2 - 50 * s,
          width: 100 * s,
          height: 1 * s,
          backgroundColor: palette.frame,
        }}
      />

      <Text
        style={{
          position: 'absolute',
          left: 50 * s,
          right: 50 * s,
          top: panelY + panelH * 0.62,
          textAlign: 'center',
          fontSize: 17 * s,
          fontFamily: 'PlusJakartaSans_500Medium',
          fontStyle: 'italic',
          color: palette.text,
          opacity: 0.82,
        }}
      >
        {subtitle}
      </Text>

      {autorNome?.trim() ? (
        <Text
          style={{
            position: 'absolute',
            left: 40 * s,
            right: 40 * s,
            bottom: 52 * s,
            textAlign: 'center',
            fontSize: 14 * s,
            fontFamily: 'PlusJakartaSans_500Medium',
            color: palette.text,
            opacity: 0.65,
          }}
        >
          {autorNome.trim()}
        </Text>
      ) : null}

      <Text
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 32 * s,
          textAlign: 'center',
          fontSize: 10 * s,
          fontFamily: 'PlusJakartaSans_500Medium',
          color: palette.text,
          opacity: 0.45,
        }}
      >
        EntreLinhas
      </Text>
    </View>
  )
})
