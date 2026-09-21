import type { ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import { cn } from '@/lib/cn'

interface A11yScreenProps extends ViewProps {
  children: ReactNode
}

/** Wrapper de tela — botão de acessibilidade fica global no root layout. */
export function A11yScreen({ children, className, ...props }: A11yScreenProps) {
  return (
    <View className={cn('flex-1', className)} {...props}>
      {children}
    </View>
  )
}
