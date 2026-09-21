import type { StatusLeitura } from '@tcc-sistema/types'
import { BookOpen, Bookmark, CheckCircle2, Loader2, MoreHorizontal } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, Modal, Pressable, Text, View } from 'react-native'
import { useAtualizarLeituraUsuario } from '@/features/leituras/useLeiturasMap'
import { useAuth } from '@/providers/AuthProvider'
import { cn } from '@/lib/cn'

interface ContentCardLeituraMenuProps {
  conteudoId: string
  status?: StatusLeitura | null
  variant?: 'cover' | 'list'
  className?: string
}

const ACTIONS: Array<{
  status: StatusLeitura
  label: string
  hint: string
  icon: typeof BookOpen
}> = [
  { status: 'em_andamento', label: 'Iniciar leitura', hint: 'Continuar de onde parar', icon: BookOpen },
  { status: 'na_lista', label: 'Salvar para depois', hint: 'Adicionar à sua lista', icon: Bookmark },
  { status: 'concluido', label: 'Marcar como lido', hint: 'Registrar como concluída', icon: CheckCircle2 },
]

export function ContentCardLeituraMenu({
  conteudoId,
  status = null,
  variant = 'cover',
  className,
}: ContentCardLeituraMenuProps) {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const atualizar = useAtualizarLeituraUsuario(profile?.id)

  if (!profile) return null

  const handleAction = async (next: StatusLeitura) => {
    setOpen(false)
    try {
      await atualizar.mutateAsync({ conteudoId, status_leitura: next })
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a leitura.')
    }
  }

  return (
    <>
      <Pressable
        onPress={(e) => {
          e.stopPropagation?.()
          setOpen(true)
        }}
        disabled={atualizar.isPending}
        accessibilityRole="button"
        accessibilityLabel="Opções de leitura"
        className={cn(
          variant === 'cover'
            ? 'absolute right-1.5 top-1.5 z-10 rounded-full bg-white/95 p-1.5 shadow-sm'
            : 'rounded-full border border-border bg-white p-2',
          className,
        )}
      >
        {atualizar.isPending ? (
          <Loader2 color="#1c756a" size={16} />
        ) : (
          <MoreHorizontal color="#1a3342" size={16} strokeWidth={2} />
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="rounded-t-3xl bg-white px-5 pb-8 pt-4" onPress={(e) => e.stopPropagation()}>
            <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />
            <Text className="mb-3 font-sans-bold text-lg text-brand-navy">Minha leitura</Text>
            {ACTIONS.map((action) => {
              const Icon = action.icon
              const isCurrent = status === action.status
              return (
                <Pressable
                  key={action.status}
                  disabled={isCurrent || atualizar.isPending}
                  onPress={() => void handleAction(action.status)}
                  className={cn(
                    'mb-2 flex-row items-center gap-3 rounded-xl p-3',
                    isCurrent ? 'bg-primary-light' : 'active:bg-surface',
                  )}
                >
                  <View className={cn('rounded-lg p-2', isCurrent ? 'bg-white' : 'bg-surface')}>
                    <Icon color={isCurrent ? '#1c756a' : '#5a7282'} size={18} strokeWidth={1.75} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="font-sans-semibold text-base text-text">{action.label}</Text>
                    <Text className="font-sans text-xs text-text-muted">{action.hint}</Text>
                  </View>
                  {isCurrent ? (
                    <Text className="font-sans-semibold text-[10px] uppercase text-primary">Atual</Text>
                  ) : null}
                </Pressable>
              )
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
