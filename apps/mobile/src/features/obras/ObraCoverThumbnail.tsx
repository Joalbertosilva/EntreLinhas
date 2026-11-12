import type { CategoriaObra } from '@tcc-sistema/types'
import { isDefaultObraCoverUrl, shouldShowLiveObraCoverMoldura } from '@tcc-sistema/cover-motifs'
import { Image } from 'expo-image'
import { ActivityIndicator, View, type StyleProp, type ViewStyle } from 'react-native'
import { ObraCoverArtView } from '@/features/obras/ObraCoverArtView'
import { useObraCapaFoto } from '@/features/obras/useObraCapaFoto'
import { capaImageUri, resolvePublicImageUri } from '@/lib/imageUrl'

const DEFAULT_OBRA_COVER = resolvePublicImageUri('/images/minha-obra-default-cover.png')

/** Largura interna de render — escala visualmente para thumbs pequenos (home, rails). */
const LIVE_COVER_RENDER_WIDTH = 240

const thumbFrameStyle = {
  overflow: 'hidden' as const,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(28, 117, 106, 0.12)',
}

export interface ObraCoverThumbnailProps {
  userId: string | undefined
  obraId: string | undefined
  capaUrl: string | null | undefined
  categoria: CategoriaObra
  titulo: string
  updatedAt?: string | null
  style?: StyleProp<ViewStyle>
  width?: number
}

function ScaledLiveCover({
  width,
  categoria,
  titulo,
  photoUri,
}: {
  width: number
  categoria: CategoriaObra
  titulo: string
  photoUri: string | null | undefined
}) {
  const height = width * 1.5
  const renderHeight = LIVE_COVER_RENDER_WIDTH * 1.5
  const scale = width / LIVE_COVER_RENDER_WIDTH

  return (
    <View
      style={[
        thumbFrameStyle,
        {
          width,
          height,
          backgroundColor: '#fff',
          shadowColor: '#1a3342',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
      ]}
    >
      <View
        style={{
          width: LIVE_COVER_RENDER_WIDTH,
          height: renderHeight,
          transform: [{ scale }],
          transformOrigin: 'left top',
        }}
      >
        <ObraCoverArtView
          photoUri={photoUri}
          categoria={categoria}
          titulo={titulo}
          width={LIVE_COVER_RENDER_WIDTH}
        />
      </View>
    </View>
  )
}

export function ObraCoverThumbnail({
  userId,
  obraId,
  capaUrl,
  categoria,
  titulo,
  updatedAt,
  style,
  width = 276,
}: ObraCoverThumbnailProps) {
  const { data: capaFoto, isLoading } = useObraCapaFoto(userId, obraId)
  const hasFoto = Boolean(capaFoto?.trim())
  const liveMoldura = shouldShowLiveObraCoverMoldura(capaUrl, hasFoto)
  const height = width * 1.5
  const showLoadingOverlay = Boolean(isLoading && obraId)

  const frameBase: ViewStyle = {
    width,
    height,
    ...thumbFrameStyle,
  }

  if (liveMoldura) {
    return (
      <View style={[{ position: 'relative', width, height }, style]}>
        <ScaledLiveCover
          width={width}
          categoria={categoria}
          titulo={titulo}
          photoUri={capaFoto}
        />
        {showLoadingOverlay ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width,
              height,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(248, 251, 254, 0.55)',
              borderRadius: 12,
            }}
          >
            <ActivityIndicator color="#1c756a" />
          </View>
        ) : null}
      </View>
    )
  }

  const uri =
    capaUrl && !isDefaultObraCoverUrl(capaUrl)
      ? capaImageUri(capaUrl, updatedAt)
      : DEFAULT_OBRA_COVER

  return (
    <View style={[frameBase, style]}>
      {showLoadingOverlay ? (
        <View
          style={{
            ...frameBase,
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(230, 244, 242, 0.55)',
          }}
        >
          <ActivityIndicator color="#1c756a" />
        </View>
      ) : null}
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      ) : null}
    </View>
  )
}
