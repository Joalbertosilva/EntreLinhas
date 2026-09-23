import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { PLATFORM_GRADIENT, PLATFORM_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { BookOpen, Bookmark, CheckCircle2 } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { TabScreenShell } from '@/components/layout/TabScreenShell'
import { LeituraRow } from '@/features/leituras/LeituraRow'
import type { MinhasLeiturasAgrupadas } from '@/features/leituras/useMinhasLeituras'
import { useMinhasLeituras } from '@/features/leituras/useMinhasLeituras'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useAuth } from '@/providers/AuthProvider'

type SectionKey = keyof MinhasLeiturasAgrupadas

const SECTIONS: Array<{
  key: SectionKey
  title: string
  description: string
  icon: typeof BookOpen
  color: string
  bg: string
  emptyTitle: string
  emptyHint: string
}> = [
  {
    key: 'em_andamento',
    title: 'Em andamento',
    description: 'Retome de onde parou',
    icon: BookOpen,
    color: '#1c756a',
    bg: '#e8f7f4',
    emptyTitle: 'Nada em andamento',
    emptyHint: 'Abra um livro na home ou em Explorar e inicie a leitura.',
  },
  {
    key: 'na_lista',
    title: 'Lista de leitura',
    description: 'Salvos para depois',
    icon: Bookmark,
    color: '#5a7282',
    bg: '#f0f4f6',
    emptyTitle: 'Lista vazia',
    emptyHint: 'Salve títulos para ler quando quiser.',
  },
  {
    key: 'concluido',
    title: 'Finalizadas',
    description: 'O que você já terminou',
    icon: CheckCircle2,
    color: '#15803d',
    bg: '#ecfdf3',
    emptyTitle: 'Nenhuma conclusão ainda',
    emptyHint: 'Marque uma leitura como concluída quando terminar.',
  },
]

export default function LeiturasScreen() {
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const { data, isLoading } = useMinhasLeituras(profile?.id)
  const tabPadding = 72 + Math.max(insets.bottom, 12)

  const total =
    (data?.em_andamento.length ?? 0) +
    (data?.na_lista.length ?? 0) +
    (data?.concluido.length ?? 0)

  return (
    <A11yScreen>
      <TabScreenShell>
        <LinearGradient
          colors={[...PLATFORM_GRADIENT]}
          locations={[...PLATFORM_GRADIENT_LOCATIONS]}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingTop: 12, paddingBottom: tabPadding }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
              className="mb-6 overflow-hidden rounded-2xl border border-sky-mid bg-white/90 p-5"
            >
            <Text className="font-sans-semibold text-xs uppercase tracking-wider text-text-muted">
              Sua biblioteca
            </Text>
            <Text className="mt-1 font-sans-bold text-2xl text-brand-navy">Minhas leituras</Text>
            <Text className="mt-2 font-sans text-sm leading-relaxed text-text-muted">
              {total > 0
                ? `${total} ${total === 1 ? 'título' : 'títulos'} entre leituras ativas, lista e concluídas.`
                : 'Organize leituras ativas, sua lista e o que já terminou — tudo num só lugar.'}
            </Text>

            {!isLoading && data ? (
              <View className="mt-4 flex-row gap-2">
                {SECTIONS.map((section) => {
                  const Icon = section.icon
                  const count = data[section.key].length
                  return (
                    <View
                      key={section.key}
                      className="min-w-0 flex-1 items-center rounded-xl p-3"
                      style={{ backgroundColor: section.bg }}
                    >
                      <Icon color={section.color} size={16} strokeWidth={1.75} />
                      <Text className="mt-1 font-sans-bold text-lg" style={{ color: section.color }}>
                        {count}
                      </Text>
                      <Text className="text-center font-sans-medium text-[10px] text-text-muted" numberOfLines={1}>
                        {section.title}
                      </Text>
                    </View>
                  )
                })}
              </View>
            ) : null}
          </View>

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#1c756a" size="large" />
              <Text className="mt-3 font-sans text-sm text-text-muted">Carregando sua biblioteca...</Text>
            </View>
          ) : (
            SECTIONS.map((section) => {
              const Icon = section.icon
              const items = data?.[section.key] ?? []

              return (
                <View key={section.key} style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-6">
                  <View className="mb-3 flex-row items-start justify-between">
                    <View className="flex-row items-start gap-2">
                      <View
                        className="mt-0.5 rounded-lg p-2"
                        style={{ backgroundColor: section.bg }}
                      >
                        <Icon color={section.color} size={16} strokeWidth={1.75} />
                      </View>
                      <View>
                        <Text className="font-sans-bold text-lg text-brand-navy">{section.title}</Text>
                        <Text className="font-sans text-sm text-text-muted">{section.description}</Text>
                      </View>
                    </View>
                    <Text className="font-sans-semibold text-sm text-text-muted">{items.length}</Text>
                  </View>

                  {items.length === 0 ? (
                    <View
                      className="rounded-2xl border border-dashed p-5"
                      style={{ borderColor: `${section.color}33`, backgroundColor: section.bg }}
                    >
                      <Text className="font-sans-semibold text-sm text-brand-navy">{section.emptyTitle}</Text>
                      <Text className="mt-1 font-sans text-sm text-text-muted">{section.emptyHint}</Text>
                    </View>
                  ) : (
                    items.map((item) => <LeituraRow key={item.id} item={item} />)
                  )}
                </View>
              )
            })
          )}
          </ScrollView>
        </LinearGradient>
      </TabScreenShell>
    </A11yScreen>
  )
}
