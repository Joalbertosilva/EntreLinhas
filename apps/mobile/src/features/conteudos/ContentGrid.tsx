import { Dimensions, FlatList, Text, View } from 'react-native'
import type { ConteudoCardData } from '@/features/conteudos/useConteudos'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

const H_PADDING = SCREEN_HORIZONTAL_PADDING
const GAP = 12
const NUM_COLS = 2

function gridCardWidth() {
  const screen = Dimensions.get('window').width
  return (screen - H_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS
}

interface ContentGridProps {
  items: ConteudoCardData[]
  showTipo?: boolean
  emptyMessage?: string
}

export function ContentGrid({ items, showTipo = true, emptyMessage }: ContentGridProps) {
  const cardWidth = gridCardWidth()

  if (!items.length) {
    return (
      <View
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="rounded-2xl border border-dashed border-primary/20 bg-white/80 p-6"
      >
        <Text className="text-center font-sans text-sm leading-relaxed text-text-muted">
          {emptyMessage ?? 'Nenhum conteúdo disponível nesta categoria ainda.'}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COLS}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PADDING }}
      contentContainerStyle={{ gap: GAP }}
      renderItem={({ item }) => (
        <ContentCard conteudo={item} showTipo={showTipo} width={cardWidth} />
      )}
    />
  )
}
