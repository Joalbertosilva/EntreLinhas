import type { InteracaoComAutor, Tema } from '@tcc-sistema/types'
import { Heart, Lock, Volume2, VolumeX } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { A11yText, useA11yFontSize } from '@/components/ui/A11yText'
import { CommentComposerBox } from '@/components/ui/CommentComposerBox'
import {
  PublicCommentBubble,
  PublicCommentsEmptyState,
  PublicCommentsSectionShell,
} from '@/features/engagement/PublicCommentsUI'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useSpeechContext } from '@/features/accessibility/SpeechProvider'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import {
  useComentariosPublicos,
  useExcluirInteracao,
  useMinhaCurtida,
  useMinhasInteracoes,
  useSalvarInteracao,
  useToggleCurtida,
} from '@/features/engagement/useConteudoEngagement'
import { getReflexaoDisplay } from '@/lib/conteudoReflexao'

interface ConteudoEngagementSectionsProps {
  conteudoId: string
  usuarioId: string | undefined
  temas: Tema[]
  curtidasCount?: number
}

export function ConteudoCurtidasButton({
  conteudoId,
  usuarioId,
  curtidasCount = 0,
}: {
  conteudoId: string
  usuarioId: string | undefined
  curtidasCount?: number
}) {
  const { data: minha } = useMinhaCurtida(conteudoId, usuarioId)
  const toggle = useToggleCurtida(conteudoId, usuarioId)
  const curtido = Boolean(minha)

  if (!usuarioId) return null

  return (
    <Pressable
      onPress={() => toggle.mutate(curtido)}
      disabled={toggle.isPending}
      className="flex-row items-center gap-2 self-start rounded-full border border-primary/20 bg-white px-4 py-2 active:bg-primary-light"
    >
      <Heart color={curtido ? '#1c756a' : '#5a7282'} size={18} fill={curtido ? '#1c756a' : 'transparent'} />
      <Text className="font-sans-semibold text-sm text-brand-navy">
        {curtido ? 'Curtido' : 'Curtir'}
        {curtidasCount > 0 ? ` · ${curtidasCount}` : ''}
      </Text>
    </Pressable>
  )
}

export function ConteudoReflexoesSection({
  conteudoId,
  usuarioId,
  temas,
  scrollFieldIntoView,
}: Pick<ConteudoEngagementSectionsProps, 'conteudoId' | 'usuarioId' | 'temas'> & {
  scrollFieldIntoView?: (inputRef: View | null) => void
}) {
  const temasComFrase = temas.filter((t) => t.questionamento?.trim())
  if (!temasComFrase.length) return null

  return (
    <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mt-8">
      <View className="mb-4 flex-row items-start gap-3">
        <View className="rounded-xl bg-accent-light p-2.5">
          <Lock color="#1a3342" size={20} strokeWidth={1.75} />
        </View>
        <View className="min-w-0 flex-1 pr-12">
          <A11yText size={18} className="font-sans-bold text-brand-navy">
            Sua reflexão
          </A11yText>
          <A11yText size={14} className="mt-0.5 font-sans text-text-muted">
            Só você e a equipe leem — escreva com calma, no seu ritmo.
          </A11yText>
        </View>
      </View>
      {temasComFrase.map((tema) => (
        <ReflexaoCard
          key={tema.id}
          conteudoId={conteudoId}
          usuarioId={usuarioId}
          tema={tema}
          scrollFieldIntoView={scrollFieldIntoView}
        />
      ))}
    </View>
  )
}

