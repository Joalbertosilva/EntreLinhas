import { ActivityIndicator, Platform, Pressable, Text, TextInput, View } from 'react-native'
import { SendHorizontal } from 'lucide-react-native'
import { BRAND } from '@/lib/brandTheme'

interface CommentComposerBoxProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit: () => void
  onFocus?: () => void
  submitting?: boolean
  placeholder?: string
  compact?: boolean
}

export function CommentComposerBox({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  submitting = false,
  placeholder = 'Comente aqui',
  compact = false,
}: CommentComposerBoxProps) {
  const canSubmit = value.trim().length > 0 && !submitting
  const minHeight = compact ? 64 : 88

  return (
    <View
      className="overflow-hidden rounded-2xl border border-border/80 bg-white"
      style={{
        shadowColor: BRAND.navy,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="mx-3 mt-3 rounded-xl bg-sky-light">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          placeholder={placeholder}
          placeholderTextColor="#5a7282"
          multiline
          maxLength={2000}
          textAlignVertical="top"
          style={{
            fontSize: 16,
            lineHeight: 24,
            minHeight,
            maxHeight: compact ? 100 : 132,
            paddingHorizontal: 14,
            paddingTop: Platform.OS === 'ios' ? 12 : 10,
            paddingBottom: 10,
            color: BRAND.navy,
          }}
        />
      </View>

      <View className="flex-row items-center justify-end px-3 pb-3 pt-2">
        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Publicar comentário"
          className={`flex-row items-center gap-1.5 rounded-full px-4 py-2.5 ${
            canSubmit ? 'bg-brand-navy active:opacity-90' : 'bg-border/80'
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text className={`font-sans-semibold text-sm ${canSubmit ? 'text-white' : 'text-text-muted'}`}>
                Publicar
              </Text>
              <SendHorizontal color={canSubmit ? '#ffffff' : '#5a7282'} size={16} strokeWidth={2} />
            </>
          )}
        </Pressable>
      </View>
    </View>
  )
}
