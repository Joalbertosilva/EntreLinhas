import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { PLATFORM_GRADIENT, PLATFORM_GRADIENT_LOCATIONS } from '@/lib/brandTheme'
import { useRouter } from 'expo-router'
import { KeyRound } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { resetPasswordSchema, type ResetPasswordInput } from '@tcc-sistema/schemas'
import { BrandLogo } from '@/components/auth/BrandLogo'
import { AuthField } from '@/components/ui/AuthField'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

export default function TrocarSenhaScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { refreshProfile } = useAuth()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    const { error: authError } = await supabase.auth.updateUser({ password: data.senha_nova })
    if (authError) {
      setError('root', { message: 'Não foi possível definir a nova senha. Tente novamente.' })
      return
    }

    const { error: rpcError } = await supabase.rpc('clear_deve_trocar_senha')
    if (rpcError) {
      setError('root', {
        message: 'Senha atualizada, mas não foi possível concluir. Tente entrar novamente.',
      })
      return
    }

    await refreshProfile()
    router.replace('/(aluno)/(tabs)')
  }

  return (
    <LinearGradient
      colors={[...PLATFORM_GRADIENT]}
      locations={[...PLATFORM_GRADIENT_LOCATIONS]}
      style={{ flex: 1, paddingTop: insets.top }}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10" keyboardShouldPersistTaps="handled">
          <BrandLogo className="mb-8" />

          <View className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <View className="mb-5 items-center">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
                <KeyRound color="#1c756a" size={28} strokeWidth={1.75} />
              </View>
              <Text className="mt-4 text-center font-sans-bold text-xl text-brand-navy">Defina sua nova senha</Text>
              <Text className="mt-2 text-center font-sans text-sm leading-relaxed text-text-muted">
                Por segurança, escolha uma senha pessoal antes de continuar.
              </Text>
            </View>

            {errors.root ? (
              <View className="mb-4 rounded-xl border border-error/20 bg-red-50 px-4 py-3">
                <Text className="font-sans-medium text-sm text-error">{errors.root.message}</Text>
              </View>
            ) : null}

            <View className="gap-4">
              <Controller
                control={control}
                name="senha_nova"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthField label="Nova senha" error={errors.senha_nova?.message}>
                    <PasswordInput
                      autoComplete="new-password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                  </AuthField>
                )}
              />
              <Controller
                control={control}
                name="senha_confirmacao"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthField label="Confirmar nova senha" error={errors.senha_confirmacao?.message}>
                    <PasswordInput
                      autoComplete="new-password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                    />
                  </AuthField>
                )}
              />
              <Button
                label={isSubmitting ? 'Salvando...' : 'Continuar'}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