function ReflexaoCard({
  conteudoId,
  usuarioId,
  tema,
  scrollFieldIntoView,
}: {
  conteudoId: string
  usuarioId: string | undefined
  tema: Tema
  scrollFieldIntoView?: (inputRef: View | null) => void
}) {
  const { data: minhas = [] } = useMinhasInteracoes(conteudoId, usuarioId)
  const salvar = useSalvarInteracao(conteudoId, usuarioId)
  const excluir = useExcluirInteracao(conteudoId, usuarioId)
  const inputWrapRef = useRef<View>(null)
  const existente = minhas.find((i) => i.tipo_interacao === 'reflexao_orientada' && i.tema_id === tema.id)
  const [texto, setTexto] = useState('')

  useEffect(() => {
    setTexto(existente?.texto ?? '')
  }, [existente?.texto, existente?.id])

  const { frase, reflexao, pergunta, rotulo } = getReflexaoDisplay(tema)
  const { audioEnabled } = useAccessibility()
  const { speak, stop, isSpeaking } = useSpeechContext()
  const inputFontSize = useA11yFontSize(16)

  const textoParaOuvir = [frase, reflexao, pergunta].filter(Boolean).join('. ')

  const handleOuvir = () => {
    if (isSpeaking) {
      void stop()
      return
    }
    void speak(textoParaOuvir)
  }

  const handleSave = async () => {
    if (!texto.trim()) {
      Alert.alert('Escreva algo', 'Escreva sua reflexão antes de salvar.')
      return
    }
    try {
      await salvar.mutateAsync({
        id: existente?.id,
        tipo_interacao: 'reflexao_orientada',
        tema_id: tema.id,
        texto,
      })
      Alert.alert('Salvo', existente ? 'Reflexão atualizada.' : 'Reflexão salva.')
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar sua reflexão.')
    }
  }

  const handleExcluir = () => {
    if (!existente?.id) return
    Alert.alert('Excluir reflexão', 'Sua resposta privada será removida. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await excluir.mutateAsync(existente.id)
              setTexto('')
              Alert.alert('Removida', 'Sua reflexão foi excluída.')
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir sua reflexão.')
            }
          })()
        },
      },
    ])
  }

  const handleInputFocus = () => {
    scrollFieldIntoView?.(inputWrapRef.current)
  }

  return (
    <View className="mb-4 rounded-2xl border border-primary/15 bg-white">
      <View className="h-1 rounded-t-2xl bg-primary" />
      <View className="w-full gap-4 p-4">
        <View className="w-full flex-row flex-wrap items-center gap-2">
          <A11yText size={11} className="font-sans-semibold uppercase tracking-wide text-primary">
            {rotulo}
          </A11yText>
          {audioEnabled !== false && textoParaOuvir ? (
            <Pressable
              onPress={handleOuvir}
              accessibilityRole="button"
              accessibilityLabel={isSpeaking ? 'Parar leitura em voz alta' : 'Ouvir reflexão em voz alta'}
              className="flex-row items-center gap-1 rounded-full border border-primary/20 bg-primary-light/40 px-2.5 py-1 active:opacity-80"
            >
              {isSpeaking ? (
                <VolumeX color="#1c756a" size={14} strokeWidth={1.75} />
              ) : (
                <Volume2 color="#1c756a" size={14} strokeWidth={1.75} />
              )}
              <A11yText size={11} className="font-sans-semibold text-primary">
                {isSpeaking ? 'Parar' : 'Ouvir'}
              </A11yText>
            </Pressable>
          ) : null}
        </View>

        <View className="w-full rounded-xl bg-primary-light/50 px-4 py-4">
          <A11yText size={16} className="w-full shrink font-sans-medium text-brand-navy">
            &ldquo;{frase}&rdquo;
          </A11yText>
        </View>

        {reflexao ? (
          <View className="w-full rounded-xl border border-accent/25 bg-accent-light/25 px-4 py-4">
            <A11yText size={11} className="font-sans-semibold uppercase tracking-wide text-[#5c4800]">
              Reflexão
            </A11yText>
            <A11yText size={16} className="mt-2 w-full shrink font-sans text-text">
              {reflexao}
            </A11yText>
          </View>
        ) : null}

        {pergunta ? (
          <View className="w-full">
            <A11yText size={11} className="font-sans-semibold uppercase tracking-wide text-primary">
              Pergunta
            </A11yText>
            <A11yText size={16} className="mt-2 w-full shrink font-sans-semibold text-text">
              {pergunta}
            </A11yText>
          </View>
        ) : null}

        <View ref={inputWrapRef} collapsable={false} className="w-full border-t border-border/50 pt-4">
          <A11yText size={14} className="mb-2 font-sans-medium text-text">
            Sua resposta
          </A11yText>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            onFocus={handleInputFocus}
            placeholder="Escreva aqui o que você pensa e sente..."
            placeholderTextColor="#5a7282"
            multiline
            textAlignVertical="top"
            style={{
              fontSize: inputFontSize,
              lineHeight: Math.round(inputFontSize * 1.5),
              paddingVertical: Platform.OS === 'ios' ? 12 : 10,
              minHeight: 100,
            }}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-sans text-text"
          />
          <A11yText size={12} className="mt-2 font-sans text-text-muted">
            Não existe resposta certa ou errada — o importante é o que a leitura significa para você.
          </A11yText>
        </View>

        <View className="flex-row flex-wrap items-center gap-2">
          <Pressable
            onPress={() => void handleSave()}
            disabled={salvar.isPending || excluir.isPending}
            className="rounded-full bg-primary px-4 py-2 active:opacity-90"
          >
            {salvar.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <A11yText size={14} className="font-sans-semibold text-white">
                {existente ? 'Atualizar resposta' : 'Salvar resposta'}
              </A11yText>
            )}
          </Pressable>
          {existente ? (
            <Pressable
              onPress={handleExcluir}
              disabled={salvar.isPending || excluir.isPending}
              className="rounded-full border border-error/30 bg-white px-4 py-2 active:bg-red-50"
            >
              {excluir.isPending ? (
                <ActivityIndicator color="#dc2626" size="small" />
              ) : (
                <A11yText size={14} className="font-sans-semibold text-error">
                  Excluir
                </A11yText>
              )}
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  )
}

