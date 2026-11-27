import type { StatusLeitura, TipoConteudo } from '@tcc-sistema/types'
import { BookOpen, Bookmark, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react-native'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { useAtualizarLeituraUsuario } from '@/features/leituras/useLeiturasMap'
import { STATUS_LEITURA_LABEL } from '@/lib/leituraLabels'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useUsuarioId } from '@/lib/useUsuarioId'
import { cn } from '@/lib/cn'

interface LeituraActionsBarProps {
  conteudoId: string
  tipo: TipoConteudo
  status: StatusLeitura | null | undefined
  loading?: boolean
  temTexto: boolean
  onContinuarLendo?: () => void
}

export function LeituraActionsBar({
  conteudoId,
  tipo,
  status,
  loading,
  temTexto,
  onContinuarLendo,
}: LeituraActionsBarProps) {
  const usuarioId = useUsuarioId()
  const atualizar = useAtualizarLeituraUsuario(usuarioId)

  const isMusica = tipo === 'musica'
  const iniciarLabel = isMusica ? 'Iniciar' : 'Iniciar leitura'
  const continuarLabel = isMusica ? 'Continuar' : 'Continuar lendo'

  if (!usuarioId) {
    return (
      <View
        style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
        className="mt-4 rounded-2xl border border-border bg-surface px-4 py-3"
      >
        <Text className="font-sans text-sm text-text-muted">Faça login para registrar sua leitura.</Text>
      </View>
    )
  }

  const handleLeitura = async (next: StatusLeitura, irParaTexto?: boolean) => {
    try {
      await atualizar.mutateAsync({ conteudoId, status_leitura: next })
      if (irParaTexto && onContinuarLendo) {
        setTimeout(onContinuarLendo, 120)
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Não foi possível atualizar a leitura.'
      Alert.alert('Erro', msg)
    }
  }

  const pending = atualizar.isPending

  return (
    <View
      style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
      className="mt-4 rounded-2xl border border-primary/15 bg-primary-light/30 p-4"
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator color="#1c756a" size="small" />
          <Text className="font-sans text-sm text-text-muted">Carregando seu progresso…</Text>
        </View>
      ) : pending ? (
        <View className="flex-row items-center gap-2">
          <Loader2 color="#1c756a" size={18} />
          <Text className="font-sans-semibold text-sm text-brand-navy">Salvando…</Text>
        </View>
      ) : status === 'concluido' ? (
        <View className="gap-3">
          <View className="flex-row items-center gap-2 self-start rounded-full bg-primary px-3 py-1.5">
            <CheckCircle2 color="#fff" size={16} />
            <Text className="font-sans-semibold text-xs text-white">{STATUS_LEITURA_LABEL.concluido}</Text>
          </View>
          {temTexto ? (
            <Pressable
              onPress={() => void handleLeitura('em_andamento', true)}
              className="flex-row items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 active:opacity-90"
            >
              <BookOpen color="#fff" size={18} />
              <Text className="font-sans-semibold text-sm text-white">Ler novamente</Text>
            </Pressable>
          ) : null}
        </View>
      ) : status === 'em_andamento' ? (
        <View className="gap-2">
          <Text className="font-sans-semibold text-xs uppercase tracking-wide text-primary">
            {STATUS_LEITURA_LABEL.em_andamento}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {temTexto ? (
              <Pressable
                onPress={onContinuarLendo}
                className="min-w-[48%] flex-1 flex-row items-center justify-center gap-1 rounded-full bg-primary px-4 py-3 active:opacity-90"
              >
                <Text className="font-sans-semibold text-sm text-white">{continuarLabel}</Text>
                <ChevronRight color="#fff" size={16} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => void handleLeitura('concluido')}
              className={cn(
                'min-w-[48%] flex-1 flex-row items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-white px-4 py-3 active:bg-primary-light',
                !temTexto && 'flex-grow',
              )}
            >
              <CheckCircle2 color="#1c756a" size={18} />
              <Text className="font-sans-semibold text-sm text-primary">Concluído</Text>
            </Pressable>
          </View>
        </View>
      ) : status === 'na_lista' ? (
        <View className="gap-2">
          <View className="self-start rounded-full border border-accent/40 bg-accent-light/60 px-3 py-1">
            <Text className="font-sans-semibold text-xs text-brand-navy">{STATUS_LEITURA_LABEL.na_lista}</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => void handleLeitura('em_andamento', true)}
              className="min-w-[48%] flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-3 active:opacity-90"
            >
              <BookOpen color="#fff" size={18} />
              <Text className="font-sans-semibold text-sm text-white">{iniciarLabel}</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleLeitura('concluido')}
              className="min-w-[48%] flex-1 flex-row items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-white px-4 py-3"
            >
              <CheckCircle2 color="#1c756a" size={18} />
              <Text className="font-sans-semibold text-sm text-primary">Concluir</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View className="gap-2">
          <Text className="font-sans-semibold text-sm text-brand-navy">O que deseja fazer?</Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={() => void handleLeitura('em_andamento', true)}
              className="min-w-[30%] flex-1 flex-row items-center justify-center gap-1 rounded-full bg-primary px-3 py-2.5 active:opacity-90"
            >
              <BookOpen color="#fff" size={16} />
              <Text className="font-sans-semibold text-xs text-white">{iniciarLabel}</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleLeitura('na_lista')}
              className="min-w-[30%] flex-1 flex-row items-center justify-center gap-1 rounded-full border border-primary/25 bg-white px-3 py-2.5"
            >
              <Bookmark color="#1c756a" size={16} />
              <Text className="font-sans-semibold text-xs text-primary">Salvar</Text>
            </Pressable>
            <Pressable
              onPress={() => void handleLeitura('concluido')}
              className="min-w-[30%] flex-1 flex-row items-center justify-center gap-1 rounded-full border border-primary/25 bg-white px-3 py-2.5"
            >
              <CheckCircle2 color="#1c756a" size={16} />
              <Text className="font-sans-semibold text-xs text-primary">Concluir</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}