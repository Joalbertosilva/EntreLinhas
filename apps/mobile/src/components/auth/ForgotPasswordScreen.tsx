import { Controller } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { CheckCircle2, User } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { A11yScreen } from '@/components/layout/A11yScreen'
import { AuthField } from '@/components/ui/AuthField'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { useForgotPassword } from '@/features/auth/useForgotPassword'

export function ForgotPasswordScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { fontMultiplier } = useAccessibility()
  const { control, errors, isSubmitting, enviado, submitError, submit } = useForgotPassword()
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
            contentContainerClassName="flex-grow px-6 py-8"
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Voltar ao login"
              className="mb-6 self-start"
            >
              <Text className="font-sans-semibold text-sm text-primary">← Voltar ao login</Text>
            </Pressable>

            <View className="rounded-2xl border border-border/80 bg-white/95 p-6 shadow-sm">
              {enviado ? (
                <View className="items-center">
                  <View className="mb-4 rounded-full bg-primary-light p-3">
                    <CheckCircle2 color="#1c756a" size={28} strokeWidth={1.75} />
                  </View>
                  <Text className="text-center font-sans-bold text-brand-navy" style={{ fontSize: titleSize }}>
                    Pedido enviado
                  </Text>
                  <Text
                    className="mt-3 text-center font-sans leading-relaxed text-text-muted"
                    style={{ fontSize: bodySize }}
                  >
                    Se o usuário estiver cadastrado, seu pedido foi registrado. Avise seu professor ou
                    administrador — eles verão a solicitação e redefinirão sua senha com você por perto.
                  </Text>
                  <Button
                    variant="primary"
                    label="Voltar ao login"
                    onPress={() => router.replace('/(auth)/login')}
                    className="mt-6 w-full"
                  />
                </View>
              ) : (
                <>
                  <Text className="font-sans-bold text-brand-navy" style={{ fontSize: titleSize }}>
                    Esqueci minha senha
                  </Text>
                  <Text
                    className="mt-2 font-sans leading-relaxed text-text-muted"
                    style={{ fontSize: bodySize }}
                  >
                    Informe seu nome de usuário para abrir um pedido de redefinição de senha.
                  </Text>

                  <View className="mt-4 rounded-xl border border-primary/15 bg-primary-light/30 px-4 py-3">
                    <Text className="font-sans-semibold text-sm text-brand-navy">Como funciona</Text>
                    <Text className="mt-1 font-sans text-sm leading-relaxed text-text-muted">
                      Um professor ou administrador verá o pedido no gerenciador web e definirá uma nova
                      senha. Você não precisa ter acesso a e-mail.
                    </Text>
                  </View>

                  {submitError ? (
                    <View className="mt-4 rounded-xl border border-error/20 bg-red-50 px-4 py-3">
                      <Text className="font-sans-medium text-sm text-error">{submitError}</Text>
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

                    <Button
                      variant="brand"
                      label={isSubmitting ? 'Enviando...' : 'Enviar pedido'}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      onPress={submit}
                    />
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </A11yScreen>
  )
}
