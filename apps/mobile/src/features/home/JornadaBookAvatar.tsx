import { View } from 'react-native'

/** Anel dourado + livrinho aberto — paridade visual com `.jornada-card__avatar` na web. */
export function JornadaBookAvatar() {
  return (
    <View
      className="h-[58px] w-[58px] items-center justify-center rounded-full border-2 border-accent bg-white"
      style={{
        shadowColor: '#efb034',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="h-8 w-[34px] flex-row overflow-hidden rounded-[3px] border border-brand-navy/15">
        <View className="flex-1 bg-primary-light/90" />
        <View className="flex-1 border-l border-brand-navy/12 bg-white" />
      </View>
    </View>
  )
}
