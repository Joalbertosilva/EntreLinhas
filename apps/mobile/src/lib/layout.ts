import { Platform } from 'react-native'
import type { EdgeInsets } from 'react-native-safe-area-context'

/** Padding horizontal padrão das telas (evita texto colado na borda). */
export const SCREEN_HORIZONTAL_PADDING = 24

/** Larguras fixas — NativeWind nem sempre aplica w-* em listas horizontais. */
export const CONTENT_CARD_WIDTH = 108
export const CONTENT_COVER_HEIGHT = 144
export const OBRA_CARD_WIDTH = 100
export const OBRA_COVER_HEIGHT = 136
export const DETAIL_COVER_HEIGHT = 168

/** Tab bar — fonte única para altura real e padding de scroll. */
export const TAB_BAR_CONTENT_HEIGHT = 52
export const TAB_BAR_PADDING_TOP = 8
export const TAB_BAR_MIN_BOTTOM = { ios: 16, android: 12 } as const
export const TAB_SCROLL_EXTRA = 12

/** Botão flutuante de acessibilidade. */
export const ACCESSIBILITY_FAB_SIZE = 44
export const ACCESSIBILITY_FAB_TAB_GAP = 12
/** Distância acima da safe area inferior em telas sem tab bar (≈ legado +68). */
export const ACCESSIBILITY_FAB_STACK_GAP = 56

export function tabBarBottomInset(insets: Pick<EdgeInsets, 'bottom'>) {
  const min = Platform.OS === 'ios' ? TAB_BAR_MIN_BOTTOM.ios : TAB_BAR_MIN_BOTTOM.android
  return Math.max(insets.bottom, min)
}

export function tabBarContentHeight(fontMultiplier = 1) {
  return Math.round(TAB_BAR_CONTENT_HEIGHT * fontMultiplier)
}

export function tabBarTotalHeight(insets: Pick<EdgeInsets, 'bottom'>, fontMultiplier = 1) {
  return tabBarContentHeight(fontMultiplier) + TAB_BAR_PADDING_TOP + tabBarBottomInset(insets)
}

export function accessibilityFabBottomOnTabs(insets: Pick<EdgeInsets, 'bottom'>, fontMultiplier = 1) {
  return tabBarTotalHeight(insets, fontMultiplier) + ACCESSIBILITY_FAB_TAB_GAP
}

export function accessibilityFabBottomOnStack(insets: Pick<EdgeInsets, 'bottom'>) {
  return tabBarBottomInset(insets) + ACCESSIBILITY_FAB_STACK_GAP
}

export function tabScrollPaddingBottom(insets: Pick<EdgeInsets, 'bottom'>, fontMultiplier = 1) {
  const tabBar = tabBarTotalHeight(insets, fontMultiplier)
  const fabClearance =
    accessibilityFabBottomOnTabs(insets, fontMultiplier) + ACCESSIBILITY_FAB_SIZE + TAB_SCROLL_EXTRA
  return Math.max(tabBar + TAB_SCROLL_EXTRA, fabClearance)
}

export function stackScrollPaddingBottom(insets: Pick<EdgeInsets, 'bottom'>) {
  const fabClearance =
    accessibilityFabBottomOnStack(insets) + ACCESSIBILITY_FAB_SIZE + TAB_SCROLL_EXTRA
  return Math.max(insets.bottom + 32, fabClearance)
}

export const KEYBOARD_AVOIDING_BEHAVIOR = Platform.select({
  ios: 'padding' as const,
  android: 'padding' as const,
  default: 'padding' as const,
})
