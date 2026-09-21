import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

interface AuthFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function AuthField({ label, error, children }: AuthFieldProps) {
  return (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-sm text-text">{label}</Text>
      {children}
      {error ? <Text className="text-sm text-error">{error}</Text> : null}
    </View>
  )
}
