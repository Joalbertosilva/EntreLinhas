import { Heart, MessageCircle } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import {
  useMinhaObraCurtida,
  useObraComentarios,
  usePublicarObraComentario,
  useToggleObraCurtida,
} from '@/features/engagement/useObraEngagement'
import { formatRelativeTime } from '@/lib/formatRelativeTime'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface ObraEngagementSectionProps {
  obraId: string
  usuarioId: string | undefined
  curtidasCount: number
}

export function ObraEngagementSection({ obraId, usuarioId, curtidasCount }: ObraEngagementSectionProps) {
  const { data: minha } = useMinhaObraCurtida(obraId, usuarioId)
  const toggle = useToggleObraCurtida(obraId, usuarioId)
  const { data: comentarios = [], isLoading } = useObraComentarios(obraId)
  const publicar = usePublicarObraComentario(obraId, usuarioId)
  const [texto, setTexto] = useState('')
  const curtido = Boolean(minha)

  const handleComentar = async () => {
    if (!texto.trim()) return
    try {
      await publicar.mutateAsync(texto)
      setTexto('')
    } catch {
      Alert.alert('Erro', 'Não foi possível publicar o comentário.')
    }
  }

  return (
    <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mt-8">
      <View className="mb-4 flex-row flex-wrap items-center gap-3">
        {usuarioId ? (
          <Pressable
            onPress={() => toggle.mutate(curtido)}
            disabled={toggle.isPending}
            className="flex-row items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2"
          >
            <Heart color={curtido ? '#1c756a' : '#5a7282'} size={18} fill={curtido ? '#1c756a' : 'transparent'} />
            <Text className="font-sans-semibold text-sm text-brand-navy">
              {curtido ? 'Curtida' : 'Curtir obra'}
            </Text>
          </Pressable>
        ) : null}
        <Text className="font-sans text-sm text-text-muted">
          {curtidasCount} {curtidasCount === 1 ? 'curtida' : 'curtidas'}
        </Text>
      </View>

      <View className="mb-4 flex-row items-start gap-3">
        <View className="rounded-xl bg-primary-light p-2.5">
          <MessageCircle color="#1c756a" size={20} strokeWidth={1.75} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-bold text-lg text-brand-navy">Comentários</Text>
          <Text className="mt-0.5 font-sans text-sm text-text-muted">Converse sobre esta obra da comunidade.</Text>
        </View>
      </View>

      {usuarioId ? (
        <View className="mb-4 rounded-2xl border border-border bg-white p-4">
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva um comentário…"
            placeholderTextColor="#5a7282"
            multiline
            className="min-h-[80px] font-sans text-base text-text"
          />
          <Pressable
            onPress={() => void handleComentar()}
            disabled={publicar.isPending || !texto.trim()}
            className="mt-3 self-end rounded-full bg-primary px-4 py-2 disabled:opacity-50"
          >
            <Text className="font-sans-semibold text-sm text-white">Publicar</Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color="#1c756a" />
      ) : comentarios.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-primary/20 p-5">
          <Text className="text-center font-sans text-sm text-text-muted">Nenhum comentário ainda.</Text>
        </View>
      ) : (
        comentarios.map((c) => (
          <View key={c.id} className="mb-3 rounded-2xl border border-border bg-white p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-sans-semibold text-sm text-brand-navy">{c.profiles?.nome ?? 'Aluno'}</Text>
              <Text className="font-sans text-xs text-text-muted">{formatRelativeTime(c.created_at)}</Text>
            </View>
            <Text className="font-sans text-base leading-relaxed text-text">{c.texto}</Text>
          </View>
        ))
      )}
    </View>
  )
}
