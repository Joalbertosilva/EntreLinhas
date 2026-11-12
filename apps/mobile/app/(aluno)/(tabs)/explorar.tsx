import { useLocalSearchParams } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Search } from 'lucide-react-native'
import type { TipoConteudo } from '@tcc-sistema/types'
import { ScreenPageHeader } from '@/components/layout/ScreenPageHeader'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { TabScreenShell, TabScrollView } from '@/components/layout/TabScreenShell'
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

const TIPOS_VALIDOS = new Set<TipoConteudo>(['livro', 'cronica', 'musica', 'poema', 'video'])

function FiltroChip({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: active ? '#1c756a' : '#ffffff',
        borderWidth: active ? 0 : 1,
        borderColor: '#d4ebe6',
      }}
    >
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_600SemiBold',
          fontSize: 14,
          color: active ? '#ffffff' : '#5a7282',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export default function ExplorarScreen() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>()
  const [filtro, setFiltro] = useState<FiltroExplorar>('todos')
  const [busca, setBusca] = useState('')

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
  const videosQuery = useConteudosByTipo('video')

  const byTipo: Partial<Record<TipoConteudo, typeof livrosQuery>> = {
    livro: livrosQuery,
    cronica: cronicasQuery,
    musica: musicasQuery,
    poema: poemasQuery,
    video: videosQuery,
  }

  const activeQuery = filtro === 'todos' ? todosQuery : (byTipo[filtro] ?? todosQuery)
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

  const sectionLabel = filtro === 'todos' ? 'Catálogo completo' : TIPO_CONTEUDO_LABEL[filtro]

  return (
    <A11yScreen>
      <TabScreenShell>
        <TabScrollView>
          <ScreenPageHeader
            eyebrow="Explorar"
            title="Catálogo"
            description="Livros, crônicas, poemas e músicas — escolha uma categoria ou veja tudo de uma vez."
          />

          <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, marginBottom: 16 }}>
            <Input
              icon={Search}
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por título ou autor..."
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
              paddingBottom: 12,
            }}
          >
            {FILTROS.map((chip) => (
              <FiltroChip
                key={chip.id}
                label={chip.label}
                active={filtro === chip.id}
                onPress={() => setFiltro(chip.id)}
              />
            ))}
          </View>

          <View
            style={{
              paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
              marginBottom: 16,
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
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

          {filtro === 'todos' || filtro === 'livro' ? (
            <View style={{ marginTop: 32 }}>
              <ObrasSectionRail />
            </View>
          ) : null}
        </TabScrollView>
      </TabScreenShell>
    </A11yScreen>
  )
}
