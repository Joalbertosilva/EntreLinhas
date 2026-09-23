import type { RefObject } from 'react'
import type { View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { OBRA_COVER_BASE_HEIGHT, OBRA_COVER_BASE_WIDTH } from '@/features/obras/ObraCoverArtView'

export async function captureObraCoverArt(ref: RefObject<View | null>): Promise<string> {
  if (!ref.current) throw new Error('Prévia da capa indisponível')

  const base64 = await captureRef(ref, {
    format: 'jpg',
    quality: 0.94,
    width: OBRA_COVER_BASE_WIDTH,
    height: OBRA_COVER_BASE_HEIGHT,
    result: 'base64',
  })

  if (!base64) throw new Error('Falha ao gerar a capa conceitual')
  return base64
}
