import { Image } from 'expo-image'
import { PenLine } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import type { ObraPublicaCard } from '@/features/obras/useObrasPublicas'
import { capaImageUri } from '@/lib/imageUrl'
import { OBRA_CARD_WIDTH, OBRA_COVER_HEIGHT } from '@/lib/layout'

import { useRouter } from 'expo-router'

interface ObraCardProps {
  obra: ObraPublicaCard
}

export function ObraCard({ obra }: ObraCardProps) {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push(`/(aluno)/obra/${obra.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`Obra ${obra.titulo}`}
      style={{ width: OBRA_CARD_WIDTH }}
    >
      <View
        style={{ width: OBRA_CARD_WIDTH, height: OBRA_COVER_HEIGHT }}
        className="overflow-hidden rounded-xl border border-primary/10 bg-primary-light"
      >
        {obra.capa_url ? (
          <Image
            source={{ uri: capaImageUri(obra.capa_url, obra.updated_at) }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            recyclingKey={capaImageUri(obra.capa_url, obra.updated_at)}
          />
        ) : (
          <View className="flex-1 items-start justify-end p-2.5">
            <View className="rounded-lg bg-white/90 p-1.5">
              <PenLine color="#1c756a" size={16} strokeWidth={1.75} />
            </View>
          </View>
        )}
      </View>
      <Text className="mt-2 font-sans-semibold text-sm leading-snug text-text" numberOfLines={2}>
        {obra.titulo}
      </Text>
      {obra.autorNome ? (
        <Text className="mt-0.5 font-sans text-xs text-text-muted" numberOfLines={1}>
          {obra.autorNome}
        </Text>
      ) : null}
    </Pressable>
  )
}
