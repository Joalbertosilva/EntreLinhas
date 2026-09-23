import { Stack, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import { useRef } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { BookOpen, Heart, PenLine } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ObraEngagementSection } from '@/features/engagement/ObraEngagementSection'
import { useObraPublica } from '@/features/obras/useObraPublica'
import { useAuth } from '@/providers/AuthProvider'
import { BookPaginatedReader } from '@/features/reader/BookPaginatedReader'
import { buildObraBookPages, getObraPageStorageKey } from '@/features/reader/bookPagination'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { ScreenBackHeader } from '@/components/layout/ScreenBackHeader'
import { capaImageUri } from '@/lib/imageUrl'
import { DETAIL_COVER_HEIGHT, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useKeyboardAwareScroll } from '@/lib/useKeyboardAwareScroll'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'

export default function ObraDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const { data, isLoading, isError } = useObraPublica(id)
  const scrollRef = useRef<ScrollView>(null)
  const scrollViewportRef = useRef<View>(null)
  const { scrollPaddingBottom, scrollToEnd } = useKeyboardAwareScroll(scrollRef, scrollViewportRef)

  const bookPages =
    data?.capitulos
      ? buildObraBookPages(
          data.capitulos.map((c) => ({
            id: c.id,
            ordem: c.ordem,
            titulo: c.titulo,
            texto: c.texto,
          })),
        )
      : []

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <A11yScreen>
        <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
          <ScreenBackHeader title={data?.titulo ?? 'Obra'} />

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#1c756a" size="large" />
            </View>
          ) : isError || !data ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center font-sans text-base text-text-muted">
                Não foi possível carregar esta obra.
              </Text>
            </View>
          ) : (
              <View ref={scrollViewportRef} className="flex-1">
              <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                contentContainerStyle={{ paddingBottom: insets.bottom + scrollPaddingBottom }}
              >
                <View
                  className="items-center bg-accent-light/40 py-6"
                  style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                >
                  <View className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
                    {data.capa_url ? (
                      <Image
                        source={{ uri: capaImageUri(data.capa_url, data.updated_at) }}
                        style={{ width: 120, height: DETAIL_COVER_HEIGHT }}
                        contentFit="cover"
                        recyclingKey={capaImageUri(data.capa_url, data.updated_at)}
                      />
                    ) : (
                      <View
                        style={{ width: 120, height: DETAIL_COVER_HEIGHT }}
                        className="items-center justify-center bg-primary-light"
                      >
                        <PenLine color="#1c756a" size={28} strokeWidth={1.5} />
                      </View>
                    )}
                  </View>
                </View>

                <View style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }} className="gap-2 pt-5">
                  <Text className="font-sans-semibold text-xs uppercase tracking-wider text-accent-hover">
                    Obra da comunidade
                  </Text>
                  <Text className="font-sans-bold text-xl text-brand-navy">{data.titulo}</Text>
                  {data.autorNome ? (
                    <Text className="font-sans text-base text-text-muted">por {data.autorNome}</Text>
                  ) : null}
                  <View className="mt-1 flex-row flex-wrap items-center gap-3">
                    <Text className="font-sans-medium text-xs uppercase tracking-wide text-primary">
                      {TIPO_OBRA_LABEL[data.tipo]}
                    </Text>
                    {data.curtidas_count > 0 ? (
                      <View className="flex-row items-center gap-1">
                        <Heart color="#1c756a" size={14} fill="#1c756a" />
                        <Text className="font-sans text-xs text-text-muted">{data.curtidas_count}</Text>
                      </View>
                    ) : null}
                    {data.capitulos.length > 0 ? (
                      <View className="flex-row items-center gap-1">
                        <BookOpen color="#5a7282" size={14} strokeWidth={1.75} />
                        <Text className="font-sans text-xs text-text-muted">
                          {data.capitulos.length}{' '}
                          {data.capitulos.length === 1 ? 'capítulo' : 'capítulos'}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {data.descricao ? (
                  <Text
                    style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                    className="mt-4 font-sans text-base leading-relaxed text-text-muted"
                  >
                    {data.descricao}
                  </Text>
                ) : null}

                {bookPages.length > 0 && id ? (
                  <View className="mt-6">
                    <Text
                      style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                      className="mb-3 font-sans-bold text-lg text-brand-navy"
                    >
                      Leitura
                    </Text>
                    <BookPaginatedReader
                      pages={bookPages}
                      conteudoId={id}
                      titulo={data.titulo}
                      storageKey={getObraPageStorageKey(id)}
                    />
                  </View>
                ) : (
                  <View
                    style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
                    className="mt-6 rounded-2xl border border-primary/15 bg-primary-light/40 p-5"
                  >
                    <Text className="font-sans text-base leading-relaxed text-text-muted">
                      Esta obra ainda não tem capítulos publicados.
                    </Text>
                  </View>
                )}

                {id ? (
                  <ObraEngagementSection
                    obraId={id}
                    usuarioId={profile?.id}
                    curtidasCount={data.curtidas_count}
                    scrollToEnd={scrollToEnd}
                  />
                ) : null}
              </ScrollView>
              </View>
          )}
        </View>
      </A11yScreen>
    </>
  )
}
