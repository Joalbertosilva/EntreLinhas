import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { Speakable } from '@/features/accessibility/Speakable'
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import {
  useConteudoDetail,
  useConteudoMateriais,
  useConteudoTemas,
} from '@/features/conteudos/useConteudos'
import {
  ConteudoComentariosSection,
  ConteudoCurtidasButton,
  ConteudoReflexoesSection,
} from '@/features/engagement/ConteudoEngagementSections'
import { LeituraActionsBar } from '@/features/leituras/LeituraActionsBar'
import { useLeiturasMap } from '@/features/leituras/useLeiturasMap'
import { BookPaginatedReader } from '@/features/reader/BookPaginatedReader'
import { buildBookPages } from '@/features/reader/bookPagination'
import { DETAIL_COVER_HEIGHT, SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { TIPO_CONTEUDO_LABEL, TIPO_MATERIAL_LABEL } from '@/lib/labels'
import { useAuth } from '@/providers/AuthProvider'

export default function ConteudoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()
  const { data, isLoading, isError } = useConteudoDetail(id)
  const { data: temas = [] } = useConteudoTemas(id)
  const { data: materiais = [] } = useConteudoMateriais(id)
  const { data: leiturasMap, isLoading: loadingLeitura } = useLeiturasMap(profile?.id)

  const isLivro = data?.tipo === 'livro'
  const leituraStatus = id ? (leiturasMap?.[id] ?? null) : null

  const metaSections = data
    ? [
        { label: 'Resumo', value: data.resumo },
        { label: 'Personagens', value: data.personagens },
        { label: 'Contexto', value: data.contexto },
        { label: 'Pontos importantes', value: data.pontos_importantes },
        { label: 'Curiosidades', value: data.curiosidades },
      ]
    : []

  const bookPages = data && isLivro ? buildBookPages(metaSections, data.conteudo_textual) : []

  const tipoLabel = data ? TIPO_CONTEUDO_LABEL[data.tipo as keyof typeof TIPO_CONTEUDO_LABEL] : ''
  const heroSpeakLabel = data
    ? [tipoLabel, data.titulo, data.autor ? `de ${data.autor}` : null].filter(Boolean).join('. ')
    : ''

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <A11yScreen>
        <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
          <View
            className="flex-row items-center gap-3 border-b border-border py-3"
            style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingRight: 56 }}
          >
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
              className="rounded-full p-2 active:bg-primary-light"
            >
              <ArrowLeft color="#1a3342" size={22} strokeWidth={1.75} />
            </Pressable>
            <Text className="min-w-0 flex-1 font-sans-semibold text-base text-brand-navy" numberOfLines={1}>
              {data?.titulo ?? 'Conteúdo'}
            </Text>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#1c756a" size="large" />
            </View>
          ) : isError || !data ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center font-sans text-base text-text-muted">
                Não foi possível carregar este conteúdo.
              </Text>
            </View>
          ) : (
            <ScrollView nestedScrollEnabled contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
              <LinearGradient
                colors={['#e8f7f4', '#fafefc', '#ffffff']}
                style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING, paddingTop: 28, paddingBottom: 24 }}
              >
                <Speakable label={heroSpeakLabel}>
                  {data.capa_url ? (
                    <View className="mb-5 items-center pt-2">
                      <Image
                        source={{ uri: data.capa_url }}
                        style={{ width: 128, height: DETAIL_COVER_HEIGHT, borderRadius: 12 }}
                        contentFit="cover"
                        accessibilityLabel={`Capa de ${data.titulo}`}
                      />
                    </View>
                  ) : null}

                  <Text className="font-sans-semibold text-xs uppercase tracking-wider text-primary">
                    {TIPO_CONTEUDO_LABEL[data.tipo as keyof typeof TIPO_CONTEUDO_LABEL]}
                  </Text>
                  <Text className="mt-1 font-sans-bold text-2xl leading-tight text-brand-navy">{data.titulo}</Text>
                  {data.autor ? (
                    <Text className="mt-1 font-sans text-base text-text-muted">{data.autor}</Text>
                  ) : null}

                  <View className="mt-4">
                    <ConteudoCurtidasButton
                      conteudoId={id!}
                      usuarioId={profile?.id}
                      curtidasCount={(data as { curtidas_count?: number }).curtidas_count ?? 0}
                    />
                  </View>
                </Speakable>
              </LinearGradient>

              {id ? (
                <LeituraActionsBar conteudoId={id} status={leituraStatus} loading={loadingLeitura} />
              ) : null}

              {bookPages.length > 0 && id ? (
                <View className="mt-6">
                  <Speakable
                    label="Leitura do livro"
                    style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                    className="mb-3"
                  >
                    <Text className="font-sans-bold text-lg text-brand-navy">Leitura</Text>
                  </Speakable>
                  <BookPaginatedReader pages={bookPages} conteudoId={id} titulo={data.titulo} />
                </View>
              ) : data.conteudo_textual ? (
                <Speakable
                  label={`Texto. ${data.conteudo_textual}`}
                  style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                  className="mt-5"
                >
                  <Text className="mb-2 font-sans-bold text-lg text-brand-navy">Texto</Text>
                  <Text className="font-sans text-base leading-relaxed text-text">{data.conteudo_textual}</Text>
                </Speakable>
              ) : data.resumo || data.descricao ? (
                <Speakable
                  label={data.resumo ?? data.descricao ?? ''}
                  style={{ paddingHorizontal: SCREEN_HORIZONTAL_PADDING }}
                  className="mt-5"
                >
                  <Text className="font-sans text-base leading-relaxed text-text">
                    {data.resumo ?? data.descricao}
                  </Text>
                </Speakable>
              ) : null}

              {materiais.length > 0 ? (
                <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mt-8">
                  <Text className="mb-3 font-sans-bold text-lg text-brand-navy">Materiais complementares</Text>
                  {materiais.map((m) => (
                    <Speakable
                      key={m.id}
                      label={`Material complementar. ${m.titulo}. ${TIPO_MATERIAL_LABEL[m.tipo as keyof typeof TIPO_MATERIAL_LABEL] ?? m.tipo}`}
                      className="mb-2"
                    >
                    <Pressable
                      onPress={() => (m.link ? void Linking.openURL(m.link) : undefined)}
                      className="flex-row items-center gap-3 rounded-2xl border border-border bg-white p-4 active:bg-primary-light/20"
                    >
                      <View className="rounded-xl bg-primary-light p-2">
                        <FileText color="#1c756a" size={18} />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="font-sans-semibold text-base text-text">{m.titulo}</Text>
                        <Text className="font-sans text-xs text-text-muted">
                          {TIPO_MATERIAL_LABEL[m.tipo as keyof typeof TIPO_MATERIAL_LABEL] ?? m.tipo}
                        </Text>
                      </View>
                      {m.link ? <ExternalLink color="#5a7282" size={16} /> : null}
                    </Pressable>
                    </Speakable>
                  ))}
                </View>
              ) : null}

              <ConteudoReflexoesSection conteudoId={id!} usuarioId={profile?.id} temas={temas} />
              <ConteudoComentariosSection conteudoId={id!} usuarioId={profile?.id} />
            </ScrollView>
          )}
        </View>
      </A11yScreen>
    </>
  )
}
