import { Text, type TextProps } from 'react-native'

interface A11yTextProps extends TextProps {
  /** Tamanho base em px — a escala global de acessibilidade é aplicada automaticamente. */
  size?: number
  lineHeightRatio?: number
}

export function A11yText({ size, lineHeightRatio = 1.55, style, ...props }: A11yTextProps) {
  const baseStyle =
    size != null
      ? {
          fontSize: size,
          lineHeight: Math.round(size * lineHeightRatio),
        }
      : undefined

  return <Text {...props} style={[baseStyle, style]} />
}

/** @deprecated A escala global já é aplicada via Text — use o tamanho base desejado. */
export function useA11yFontSize(baseSize: number) {
  return baseSize
}
