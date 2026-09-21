import { Controller } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Lock, User } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { BrandLogo } from '@/components/auth/BrandLogo'
import { AuthField } from '@/components/ui/AuthField'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useLogin } from '@/features/auth/useLogin'

export function LoginScreen() {
  const insets = useSafeAreaInsets()
  const { fontMultiplier } = useAccessibility()
  const { control, errors, isSubmitting, authError, submit } = useLogin()
  const titleSize = Math.round(24 * fontMultiplier)
  const bodySize = Math.round(16 * fontMultiplier)

  return (
    <A11yScreen>
      <LinearGradient
        colors={['#fafefc', '#e5f7f3', '#e8f7f4', '#ffffff']}
        locations={[0, 0.35, 0.7, 1]}
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerClassName="flex-grow justify-center px-6 py-8"
            keyboardShouldPersistTaps="handled"
          >
            <BrandLogo className="mb-8" />

            <View className="rounded-2xl border border-border/80 bg-white/95 p-6 shadow-sm">
              <Text className="font-sans-bold text-brand-navy" style={{ fontSize: titleSize }}>
                Boas-vindas
              </Text>
              <Text
                className="mt-2 font-sans leading-relaxed text-text-muted"
                style={{ fontSize: bodySize }}
              >
                Use seu usuário e senha para entrar na plataforma.
              </Text>

              {authError ? (
                <View className="mt-4 rounded-xl border border-error/20 bg-red-50 px-4 py-3">
                  <Text className="font-sans-medium text-sm text-error">{authError}</Text>
                </View>
              ) : null}

              <View className="mt-6 gap-5">
                <Controller
                  control={control}
                  name="nome_usuario"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AuthField label="Seu usuário" error={errors.nome_usuario?.message}>
                      <Input
                        icon={User}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder="Usuário"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    </AuthField>
                  )}
                />

                <Controller
                  control={control}
                  name="senha"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AuthField label="Sua senha" error={errors.senha?.message}>
                      <PasswordInput
                        icon={Lock}
                        placeholder="Sua senha"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                      />
                    </AuthField>
                  )}
                />

                <Button
                  variant="brand"
                  label={isSubmitting ? 'Entrando...' : 'Entrar'}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onPress={submit}
                  className="mt-1"
                />

                <Pressable accessibilityRole="button" className="items-center py-1">
                  <Text className="font-sans-medium text-sm text-primary">Esqueci minha senha</Text>
                </Pressable>
              </View>
            </View>

            <Text className="mt-6 text-center font-sans text-xs leading-relaxed text-text-muted">
              Acesso restrito a usuários cadastrados. Em caso de dúvida, fale com seu professor ou
              administrador.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </A11yScreen>
  )
}
