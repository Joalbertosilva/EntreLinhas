import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { tabScrollPaddingBottom } from '@/lib/layout'

export function useTabScreenInsets() {
  const insets = useSafeAreaInsets()
  const { fontMultiplier } = useAccessibility()

  return {
    insets,
    scrollPaddingBottom: tabScrollPaddingBottom(insets, fontMultiplier),
  }
}
