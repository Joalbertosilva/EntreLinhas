import { ScrollView, Text, View } from 'react-native'
import { ScreenSectionHeader } from '@/components/layout/ScreenPageHeader'
import { ObraCard } from '@/features/obras/ObraCard'
import { useObrasPublicas } from '@/features/obras/useObrasPublicas'
import { OBRA_CARD_WIDTH, OBRA_COVER_HEIGHT, RAIL_ITEM_GAP, SCREEN_HORIZONTAL_PADDING, SECTION_GAP } from '@/lib/layout'

export function ObrasSectionRail() {
  const { data, isLoading, isError, isFetched } = useObrasPublicas(8)

  if (isLoading && !isFetched) {
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
    <View style={{ marginBottom: SECTION_GAP }} collapsable={false}>
      <ScreenSectionHeader
        title="Obras da comunidade"
        subtitle="Textos publicados por outros alunos"
      />
      <ScrollView
        horizontal
        nestedScrollEnabled
        removeClippedSubviews={false}
        collapsable={false}
        showsHorizontalScrollIndicator={false}
        style={{ minHeight: OBRA_COVER_HEIGHT + 44 }}
        contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: RAIL_ITEM_GAP }}
      >
        {data.map((item) => (
          <ObraCard key={item.id} obra={item} />
        ))}
      </ScrollView>
    </View>
  )
}
