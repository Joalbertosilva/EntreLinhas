import { View } from 'react-native'
import { HorizontalSectionScroll } from '@/components/layout/HorizontalSectionScroll'
import { ScreenSectionHeader } from '@/components/layout/ScreenPageHeader'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { useMinhasLeituras } from '@/features/leituras/useMinhasLeituras'
import { CONTENT_COVER_HEIGHT, SCREEN_HORIZONTAL_PADDING, SECTION_GAP } from '@/lib/layout'

interface ContinueReadingSectionProps {
  userId: string | undefined
}

export function ContinueReadingSection({ userId }: ContinueReadingSectionProps) {
  const { data, isLoading, isFetched } = useMinhasLeituras(userId)
  const items = data?.em_andamento ?? []

  if (isLoading && !isFetched) {
    return (
      <View style={{ marginBottom: SECTION_GAP, paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}>
        <View className="mb-3 h-6 w-40 rounded bg-primary/10" />
        <View className="flex-row gap-3">
          {[0, 1, 2].map((i) => (
            <View key={i} className="h-40 w-[108px] rounded-xl bg-primary/10" />
          ))}
        </View>
      </View>
    )
  }
  if (!items.length) return null

  return (
    <View style={{ marginBottom: SECTION_GAP }}>
      <ScreenSectionHeader title="Continue lendo" subtitle="Retome de onde parou" />
      <HorizontalSectionScroll minHeight={CONTENT_COVER_HEIGHT + 44}>
        {items.map((item) => (
          <ContentCard key={item.id} conteudo={item.conteudo} />
        ))}
      </HorizontalSectionScroll>
    </View>
  )
}
