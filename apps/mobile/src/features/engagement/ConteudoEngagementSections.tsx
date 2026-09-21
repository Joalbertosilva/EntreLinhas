import type { InteracaoComAutor, Tema } from '@tcc-sistema/types'
import { Heart, Lock, MessageCircle, Volume2, VolumeX } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import { A11yText, useA11yFontSize } from '@/components/ui/A11yText'
import { Avatar } from '@/components/ui/Avatar'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useSpeechContext } from '@/features/accessibility/SpeechProvider'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import {
  useComentariosPublicos,
  useMinhaCurtida,
  useMinhasInteracoes,
  useSalvarInteracao,
  useToggleCurtida,
} from '@/features/engagement/useConteudoEngagement'
import { getReflexaoDisplay } from '@/lib/conteudoReflexao'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

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
}: Pick<ConteudoEngagementSectionsProps, 'conteudoId' | 'usuarioId' | 'temas'>) {
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
        <ReflexaoCard key={tema.id} conteudoId={conteudoId} usuarioId={usuarioId} tema={tema} />
      ))}
    </View>
  )
}

function ReflexaoCard({
  conteudoId,
  usuarioId,
  tema,
}: {
  conteudoId: string
  usuarioId: string | undefined
  tema: Tema
}) {
  const { data: minhas = [] } = useMinhasInteracoes(conteudoId, usuarioId)
  const salvar = useSalvarInteracao(conteudoId, usuarioId)
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

        <View className="w-full border-t border-border/50 pt-4">
          <A11yText size={14} className="mb-2 font-sans-medium text-text">
            Sua resposta
          </A11yText>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva aqui o que você pensa e sente..."
            placeholderTextColor="#5a7282"
            multiline
            textAlignVertical="top"
            style={{ fontSize: inputFontSize, lineHeight: Math.round(inputFontSize * 1.5) }}
            className="min-h-[100px] w-full rounded-xl border border-border bg-surface px-4 py-3 font-sans text-text"
          />
          <A11yText size={12} className="mt-2 font-sans text-text-muted">
            Não existe resposta certa ou errada — o importante é o que a leitura significa para você.
          </A11yText>
        </View>

        <Pressable
          onPress={() => void handleSave()}
          disabled={salvar.isPending}
          className="self-start rounded-full bg-primary px-4 py-2 active:opacity-90"
        >
          {salvar.isPending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <A11yText size={14} className="font-sans-semibold text-white">
              {existente ? 'Atualizar resposta' : 'Salvar resposta'}
            </A11yText>
          )}
        </Pressable>
      </View>
    </View>
  )
}

