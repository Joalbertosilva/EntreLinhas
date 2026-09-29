import type { ReactNode } from 'react'
import type { ScrollViewProps } from 'react-native'
import { ScrollView, View } from 'react-native'
import { AppTopBar } from '@/components/layout/AppTopBar'
import { useTabScreenInsets } from '@/lib/useTabScreenInsets'

export function TabScreenShell({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1">
      <AppTopBar />
      {children}
    </View>
  )
}

export function TabScrollView({
  children,
  contentContainerStyle,
  ...rest
}: ScrollViewProps) {
  const { scrollPaddingBottom } = useTabScreenInsets()

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ paddingTop: 12, paddingBottom: scrollPaddingBottom }, contentContainerStyle]}
      {...rest}
    >
      {children}
    </ScrollView>
  )
}
