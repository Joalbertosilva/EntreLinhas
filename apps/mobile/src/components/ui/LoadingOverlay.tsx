import { Modal, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { BookPageLoader } from '@/components/ui/BookPageLoader'
import { BRAND } from '@/lib/brandTheme'

interface LoadingOverlayProps {
  visible: boolean
  label?: string
}

export function LoadingOverlay({ visible, label = 'Carregando…' }: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent>
      <LinearGradient
        colors={['rgba(26,51,66,0.45)', 'rgba(26,51,66,0.55)']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 280,
            borderRadius: 24,
            backgroundColor: 'rgba(255,255,255,0.97)',
            paddingVertical: 28,
            paddingHorizontal: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: BRAND.borderSoft,
          }}
        >
          <BookPageLoader size={56} label={label} coverColor={BRAND.navy} />
        </View>
      </LinearGradient>
    </Modal>
  )
}
