import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Pressable, Text, View } from 'react-native'
import type { StatusLeitura } from '@tcc-sistema/types'
import { ContentCardLeituraMenu } from '@/features/leituras/ContentCardLeituraMenu'
import type { LeituraComConteudo } from '@/features/leituras/useMinhasLeituras'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'

const STATUS_LABEL: Record<StatusLeitura, string> = {
  em_andamento: 'Em andamento',
  na_lista: 'Na lista',
  concluido: 'Concluída',
}

const STATUS_COLOR: Record<StatusLeitura, string> = {
  em_andamento: '#1c756a',
  na_lista: '#5a7282',
  concluido: '#15803d',
}

interface LeituraRowProps {
  item: LeituraComConteudo
}

export function LeituraRow({ item }: LeituraRowProps) {
  const router = useRouter()

  return (
    <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-border bg-white p-3">
      <Pressable
        onPress={() => router.push(`/(aluno)/conteudo/${item.conteudo.id}`)}
        className="min-w-0 flex-1 flex-row gap-3 active:opacity-80"
      >
        <View className="h-[72px] w-[54px] overflow-hidden rounded-lg bg-primary-light">
          {item.conteudo.capa_url ? (
            <Image source={{ uri: item.conteudo.capa_url }} style={{ width: 54, height: 72 }} contentFit="cover" />
          ) : null}
        </View>
        <View className="min-w-0 flex-1 justify-center">
          <Text className="font-sans-semibold text-base text-text" numberOfLines={2}>
            {item.conteudo.titulo}
          </Text>
          {item.conteudo.autor ? (
            <Text className="mt-0.5 font-sans text-sm text-text-muted" numberOfLines={1}>
              {item.conteudo.autor}
            </Text>
          ) : null}
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <Text
              className="rounded-full px-2 py-0.5 font-sans-medium text-[10px] uppercase text-white"
              style={{ backgroundColor: STATUS_COLOR[item.status_leitura] }}
            >
              {STATUS_LABEL[item.status_leitura]}
            </Text>
            <Text className="font-sans text-[10px] uppercase text-text-muted">
              {TIPO_CONTEUDO_LABEL[item.conteudo.tipo]}
            </Text>
          </View>
        </View>
      </Pressable>
      {item.conteudo.tipo === 'livro' ? (
        <ContentCardLeituraMenu
          conteudoId={item.conteudo.id}
          status={item.status_leitura}
          variant="list"
        />
      ) : null}
    </View>
  )
}
