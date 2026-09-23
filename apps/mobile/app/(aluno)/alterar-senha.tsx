import { zodResolver } from '@hookform/resolvers/zod'
import { Stack } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { Lock } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { changePasswordSchema, nomeUsuarioToAuthEmail, type ChangePasswordInput } from '@tcc-sistema/schemas'
import { ScreenBackHeader } from '@/components/layout/ScreenBackHeader'
import { useGoBack } from '@/lib/useGoBack'
import { AuthField } from '@/components/ui/AuthField'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/providers/AuthProvider'

export default function AlterarSenhaScreen() {
  const goBack = useGoBack()
  const insets = useSafeAreaInsets()
  const { profile } = useAuth()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    if (!profile) {
      setError('root', { message: 'Perfil não carregado.' })
      return
    }

    const email = nomeUsuarioToAuthEmail(profile.nome_usuario)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: data.senha_atual,
    })
    if (authError) {
      setError('senha_atual', { message: 'Senha atual incorreta' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: data.senha_nova })
    if (error) {
      setError('root', { message: 'Não foi possível alterar a senha.' })
      return
    }

    reset()
    goBack()
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
      <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
        <ScreenBackHeader title="Alterar senha" />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}>
            <View className="mb-6 flex-row items-start gap-4">
              <View className="rounded-2xl bg-primary-light p-3">
                <Lock color="#1c756a" size={24} strokeWidth={1.75} />
              </View>
              <View className="flex-1">
                <Text className="font-sans-bold text-xl text-brand-navy">Nova senha de acesso</Text>
                <Text className="mt-1 font-sans text-sm text-text-muted">
                  Confirme sua senha atual para definir uma nova.
                </Text>
              </View>
            </View>

            {errors.root ? (
              <View className="mb-4 rounded-xl border border-error/20 bg-red-50 px-4 py-3">
                <Text className="font-sans-medium text-sm text-error">{errors.root.message}</Text>
              </View>
            ) : null}

            <View className="gap-4 rounded-2xl border border-border bg-white p-5">
              <Controller
                control={control}
                name="senha_atual"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthField label="Senha atual" error={errors.senha_atual?.message}>
                    <PasswordInput autoComplete="current-password" value={value} onBlur={onBlur} onChangeText={onChange} />
                  </AuthField>
                )}
              />
              <Controller
                control={control}
                name="senha_nova"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthField label="Nova senha" error={errors.senha_nova?.message}>
                    <PasswordInput autoComplete="new-password" value={value} onBlur={onBlur} onChangeText={onChange} />
                  </AuthField>
                )}
              />
              <Controller
                control={control}
                name="senha_confirmacao"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AuthField label="Confirmar nova senha" error={errors.senha_confirmacao?.message}>
                    <PasswordInput autoComplete="new-password" value={value} onBlur={onBlur} onChangeText={onChange} />
                  </AuthField>
                )}
              />
              <Button
                label={isSubmitting ? 'Salvando...' : 'Atualizar senha'}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  )
}
