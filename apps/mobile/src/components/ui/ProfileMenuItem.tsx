import type { LucideIcon } from 'lucide-react-native'
import { ChevronRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

interface ProfileMenuItemProps {
  icon: LucideIcon
  label: string
  hint?: string
  onPress: () => void
  color?: string
  bg?: string
}

export function ProfileMenuItem({
  icon: Icon,
  label,
  hint,
  onPress,
  color = '#1c756a',
  bg = '#e8f7f4',
}: ProfileMenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2.5 flex-row items-center gap-3.5 rounded-2xl border border-border/80 bg-white px-4 py-3.5 active:bg-primary-light/15"
    >
      <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: bg }}>
        <Icon color={color} size={20} strokeWidth={1.75} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-sans-semibold text-base text-brand-navy">{label}</Text>
        {hint ? <Text className="mt-0.5 font-sans text-sm leading-snug text-text-muted">{hint}</Text> : null}
      </View>
      <ChevronRight color="#94a3b8" size={18} />
    </Pressable>
  )
}
