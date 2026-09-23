import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { PLATFORM_GRADIENT, PLATFORM_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { Search } from 'lucide-react-native'
import type { TipoConteudo } from '@tcc-sistema/types'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { TabScreenShell } from '@/components/layout/TabScreenShell'
import { Input } from '@/components/ui/Input'
import { ContentGrid } from '@/features/conteudos/ContentGrid'
import { HOME_SECTIONS } from '@/features/conteudos/homeSections'
import { useAllConteudos, useConteudosByTipo } from '@/features/conteudos/useConteudos'
import { ObrasSectionRail } from '@/features/obras/ObrasSectionRail'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

type FiltroExplorar = 'todos' | TipoConteudo

const FILTROS: Array<{ id: FiltroExplorar; label: string }> = [
  { id: 'todos', label: 'Todos' },
  ...HOME_SECTIONS.filter((s) => s.id !== 'destaques').map((s) => ({
    id: s.tipo as TipoConteudo,
    label: s.title,
  })),
]

const TIPOS_VALIDOS = new Set<TipoConteudo>(['livro', 'cronica', 'musica', 'poema'])

export default function ExplorarScreen() {
  const insets = useSafeAreaInsets()
  const { tipo } = useLocalSearchParams<{ tipo?: string }>()
  const [filtro, setFiltro] = useState<FiltroExplorar>('todos')
  const [busca, setBusca] = useState('')
  const tabPadding = 72 + Math.max(insets.bottom, 12)

  useEffect(() => {
    if (tipo && TIPOS_VALIDOS.has(tipo as TipoConteudo)) {
      setFiltro(tipo as TipoConteudo)
    }
  }, [tipo])

  const todosQuery = useAllConteudos(48)
  const livrosQuery = useConteudosByTipo('livro')
  const cronicasQuery = useConteudosByTipo('cronica')
  const musicasQuery = useConteudosByTipo('musica')
  const poemasQuery = useConteudosByTipo('poema')

  const byTipo: Partial<Record<TipoConteudo, typeof livrosQuery>> = {
    livro: livrosQuery,
    cronica: cronicasQuery,
    musica: musicasQuery,
    poema: poemasQuery,
  }

  const activeQuery =
    filtro === 'todos' ? todosQuery : (byTipo[filtro] ?? todosQuery)
  const rawItems = activeQuery.data ?? []
  const items = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return rawItems
    return rawItems.filter(
      (item) =>
        item.titulo.toLowerCase().includes(q) ||
        (item.autor?.toLowerCase().includes(q) ?? false),
    )
  }, [rawItems, busca])
  const isLoading = activeQuery.isLoading

  const sectionLabel =
    filtro === 'todos' ? 'Catálogo completo' : TIPO_CONTEUDO_LABEL[filtro]

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
            <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-5">
            <Text className="font-sans-semibold text-xs uppercase tracking-wider text-text-muted">
              Explorar
            </Text>
            <Text className="mt-1 font-sans-bold text-2xl text-brand-navy">Catálogo</Text>
            <Text className="mt-2 font-sans text-sm leading-relaxed text-text-muted">
              Livros, crônicas, poemas e músicas — escolha uma categoria ou veja tudo de uma vez.
            </Text>
          </View>

          <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mb-4">
            <Input
              icon={Search}
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por título ou autor..."
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, gap: 8, paddingBottom: 16 }}
          >
            {FILTROS.map((chip) => {
              const active = filtro === chip.id
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => setFiltro(chip.id)}
                  className={`rounded-full px-4 py-2 ${active ? 'bg-primary' : 'border border-border bg-white'}`}
                >
                  <Text
                    className={`font-sans-semibold text-sm ${active ? 'text-white' : 'text-text-muted'}`}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>

          <View
            style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
            className="mb-4 flex-row items-center justify-between"
          >
            <Text className="font-sans-bold text-lg text-brand-navy">{sectionLabel}</Text>
            {!isLoading ? (
              <Text className="font-sans text-sm text-text-muted">
                {items.length} {items.length === 1 ? 'título' : 'títulos'}
              </Text>
            ) : null}
          </View>

          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#1c756a" size="large" />
              <Text className="mt-3 font-sans text-sm text-text-muted">Carregando catálogo...</Text>
            </View>
          ) : (
            <ContentGrid
              items={items}
              emptyMessage={`Ainda não há ${sectionLabel.toLowerCase()} disponíveis. Volte em breve!`}
            />
          )}

          {(filtro === 'todos' || filtro === 'livro') && (
            <View className="mt-8">
              <ObrasSectionRail />
            </View>
          )}
          </ScrollView>
        </LinearGradient>
      </TabScreenShell>
    </A11yScreen>
  )
}
