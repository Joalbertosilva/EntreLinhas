import { ArrowLeft } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useGoBack } from '@/lib/useGoBack'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface ScreenBackHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  rightSlot?: ReactNode
}

export function ScreenBackHeader({ title, subtitle, onBack, rightSlot }: ScreenBackHeaderProps) {
  const goBack = useGoBack()

  return (
    <View
      className="flex-row items-center gap-3 border-b border-border py-3"
      style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingRight: rightSlot ? 16 : 56 }}
    >
      <Pressable
        onPress={onBack ?? goBack}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        className="rounded-full p-2 active:bg-primary-light"
      >
        <ArrowLeft color="#1a3342" size={22} strokeWidth={1.75} />
      </Pressable>
      <View className="min-w-0 flex-1">
        <Text className="font-sans-bold text-lg text-brand-navy" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-sans text-xs text-text-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightSlot}
    </View>
  )
}