export function ConteudoComentariosSection({
  conteudoId,
  usuarioId,
}: Pick<ConteudoEngagementSectionsProps, 'conteudoId' | 'usuarioId'>) {
  const { data: comentarios = [], isLoading } = useComentariosPublicos(conteudoId)
  const salvar = useSalvarInteracao(conteudoId, usuarioId)
  const [novoTexto, setNovoTexto] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editTexto, setEditTexto] = useState('')

  const comentariosOrdenados = [...comentarios].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const totalLabel =
    comentarios.length === 0
      ? 'Nenhum comentário ainda'
      : comentarios.length === 1
        ? '1 comentário'
        : `${comentarios.length} comentários`

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

  const iniciarEdicao = (comentario: InteracaoComAutor) => {
    setEditandoId(comentario.id)
    setEditTexto(comentario.texto)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setEditTexto('')
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
    <View style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }} className="mt-8">
      <View className="mb-4 flex-row items-start gap-3">
        <View className="rounded-xl bg-primary-light p-2.5">
          <MessageCircle color="#1c756a" size={20} strokeWidth={1.75} />
        </View>
        <View className="flex-1">
          <Text className="font-sans-bold text-lg text-brand-navy">Comentários</Text>
          <Text className="mt-0.5 font-sans text-sm text-text-muted">{totalLabel}</Text>
          <Text className="mt-1 font-sans text-xs leading-relaxed text-text-muted">
            Espaço público — todos os alunos veem. Diferente da sua reflexão, que é privada.
          </Text>
        </View>
      </View>

      {isLoading ? (
        <Text className="font-sans text-sm text-text-muted">Carregando comentários...</Text>
      ) : comentariosOrdenados.length > 0 ? (
        <View className="overflow-hidden rounded-2xl border border-border bg-surface">
          {comentariosOrdenados.map((c, index) => (
            <View key={c.id} className={index > 0 ? 'border-t border-border' : ''}>
              <ComentarioPublicoCard
                comentario={c}
                isMine={c.usuario_id === usuarioId}
                editando={editandoId === c.id}
                editTexto={editTexto}
                onEditTexto={setEditTexto}
                onIniciarEdicao={() => iniciarEdicao(c)}
                onCancelarEdicao={cancelarEdicao}
                onSalvarEdicao={() => void handleSalvarEdicao()}
                salvando={salvar.isPending}
              />
            </View>
          ))}
        </View>
      ) : (
        <Text className="py-4 text-center font-sans text-sm text-text-muted">
          Ninguém comentou ainda. Seja o primeiro!
        </Text>
      )}

      {usuarioId ? (
        <View className="mt-4 border-t border-border pt-4">
          <TextInput
            value={novoTexto}
            onChangeText={setNovoTexto}
            placeholder="Escreva um comentário..."
            placeholderTextColor="#5a7282"
            multiline
            textAlignVertical="top"
            className="min-h-[72px] rounded-xl border border-border bg-white px-4 py-3 font-sans text-base text-text"
          />
          <Pressable
            onPress={() => void handlePublicar()}
            disabled={salvar.isPending || !novoTexto.trim()}
            className="mt-3 self-end rounded-full bg-primary px-5 py-2.5 disabled:opacity-50"
          >
            {salvar.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="font-sans-semibold text-sm text-white">Publicar</Text>
            )}
          </Pressable>
        </View>
      ) : null}
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
  salvando = false,
}: {
  comentario: InteracaoComAutor
  isMine?: boolean
  editando?: boolean
  editTexto?: string
  onEditTexto?: (v: string) => void
  onIniciarEdicao?: () => void
  onCancelarEdicao?: () => void
  onSalvarEdicao?: () => void
  salvando?: boolean
}) {
  const nomeCompleto = comentario.profiles?.nome ?? 'Aluno'
  const nome = nomeCompleto.split(' ')[0]

  return (
    <View className="px-4 py-4">
      <View className="flex-row gap-3">
        <Avatar name={nomeCompleto} size={32} />
        <View className="min-w-0 flex-1">
          <View className="flex-row flex-wrap items-baseline gap-x-2">
            <Text className="font-sans-semibold text-sm text-text">{nome}</Text>
            <Text className="font-sans text-xs text-text-muted">
              {formatRelativeTime(comentario.created_at)}
            </Text>
          </View>

          {editando ? (
            <View className="mt-2">
              <TextInput
                value={editTexto}
                onChangeText={onEditTexto}
                multiline
                textAlignVertical="top"
                className="min-h-[72px] rounded-xl border border-border bg-white px-3 py-2 font-sans text-base text-text"
              />
              <View className="mt-2 flex-row gap-2">
                <Pressable
                  onPress={onSalvarEdicao}
                  disabled={salvando}
                  className="rounded-full bg-primary px-4 py-2"
                >
                  <Text className="font-sans-semibold text-sm text-white">
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={onCancelarEdicao}
                  disabled={salvando}
                  className="rounded-full border border-border px-4 py-2"
                >
                  <Text className="font-sans-semibold text-sm text-text-muted">Cancelar</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text className="mt-1 font-sans text-base leading-relaxed text-text">{comentario.texto}</Text>
              {isMine ? (
                <Pressable onPress={onIniciarEdicao} className="mt-2 self-start">
                  <Text className="font-sans-semibold text-xs text-text-muted">Editar</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </View>
    </View>
  )
}
