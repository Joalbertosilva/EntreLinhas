import { useState } from 'react'
import { Pressable, TextInput, View, type TextInputProps } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { cn } from '@/lib/cn'

interface PasswordInputProps extends TextInputProps {
  icon?: LucideIcon
  className?: string
}

export function PasswordInput({ icon: Icon, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <View
      className={cn(
        'min-h-12 flex-row items-center rounded-xl border-2 border-border bg-surface px-4',
        className,
      )}
    >
      {Icon ? <Icon size={18} color="#5a7282" strokeWidth={1.75} /> : null}
      <TextInput
        placeholderTextColor="#5a7282"
        secureTextEntry={!visible}
        autoCapitalize="none"
        className={cn('flex-1 font-sans text-base text-text', Icon ? 'ml-3' : undefined)}
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
