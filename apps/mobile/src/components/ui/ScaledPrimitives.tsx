import { useEffect, useReducer } from 'react'
import {
  Text as RNText,
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps,
  type TextProps,
} from 'react-native-original'
import {
  getFontMultiplier,
  subscribeFontMultiplier,
} from '@/features/accessibility/accessibilityFontScale'

const CLASS_FONT_SIZES: Array<[RegExp, number]> = [
  [/\btext-\[11px\]/, 11],
  [/\btext-\[10px\]/, 10],
  [/\btext-2xl\b/, 24],
  [/\btext-xl\b/, 20],
  [/\btext-lg\b/, 18],
  [/\btext-base\b/, 16],
  [/\btext-sm\b/, 14],
  [/\btext-xs\b/, 12],
]

function inferBaseFontSize(className?: string, style?: TextProps['style']) {
  const flat = StyleSheet.flatten(style)
  if (flat && typeof flat.fontSize === 'number') return flat.fontSize
  if (!className) return undefined
  for (const [pattern, size] of CLASS_FONT_SIZES) {
    if (pattern.test(className)) return size
  }
  if (/\bfont-sans/.test(className)) return 16
  if (/\btext-text/.test(className) || /\btext-brand/.test(className) || /\btext-primary/.test(className)) {
    return 16
  }
  return 16
}

export function scaleTypographyStyle(
  style: TextProps['style'],
  className?: string,
): TextProps['style'] {
  const multiplier = getFontMultiplier()
  if (multiplier === 1) return style

  const baseSize = inferBaseFontSize(className, style)
  if (!baseSize) return style

  const flat = StyleSheet.flatten(style)
  const scaled = {
    fontSize: Math.round(baseSize * multiplier),
    lineHeight: Math.round(
      (typeof flat?.lineHeight === 'number' ? flat.lineHeight : baseSize * 1.55) * multiplier,
    ),
  }

  return [style, scaled]
}

function useFontScaleTick() {
  const [, tick] = useReducer((value: number) => value + 1, 0)
  useEffect(() => {
    const unsubscribe = subscribeFontMultiplier(tick)
    return () => {
      unsubscribe()
    }
  }, [tick])
}

type ScaledTextProps = TextProps & { className?: string }

export function Text(props: ScaledTextProps) {
  useFontScaleTick()
  const { className, style, ...rest } = props
  return <RNText {...rest} className={className} style={scaleTypographyStyle(style, className)} />
}

type ScaledTextInputProps = TextInputProps & { className?: string }

export function TextInput(props: ScaledTextInputProps) {
  useFontScaleTick()
  const { className, style, ...rest } = props
  return (
    <RNTextInput {...rest} className={className} style={scaleTypographyStyle(style, className)} />
  )
}
