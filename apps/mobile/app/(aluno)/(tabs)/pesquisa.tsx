import { useMemo, useRef, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { PLATFORM_GRADIENT, PLATFORM_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { Search } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { TabScreenShell } from '@/components/layout/TabScreenShell'
import { ContentGrid } from '@/features/conteudos/ContentGrid'
import { useAllConteudos } from '@/features/conteudos/useConteudos'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

export default function PesquisaScreen() {
  const insets = useSafeAreaInsets()
  const inputRef = useRef<TextInput>(null)
  const [busca, setBusca] = useState('')
  const tabPadding = 72 + Math.max(insets.bottom, 12)

  const { data: catalogo = [], isLoading } = useAllConteudos(80)

  const items = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return []
    return catalogo.filter(
      (item) =>
        item.titulo.toLowerCase().includes(q) ||
        (item.autor?.toLowerCase().includes(q) ?? false),
    )
  }, [catalogo, busca])

  const queryAtiva = busca.trim().length > 0

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
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-5">
              <Text className="font-sans-bold text-2xl text-brand-navy">Pesquisar</Text>
              <Text className="mt-1 font-sans text-sm text-text-muted">
                Encontre livros, crônicas, poemas e músicas por título ou autor.
              </Text>
            </View>

            <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-5">
              <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-white px-3 py-1">
                <Search color="#5a7282" size={20} strokeWidth={1.75} />
                <TextInput
                  ref={inputRef}
                  value={busca}
                  onChangeText={setBusca}
                  placeholder="Buscar por título ou autor..."
                  placeholderTextColor="#5a7282"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  returnKeyType="search"
                  className="min-h-[44px] flex-1 font-sans text-base text-text"
                />
              </View>
            </View>

            {!queryAtiva ? (
              <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="py-8">
                <Text className="text-center font-sans text-sm text-text-muted">
                  Digite para buscar no catálogo completo.
                </Text>
              </View>
            ) : isLoading ? (
              <View className="items-center py-12">
                <ActivityIndicator color="#1c756a" size="large" />
                <Text className="mt-3 font-sans text-sm text-text-muted">Buscando...</Text>
              </View>
            ) : (
              <>
                <View
                  style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                  className="mb-4 flex-row items-center justify-between"
                >
                  <Text className="font-sans-bold text-lg text-brand-navy">Resultados</Text>
                  <Text className="font-sans text-sm text-text-muted">
                    {items.length} {items.length === 1 ? 'título' : 'títulos'}
                  </Text>
                </View>
                <ContentGrid
                  items={items}
                  emptyMessage={`Nenhum resultado para "${busca.trim()}". Tente outro termo.`}
                />
              </>
            )}
          </ScrollView>
        </LinearGradient>
      </TabScreenShell>
    </A11yScreen>
  )
}
