import { Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

interface ScreenPlaceholderProps {
  title: string
  description: string
}

export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <LinearGradient
      colors={['#ffffff', '#f7fdfc']}
      style={{ flex: 1 }}
      className="px-6 py-8"
    >
      <View className="rounded-2xl border border-border bg-white p-6">
        <Text className="font-sans-bold text-xl text-brand-navy">{title}</Text>
        <Text className="mt-2 font-sans text-base leading-relaxed text-text-muted">
          {description}
        </Text>
      </View>
    </LinearGradient>
  )
}
