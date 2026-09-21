import { TextInput, View, type TextInputProps } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'
import { cn } from '@/lib/cn'

interface InputProps extends TextInputProps {
  icon?: LucideIcon
  className?: string
}

export function Input({ icon: Icon, className, ...props }: InputProps) {
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
        className={cn(
          'flex-1 font-sans text-base text-text',
          Icon ? 'ml-3' : undefined,
        )}
        {...props}
      />
    </View>
  )
}
