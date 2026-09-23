import { Heart } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { CommentComposerBox } from '@/components/ui/CommentComposerBox'
import {
  PublicCommentBubble,
  PublicCommentsEmptyState,
  PublicCommentsSectionShell,
} from '@/features/engagement/PublicCommentsUI'
import {
  useMinhaObraCurtida,
  useObraComentarios,
  usePublicarObraComentario,
  useToggleObraCurtida,
} from '@/features/engagement/useObraEngagement'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'

interface ObraEngagementSectionProps {
  obraId: string
  usuarioId: string | undefined
  curtidasCount: number
  scrollToEnd?: () => void
}

export function ObraEngagementSection({
  obraId,
  usuarioId,
  curtidasCount,
  scrollToEnd,
}: ObraEngagementSectionProps) {
  const { data: minha } = useMinhaObraCurtida(obraId, usuarioId)
  const toggle = useToggleObraCurtida(obraId, usuarioId)
  const { data: comentarios = [], isLoading } = useObraComentarios(obraId)
  const publicar = usePublicarObraComentario(obraId, usuarioId)
  const [texto, setTexto] = useState('')
  const curtido = Boolean(minha)

  const totalLabel =
    comentarios.length === 0
      ? 'Nenhum comentário ainda'
      : comentarios.length === 1
        ? '1 comentário'
        : `${comentarios.length} comentários`

  const handleComentar = async () => {
    if (!texto.trim()) {
      Alert.alert('Escreva algo', 'Escreva algo antes de publicar.')
      return
    }
    try {
      await publicar.mutateAsync(texto.trim())
      setTexto('')
    } catch {
      Alert.alert('Erro', 'Não foi possível publicar o comentário.')
    }
  }

  return (
    <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="pb-2">
      <View className="mb-5 flex-row flex-wrap items-center gap-3">
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

      <PublicCommentsSectionShell
        totalLabel={totalLabel}
        isLoading={isLoading}
        composer={
          usuarioId ? (
            <CommentComposerBox
              value={texto}
              onChangeText={setTexto}
              onFocus={scrollToEnd}
              onSubmit={() => void handleComentar()}
              submitting={publicar.isPending}
            />
          ) : undefined
        }
      >
        {comentarios.length > 0 ? (
          <View className="gap-4">
            {comentarios.map((c) => (
              <PublicCommentBubble
                key={c.id}
                nomeCompleto={c.profiles?.nome ?? 'Aluno'}
                texto={c.texto}
                createdAt={c.created_at}
                isMine={c.usuario_id === usuarioId}
              />
            ))}
          </View>
        ) : (
          <PublicCommentsEmptyState />
        )}
      </PublicCommentsSectionShell>
    </View>
  )
}
