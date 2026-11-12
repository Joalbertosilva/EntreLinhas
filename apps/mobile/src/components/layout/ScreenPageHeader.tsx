import type { ReactNode } from 'react'
import { Text, View, type StyleProp, type ViewStyle } from 'react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { cn } from '@/lib/cn'

interface ScreenPageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  speakLabel?: string
  /** Painel branco com borda suave (como cards intro da web). */
  variant?: 'plain' | 'panel'
  trailing?: ReactNode
  children?: ReactNode
  className?: string
  style?: StyleProp<ViewStyle>
}

export function ScreenPageHeader({
  eyebrow,
  title,
  description,
  speakLabel,
  variant = 'plain',
  trailing,
  children,
  className,
  style,
}: ScreenPageHeaderProps) {
  const label = speakLabel ?? [eyebrow, title, description].filter(Boolean).join('. ')

  const inner = (
    <>
      {eyebrow ? (
        <Text className="font-sans-semibold text-xs uppercase tracking-wider text-text-muted">{eyebrow}</Text>
      ) : null}
      <View className="mt-0.5 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="font-sans-bold text-2xl leading-tight text-brand-navy">{title}</Text>
          {description ? (
            <Text className="mt-2 font-sans text-sm leading-relaxed text-text-muted">{description}</Text>
          ) : null}
        </View>
        {trailing}
      </View>
      {children}
    </>
  )

  return (
    <Speakable
      label={label}
      style={[{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }, style]}
      className={cn(variant === 'panel' ? 'mb-6' : 'mb-5', className)}
    >
      {variant === 'panel' ? (
        <View className="overflow-hidden rounded-2xl border border-primary/10 bg-white/90 p-5 shadow-sm">
          <View className="absolute left-0 right-0 top-0 h-1 bg-accent/90" />
          {inner}
        </View>
      ) : (
        inner
      )}
    </Speakable>
  )
}

interface ScreenSectionHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}

export function ScreenSectionHeader({ title, subtitle, action, className }: ScreenSectionHeaderProps) {
  return (
    <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className={cn('mb-3', className)}>
      <Speakable label={[title, subtitle].filter(Boolean).join('. ')} className="min-w-0">
        <View className="flex-row flex-wrap items-center gap-x-2.5 gap-y-1">
          <Text className="font-sans-bold text-lg text-brand-navy">{title}</Text>
          {action}
        </View>
        {subtitle ? <Text className="mt-0.5 font-sans text-sm leading-relaxed text-text-muted">{subtitle}</Text> : null}
      </Speakable>
    </View>
  )
}
