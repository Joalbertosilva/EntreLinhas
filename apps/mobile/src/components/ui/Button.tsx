import { Pressable, Text, type PressableProps } from 'react-native'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'brand' | 'outline' | 'ghost'

interface ButtonProps extends PressableProps {
  variant?: ButtonVariant
  label: string
  loading?: boolean
  className?: string
  textClassName?: string
}

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary-solid active:bg-primary-hover',
    text: 'text-white',
  },
  brand: {
    container: 'bg-brand-navy active:opacity-90',
    text: 'text-white',
  },
  outline: {
    container: 'border-2 border-border bg-surface active:bg-primary-light',
    text: 'text-text',
  },
  ghost: {
    container: 'bg-transparent active:bg-primary-light/60',
    text: 'text-primary',
  },
}

export function Button({
  variant = 'primary',
  label,
  loading = false,
  disabled,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const styles = variantStyles[variant]
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        'min-h-11 items-center justify-center rounded-xl px-5',
        styles.container,
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      <Text className={cn('font-sans-semibold text-base', styles.text, textClassName)}>
        {loading ? 'Aguarde...' : label}
      </Text>
    </Pressable>
  )
}
