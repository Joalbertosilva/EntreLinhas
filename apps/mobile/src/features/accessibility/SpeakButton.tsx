import { Volume2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useSpeechContext } from '@/features/accessibility/SpeechProvider'
import { cn } from '@/lib/cn'

interface SpeakButtonProps {
  label: string
  className?: string
}

export function SpeakButton({ label, className }: SpeakButtonProps) {
  const { speak, isSpeaking } = useSpeechContext()

  return (
    <Pressable
      onPress={() => void speak(label)}
      accessibilityRole="button"
      accessibilityLabel={`Ouvir: ${label}`}
      hitSlop={6}
      className={cn(
        'h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-white shadow-sm active:bg-primary-light',
        isSpeaking && 'border-primary bg-primary-light',
        className,
      )}
    >
      <Volume2 color="#1c756a" size={14} strokeWidth={2} />
    </Pressable>
  )
}
