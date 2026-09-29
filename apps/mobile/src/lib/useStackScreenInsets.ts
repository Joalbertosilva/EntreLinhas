import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { stackScrollPaddingBottom } from '@/lib/layout'

export function useStackScreenInsets() {
  const insets = useSafeAreaInsets()

  return {
    insets,
    scrollPaddingBottom: stackScrollPaddingBottom(insets),
  }
}
