import { useState } from 'react'
import { Platform, Pressable, TextInput, View, type TextInputProps } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { cn } from '@/lib/cn'

const INPUT_TEXT_STYLE = {
  paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  fontSize: 16,
  lineHeight: 22,
  ...(Platform.OS === 'android' ? { includeFontPadding: false as const, textAlignVertical: 'center' as const } : {}),
}

interface PasswordInputProps extends TextInputProps {
  icon?: LucideIcon
  className?: string
}

export function PasswordInput({ icon: Icon, className, style, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

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
        secureTextEntry={!visible}
        autoCapitalize="none"
        className={cn('flex-1 font-sans text-base text-text', Icon ? 'ml-3' : undefined)}
        style={[INPUT_TEXT_STYLE, style]}
        {...props}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        hitSlop={8}
        className="ml-2 rounded-full p-1.5"
      >
        {visible ? (
          <EyeOff size={18} color="#5a7282" strokeWidth={1.75} />
        ) : (
          <Eye size={18} color="#5a7282" strokeWidth={1.75} />
        )}
      </Pressable>
    </View>
  )
}
