import { FlatList, Text, View } from 'react-native'
import { ObraCard } from '@/features/obras/ObraCard'
import { useObrasPublicas } from '@/features/obras/useObrasPublicas'
import { OBRA_CARD_WIDTH, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

export function ObrasSectionRail() {
  const { data, isLoading, isError } = useObrasPublicas(8)

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-8">
        <Text className="font-sans-bold text-lg text-brand-navy">Obras da comunidade</Text>
        <View className="mt-3 flex-row gap-3">
          {[0, 1, 2].map((i) => (
            <View key={i} style={{ width: OBRA_CARD_WIDTH, height: 136 }} className="rounded-xl bg-primary/10" />
          ))}
        </View>
      </View>
    )
  }

  if (isError || !data?.length) return null

  return (
    <View className="mb-8">
      <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-3">
        <Text className="font-sans-bold text-lg text-brand-navy">Obras da comunidade</Text>
        <Text className="mt-0.5 font-sans text-sm text-text-muted">
          Textos publicados por outros alunos
        </Text>
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: 12 }}
        renderItem={({ item }) => <ObraCard obra={item} />}
      />
    </View>
  )
}
