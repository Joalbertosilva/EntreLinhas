import { LinearGradient } from 'expo-linear-gradient'
import { MessageSquare, Pencil, Trash2, Users } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { Avatar } from '@/components/ui/Avatar'
import { BRAND } from '@/lib/brandTheme'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

interface PublicCommentsSectionShellProps {
  totalLabel: string
  isLoading?: boolean
  composer?: ReactNode
  children: ReactNode
}

export function PublicCommentsSectionShell({
  totalLabel,
  isLoading,
  composer,
  children,
}: PublicCommentsSectionShellProps) {
  return (
    <View
      className="mt-8 overflow-hidden rounded-3xl border border-sky-mid"
      style={{
        shadowColor: BRAND.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <LinearGradient colors={['#eef3f9', '#f8fbfe', '#ffffff']} locations={[0, 0.45, 1]}>
        <View className="h-1 bg-brand-navy" />

        <View className="px-5 pb-5 pt-5">
          <View className="flex-row items-start gap-3.5">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: BRAND.navy }}
            >
              <Users color="#ffffff" size={20} strokeWidth={1.75} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className="font-sans-bold text-lg text-brand-navy">Comentários</Text>
                <View className="rounded-full bg-white/90 px-2.5 py-0.5">
                  <Text className="font-sans-semibold text-[10px] uppercase tracking-wide text-brand-navy">
                    Público
                  </Text>
                </View>
              </View>
              <Text className="mt-1 font-sans text-sm leading-relaxed text-text-muted">{totalLabel}</Text>
              <Text className="mt-1.5 font-sans text-xs leading-relaxed text-text-muted/90">
                Compartilhe o que achou da leitura — visível para toda a turma.
              </Text>
            </View>
          </View>

          <View className="my-5 h-px bg-border/80" />

          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={BRAND.primary} size="small" />
              <Text className="mt-3 font-sans text-sm text-text-muted">Carregando comentários…</Text>
            </View>
          ) : (
            children
          )}

          {composer ? (
            <View className="mt-5">
              <Text className="mb-2.5 font-sans-semibold text-xs uppercase tracking-wide text-text-muted">
                Sua mensagem
              </Text>
              {composer}
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  )
}

export function PublicCommentsEmptyState() {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border/90 bg-white/70 px-5 py-8">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-sky">
        <MessageSquare color={BRAND.navy} size={22} strokeWidth={1.5} />
      </View>
      <Text className="font-sans-semibold text-base text-brand-navy">Ninguém comentou ainda</Text>
      <Text className="mt-1.5 text-center font-sans text-sm leading-relaxed text-text-muted">
        Seja o primeiro a compartilhar o que sentiu ou pensou sobre esta leitura.
      </Text>
    </View>
  )
}

interface PublicCommentBubbleProps {
  nomeCompleto: string
  texto: string
  createdAt: string
  isMine?: boolean
  onEdit?: () => void
  onDelete?: () => void
  deleting?: boolean
}

export function PublicCommentBubble({
  nomeCompleto,
  texto,
  createdAt,
  isMine,
  onEdit,
  onDelete,
  deleting = false,
}: PublicCommentBubbleProps) {
  const nome = nomeCompleto.split(' ')[0]

  return (
    <View className="flex-row gap-3">
      <Avatar name={nomeCompleto} size={36} tone={isMine ? 'navy' : 'primary'} />
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-center gap-x-2 gap-y-1">
          <Text className="font-sans-semibold text-sm text-brand-navy">{nome}</Text>
          {isMine ? (
            <View className="rounded-full bg-brand-navy/10 px-2 py-0.5">
              <Text className="font-sans-semibold text-[10px] text-brand-navy">Você</Text>
            </View>
          ) : null}
          <Text className="font-sans text-xs text-text-muted">{formatRelativeTime(createdAt)}</Text>
        </View>

        <View
          className="mt-2 rounded-2xl rounded-tl-md border border-border/60 bg-white px-4 py-3"
          style={{
            shadowColor: BRAND.navy,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          }}
        >
          <Text className="font-sans text-base leading-relaxed text-text">{texto}</Text>
        </View>

        {isMine && (onEdit || onDelete) ? (
          <View className="mt-2 flex-row flex-wrap items-center gap-1">
            {onEdit ? (
              <Pressable
                onPress={onEdit}
                disabled={deleting}
                accessibilityRole="button"
                accessibilityLabel="Editar comentário"
                className="flex-row items-center gap-1 rounded-full px-2 py-1 active:bg-white/80"
              >
                <Pencil color={BRAND.textMuted} size={12} strokeWidth={2} />
                <Text className="font-sans-semibold text-xs text-text-muted">Editar</Text>
              </Pressable>
            ) : null}
            {onDelete ? (
              <Pressable
                onPress={onDelete}
                disabled={deleting}
                accessibilityRole="button"
                accessibilityLabel="Excluir comentário"
                className="flex-row items-center gap-1 rounded-full px-2 py-1 active:bg-red-50"
              >
                <Trash2 color="#dc2626" size={12} strokeWidth={2} />
                <Text className="font-sans-semibold text-xs text-error">Excluir</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  )
}
