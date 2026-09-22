import { Platform, TextInput, View, type TextInputProps } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { cn } from '@/lib/cn'

interface InputProps extends TextInputProps {
  icon?: LucideIcon
  className?: string
}

const INPUT_TEXT_STYLE = {
  paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  fontSize: 16,
  lineHeight: 22,
  ...(Platform.OS === 'android' ? { includeFontPadding: false as const, textAlignVertical: 'center' as const } : {}),
}

export function Input({ icon: Icon, className, style, ...props }: InputProps) {
  return (
    <View
      className={cn(
        'min-h-[52px] flex-row items-center rounded-xl border-2 border-border bg-surface px-4',
        className,
      )}
    >
      {Icon ? <Icon size={18} color="#5a7282" strokeWidth={1.75} /> : null}
      <TextInput
        placeholderTextColor="#5a7282"
        className={cn('flex-1 font-sans text-base text-text', Icon ? 'ml-3' : undefined)}
        style={[INPUT_TEXT_STYLE, style]}
        {...props}
      />
    </View>
  )
}
