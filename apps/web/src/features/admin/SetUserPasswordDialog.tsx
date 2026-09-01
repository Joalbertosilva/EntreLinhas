import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { attendPasswordResetSchema, type AttendPasswordResetInput } from '@tcc-sistema/schemas'
import type { Profile } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { generateTempPassword } from '@/lib/tempPassword'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FieldError, Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'

interface SetUserPasswordDialogProps {
  usuario: Profile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (payload: { nome_usuario: string; senha_temporaria: string; nome: string }) => void
}

export function SetUserPasswordDialog({
  usuario,
  open,
  onOpenChange,
  onSuccess,
}: SetUserPasswordDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AttendPasswordResetInput>({
    resolver: zodResolver(attendPasswordResetSchema),
  })

  const applyGeneratedPassword = () => {
    const senha = generateTempPassword()
    setValue('senha_temporaria', senha, { shouldValidate: true })
    setValue('senha_confirmacao', senha, { shouldValidate: true })
  }

  useEffect(() => {
    if (open && usuario) {
      reset()
      applyGeneratedPassword()
    }
  }, [open, usuario?.id, reset])

  const setPassword = useMutation({
    mutationFn: async (input: AttendPasswordResetInput) => {
      if (!usuario) throw new Error('Usuário não selecionado')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-set-user-password`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile_id: usuario.id,
            senha_temporaria: input.senha_temporaria,
          }),
        },
      )

      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Não foi possível redefinir a senha')
      return body as { nome: string; nome_usuario: string; senha_temporaria: string }
    },
    onSuccess: (data) => {
      toast.success('Senha redefinida. Entregue ao usuário presencialmente.')
      reset()
      onOpenChange(false)
      onSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title="Redefinir senha"
      description={
        usuario
          ? `Nova senha temporária para ${usuario.nome} (@${usuario.nome_usuario}). Entregue pessoalmente — o usuário poderá trocá-la no perfil.`
          : undefined
      }
    >
      <form
        onSubmit={handleSubmit(
          (data) => setPassword.mutate(data),
          () => toast.error('Verifique os campos da senha'),
        )}
        className="space-y-4"
      >
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={applyGeneratedPassword}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Gerar outra senha
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="set-senha_temporaria">Senha temporária</Label>
          <PasswordInput id="set-senha_temporaria" {...register('senha_temporaria')} />
          <FieldError message={errors.senha_temporaria?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="set-senha_confirmacao">Confirmar senha</Label>
          <PasswordInput id="set-senha_confirmacao" {...register('senha_confirmacao')} />
          <FieldError message={errors.senha_confirmacao?.message} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || setPassword.isPending}>
            {isSubmitting || setPassword.isPending ? 'Salvando...' : 'Confirmar nova senha'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
