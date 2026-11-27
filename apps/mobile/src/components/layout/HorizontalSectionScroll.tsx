import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native'
import { RAIL_ITEM_GAP, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface HorizontalSectionScrollProps {
  children: ReactNode
  minHeight: number
  contentContainerStyle?: StyleProp<ViewStyle>
  style?: StyleProp<ViewStyle>
}

/**
 * Scroll horizontal estável dentro de ScrollView vertical — evita FlatList com altura 0
 * após voltar de telas do stack (obra, conteúdo).
 */
export function HorizontalSectionScroll({
  children,
  minHeight,
  contentContainerStyle,
  style,
}: HorizontalSectionScrollProps) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      removeClippedSubviews={false}
      collapsable={false}
      keyboardShouldPersistTaps="handled"
      style={[{ minHeight }, style]}
      contentContainerStyle={[
        {
          paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
          gap: RAIL_ITEM_GAP,
          flexDirection: 'row',
          alignItems: 'flex-start',
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  )
}