import { FlatList, View } from 'react-native'
import { ScreenSectionHeader } from '@/components/layout/ScreenPageHeader'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { useMinhasLeituras } from '@/features/leituras/useMinhasLeituras'
import { RAIL_ITEM_GAP, SCREEN_HORIZONTAL_PADDING, SECTION_GAP } from '@/lib/layout'

interface ContinueReadingSectionProps {
  userId: string | undefined
}

export function ContinueReadingSection({ userId }: ContinueReadingSectionProps) {
  const { data, isLoading } = useMinhasLeituras(userId)
  const items = data?.em_andamento ?? []

  if (isLoading) return null
  if (!items.length) return null

  return (
    <View style={{ marginBottom: SECTION_GAP }}>
      <ScreenSectionHeader title="Continue lendo" subtitle="Retome de onde parou" />
      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: RAIL_ITEM_GAP }}
        renderItem={({ item }) => <ContentCard conteudo={item.conteudo} />}
      />
    </View>
  )
}
