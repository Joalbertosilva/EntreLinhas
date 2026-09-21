import { FlatList, Text, View } from 'react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { useMinhasLeituras } from '@/features/leituras/useMinhasLeituras'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface ContinueReadingSectionProps {
  userId: string | undefined
}

export function ContinueReadingSection({ userId }: ContinueReadingSectionProps) {
  const { data, isLoading } = useMinhasLeituras(userId)
  const items = data?.em_andamento ?? []

  if (isLoading) return null
  if (!items.length) return null

  return (
    <View className="mb-6">
      <Speakable
        label="Continue lendo. Retome de onde parou."
        style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mb-3"
      >
        <Text className="font-sans-bold text-lg text-brand-navy">Continue lendo</Text>
        <Text className="mt-0.5 font-sans text-sm text-text-muted">Retome de onde parou</Text>
      </Speakable>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: 12 }}
        renderItem={({ item }) => <ContentCard conteudo={item.conteudo} />}
      />
    </View>
  )
}
