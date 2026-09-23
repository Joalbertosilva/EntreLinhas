import type { ReactNode } from 'react'
import { View } from 'react-native'
import { AppTopBar } from '@/components/layout/AppTopBar'

export function TabScreenShell({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1">
      <AppTopBar />
      {children}
    </View>
  )
}
