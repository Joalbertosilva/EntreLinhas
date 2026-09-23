import type { LucideIcon } from 'lucide-react-native'
import { ChevronRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { cn } from '@/lib/cn'

interface ProfileMenuItemProps {
  icon: LucideIcon
  label: string
  hint?: string
  onPress: () => void
  color?: string
  bg?: string
  variant?: 'card' | 'list'
  isLast?: boolean
}

export function ProfileMenuItem({
  icon: Icon,
  label,
  hint,
  onPress,
  color = '#1c756a',
  bg = '#e8f7f4',
  variant = 'card',
  isLast = false,
}: ProfileMenuItemProps) {
  if (variant === 'list') {
    return (
      <Pressable
        onPress={onPress}
        className={cn(
          'flex-row items-center gap-3 px-4 py-3.5 active:bg-primary-light/20',
          !isLast && 'border-b border-border/70',
        )}
        accessibilityRole="button"
      >
        <View className="h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
          <Icon color={color} size={18} strokeWidth={1.75} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-sans-medium text-[15px] text-brand-navy">{label}</Text>
          {hint ? (
            <Text className="mt-0.5 font-sans text-xs leading-snug text-text-muted" numberOfLines={1}>
              {hint}
            </Text>
          ) : null}
        </View>
        <ChevronRight color="#94a3b8" size={16} />
      </Pressable>
    )
  }

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
