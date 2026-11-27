import { useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import type { FontScale } from '@/features/accessibility/accessibilityStorage'
import { tabScrollPaddingBottom } from '@/lib/layout'

export function useTabScreenInsets() {
  const insets = useSafeAreaInsets()
  const { fontMultiplier, fontScale } = useAccessibility()
  const insetsBottomKey = Math.round(insets.bottom)
  const paddingRef = useRef<{ scale: FontScale; insetsBottom: number; value: number }>({
    scale: fontScale,
    insetsBottom: insetsBottomKey,
    value: tabScrollPaddingBottom(insets, fontMultiplier),
  })

  if (paddingRef.current.scale !== fontScale || paddingRef.current.insetsBottom !== insetsBottomKey) {
    paddingRef.current = {
      scale: fontScale,
      insetsBottom: insetsBottomKey,
      value: tabScrollPaddingBottom(insets, fontMultiplier),
    }
  }

  return {
    insets,
    scrollPaddingBottom: paddingRef.current.value,
  }
}