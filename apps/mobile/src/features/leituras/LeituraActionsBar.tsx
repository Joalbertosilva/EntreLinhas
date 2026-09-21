import type { StatusLeitura } from '@tcc-sistema/types'
import { BookOpen, Bookmark, CheckCircle2, Loader2 } from 'lucide-react-native'
import { Alert, Pressable, Text, View } from 'react-native'
import { useAtualizarLeituraUsuario } from '@/features/leituras/useLeiturasMap'
import { STATUS_LEITURA_LABEL } from '@/lib/leituraLabels'
import { SCREEN_HORIZONTAL_PADDING } from '@/lib/layout'
import { useAuth } from '@/providers/AuthProvider'
import { cn } from '@/lib/cn'

interface LeituraActionsBarProps {
  conteudoId: string
  status: StatusLeitura | null | undefined
  loading?: boolean
}

const ACTIONS: Array<{ status: StatusLeitura; icon: typeof BookOpen; short: string }> = [
  { status: 'em_andamento', icon: BookOpen, short: 'Iniciar' },
  { status: 'na_lista', icon: Bookmark, short: 'Salvar' },
  { status: 'concluido', icon: CheckCircle2, short: 'Concluir' },
]

export function LeituraActionsBar({ conteudoId, status, loading }: LeituraActionsBarProps) {
  const { profile } = useAuth()
  const atualizar = useAtualizarLeituraUsuario(profile?.id)

  if (!profile) return null

  const handleAction = async (next: StatusLeitura) => {
    try {
      await atualizar.mutateAsync({ conteudoId, status_leitura: next })
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a leitura.')
    }
  }

  return (
    <View
      style={{ marginHorizontal: SCREEN_HORIZONTAL_PADDING }}
      className="mt-4 rounded-2xl border border-primary/15 bg-primary-light/30 p-4"
    >
      <Text className="mb-3 font-sans-semibold text-sm text-brand-navy">
        {loading
          ? 'Carregando leitura...'
          : status
            ? `Status: ${STATUS_LEITURA_LABEL[status]}`
            : 'Adicione à sua biblioteca'}
      </Text>
      <View className="flex-row gap-2">
        {ACTIONS.map((action) => {
          const Icon = action.icon
          const active = status === action.status
          const pending = atualizar.isPending
          return (
            <Pressable
              key={action.status}
              disabled={active || pending || loading}
              onPress={() => void handleAction(action.status)}
              className={cn(
                'min-w-0 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5',
                active ? 'bg-primary' : 'border border-primary/25 bg-white active:bg-primary-light',
              )}
            >
              {pending ? (
                <Loader2 color={active ? '#fff' : '#1c756a'} size={16} />
              ) : (
                <Icon color={active ? '#fff' : '#1c756a'} size={16} strokeWidth={1.75} />
              )}
              <Text className={cn('font-sans-semibold text-xs', active ? 'text-white' : 'text-primary')}>
                {action.short}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