export function ConteudoComentariosSection({
  conteudoId,
  usuarioId,
  scrollToEnd,
}: Pick<ConteudoEngagementSectionsProps, 'conteudoId' | 'usuarioId'> & {
  scrollToEnd?: () => void
}) {
  const { data: comentarios = [], isLoading } = useComentariosPublicos(conteudoId)
  const salvar = useSalvarInteracao(conteudoId, usuarioId)
  const excluir = useExcluirInteracao(conteudoId, usuarioId)
  const [novoTexto, setNovoTexto] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTexto, setEditTexto] = useState('')

  const handlePublicar = async () => {
    if (!novoTexto.trim()) {
      Alert.alert('Escreva algo', 'Escreva algo antes de publicar.')
      return
    }
    try {
      await salvar.mutateAsync({ tipo_interacao: 'comentario_livre', texto: novoTexto.trim() })
      setNovoTexto('')
    } catch {
      Alert.alert('Erro', 'Não foi possível publicar o comentário.')
    }
  }

  const comentariosOrdenados = [...comentarios].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const totalLabel =
    comentarios.length === 0
      ? 'Nenhum comentário ainda'
      : comentarios.length === 1
        ? '1 comentário'
        : `${comentarios.length} comentários`

  const iniciarEdicao = (comentario: InteracaoComAutor) => {
    setEditandoId(comentario.id)
    setEditTexto(comentario.texto)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setEditTexto('')
  }

  const handleExcluirComentario = (comentario: InteracaoComAutor) => {
    Alert.alert('Excluir comentário', 'Seu comentário público será removido. Deseja continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await excluir.mutateAsync(comentario.id)
              if (editandoId === comentario.id) cancelarEdicao()
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o comentário.')
            }
          })()
        },
      },
    ])
  }

  const handleSalvarEdicao = async () => {
    if (!editandoId || !editTexto.trim()) {
      Alert.alert('Comentário vazio', 'O comentário não pode ficar vazio.')
      return
    }
    try {
      await salvar.mutateAsync({
        id: editandoId,
        tipo_interacao: 'comentario_livre',
        texto: editTexto.trim(),
      })
      cancelarEdicao()
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o comentário.')
    }
  }

  return (
    <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="pb-2">
      <PublicCommentsSectionShell
        totalLabel={totalLabel}
        isLoading={isLoading}
        composer={
          usuarioId ? (
            <CommentComposerBox
              value={novoTexto}
              onChangeText={setNovoTexto}
              onFocus={scrollToEnd}
              onSubmit={() => void handlePublicar()}
              submitting={salvar.isPending}
            />
          ) : undefined
        }
      >
        {comentariosOrdenados.length > 0 ? (
          <View className="gap-4">
            {comentariosOrdenados.map((c) => (
              <ComentarioPublicoCard
                key={c.id}
                comentario={c}
                isMine={c.usuario_id === usuarioId}
                editando={editandoId === c.id}
                editTexto={editTexto}
                onEditTexto={setEditTexto}
                onIniciarEdicao={() => iniciarEdicao(c)}
                onCancelarEdicao={cancelarEdicao}
                onSalvarEdicao={() => void handleSalvarEdicao()}
                onExcluir={() => handleExcluirComentario(c)}
                excluindo={excluir.isPending}
                salvando={salvar.isPending}
                onInputFocus={scrollToEnd}
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

function ComentarioPublicoCard({
  comentario,
  isMine = false,
  editando = false,
  editTexto = '',
  onEditTexto,
  onIniciarEdicao,
  onCancelarEdicao,
  onSalvarEdicao,
  onExcluir,
  excluindo = false,
  salvando = false,
  onInputFocus,
}: {
  comentario: InteracaoComAutor
  isMine?: boolean
  editando?: boolean
  editTexto?: string
  onEditTexto?: (v: string) => void
  onIniciarEdicao?: () => void
  onCancelarEdicao?: () => void
  onSalvarEdicao?: () => void
  onExcluir?: () => void
  excluindo?: boolean
  salvando?: boolean
  onInputFocus?: () => void
}) {
  const nomeCompleto = comentario.profiles?.nome ?? 'Aluno'

  if (editando) {
    return (
      <View>
        <CommentComposerBox
          value={editTexto ?? ''}
          onChangeText={(t) => onEditTexto?.(t)}
          onFocus={onInputFocus}
          onSubmit={() => onSalvarEdicao?.()}
          submitting={salvando}
          placeholder="Edite seu comentário"
          compact
        />
        <Pressable onPress={onCancelarEdicao} disabled={salvando} className="mt-2 self-start px-1 py-1">
          <Text className="font-sans-semibold text-xs text-text-muted">Cancelar edição</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <PublicCommentBubble
      nomeCompleto={nomeCompleto}
      texto={comentario.texto}
      createdAt={comentario.created_at}
      isMine={isMine}
      onEdit={isMine ? onIniciarEdicao : undefined}
      onDelete={isMine ? onExcluir : undefined}
      deleting={excluindo}
    />
  )
}
