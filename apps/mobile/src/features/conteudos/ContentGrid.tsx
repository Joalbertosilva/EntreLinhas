import { Text, useWindowDimensions, View } from 'react-native'
import type { ConteudoCardData } from '@/features/conteudos/useConteudos'
import { ContentCard } from '@/features/conteudos/ContentCard'
import { RAIL_ITEM_GAP, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

const H_PADDING = SCREEN_HORIZONTAL_PADDING
const GAP = RAIL_ITEM_GAP
const NUM_COLS = 2

interface ContentGridProps {
  items: ConteudoCardData[]
  showTipo?: boolean
  emptyMessage?: string
}

/** Grade estática — evita FlatList dentro do ScrollView das abas (crash ao abrir catálogo). */
export function ContentGrid({ items, showTipo = true, emptyMessage }: ContentGridProps) {
  const { width: screenWidth } = useWindowDimensions()
  const cardWidth = (screenWidth - H_PADDING * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS

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

  const rows: ConteudoCardData[][] = []
  for (let i = 0; i < items.length; i += NUM_COLS) {
    rows.push(items.slice(i, i + NUM_COLS))
  }

  return (
    <View style={{ paddingHorizontal: H_PADDING, gap: GAP }}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={{ flexDirection: 'row', gap: GAP }}>
          {row.map((item) => (
            <ContentCard key={item.id} conteudo={item} showTipo={showTipo} width={cardWidth} />
          ))}
        </View>
      ))}
    </View>
  )
}
