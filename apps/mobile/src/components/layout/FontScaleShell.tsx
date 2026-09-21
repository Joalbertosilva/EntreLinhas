import type { ReactNode } from 'react'
import { View, useWindowDimensions } from 'react-native'

interface FontScaleShellProps {
  multiplier: number
  children: ReactNode
}

/** Escala visualmente todo o app (menus, cards, leitura, abas). */
export function FontScaleShell({ multiplier, children }: FontScaleShellProps) {
  const { width, height } = useWindowDimensions()

  if (multiplier <= 1.001) {
    return <View style={{ flex: 1 }}>{children}</View>
  }

  const innerWidth = width / multiplier
  const innerHeight = height / multiplier

  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <View
        style={{
          width: innerWidth,
          minHeight: innerHeight,
          transform: [{ scale: multiplier }],
          transformOrigin: 'top left',
        }}
      >
        {children}
      </View>
    </View>
  )
}
