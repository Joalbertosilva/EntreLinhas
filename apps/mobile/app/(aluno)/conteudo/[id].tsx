import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useConteudoDetail } from '@/features/conteudos/useConteudos'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'

export default function ConteudoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { data, isLoading, isError } = useConteudoDetail(id)

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            className="rounded-full p-2 active:bg-primary-light"
          >
            <ArrowLeft color="#1a3342" size={22} strokeWidth={1.75} />
          </Pressable>
          <Text className="flex-1 font-sans-semibold text-base text-brand-navy" numberOfLines={1}>
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
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
            {data.capa_url ? (
              <Image
                source={{ uri: data.capa_url }}
                style={{ width: '100%', height: 280 }}
                contentFit="cover"
                accessibilityLabel={`Capa de ${data.titulo}`}
              />
            ) : null}

            <View className="gap-2 px-5 pt-5">
              <Text className="font-sans-bold text-2xl text-brand-navy">{data.titulo}</Text>
              {data.autor ? (
                <Text className="font-sans text-base text-text-muted">{data.autor}</Text>
              ) : null}
              <Text className="font-sans-medium text-xs uppercase tracking-wide text-primary">
                {TIPO_CONTEUDO_LABEL[data.tipo as keyof typeof TIPO_CONTEUDO_LABEL]}
              </Text>
            </View>

            {data.conteudo_textual ? (
              <Text className="mt-6 px-5 font-sans text-base leading-relaxed text-text">
                {data.conteudo_textual}
              </Text>
            ) : data.resumo || data.descricao ? (
              <Text className="mt-6 px-5 font-sans text-base leading-relaxed text-text">
                {data.resumo ?? data.descricao}
              </Text>
            ) : (
              <View className="mx-5 mt-6 rounded-2xl border border-primary/15 bg-primary-light/40 p-5">
                <Text className="font-sans text-base leading-relaxed text-text-muted">
                  O leitor completo chegará em breve no app. Por enquanto, você pode abrir este
                  conteúdo na plataforma web.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </>
  )
}
