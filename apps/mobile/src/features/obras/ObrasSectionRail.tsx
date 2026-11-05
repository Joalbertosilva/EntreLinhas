import { FlatList, Text, View } from 'react-native'
import { ScreenSectionHeader } from '@/components/layout/ScreenPageHeader'
import { ObraCard } from '@/features/obras/ObraCard'
import { useObrasPublicas } from '@/features/obras/useObrasPublicas'
import { OBRA_CARD_WIDTH, RAIL_ITEM_GAP, SCREEN_HORIZONTAL_PADDING, SECTION_GAP } from '@/lib/layout'

export function ObrasSectionRail() {
  const { data, isLoading, isError } = useObrasPublicas(8)

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, marginBottom: SECTION_GAP }}>
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
    <View style={{ marginBottom: SECTION_GAP }}>
      <ScreenSectionHeader
        title="Obras da comunidade"
        subtitle="Textos publicados por outros alunos"
      />
      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: RAIL_ITEM_GAP }}
        renderItem={({ item }) => <ObraCard obra={item} />}
      />
    </View>
  )
}
