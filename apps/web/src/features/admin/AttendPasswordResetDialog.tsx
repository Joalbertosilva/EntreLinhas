import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { attendPasswordResetSchema, type AttendPasswordResetInput } from '@tcc-sistema/schemas'
import type { PasswordResetRequestWithProfile } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { generateTempPassword } from '@/lib/tempPassword'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FieldError, Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'

interface AttendPasswordResetDialogProps {
  request: PasswordResetRequestWithProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (payload: { nome_usuario: string; senha_temporaria: string; nome: string }) => void
}

export function AttendPasswordResetDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: AttendPasswordResetDialogProps) {
  const queryClient = useQueryClient()

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
    if (open && request) {
      reset()
      applyGeneratedPassword()
    }
  }, [open, request?.id, reset])

  const attend = useMutation({
    mutationFn: async (input: AttendPasswordResetInput) => {
      if (!request) throw new Error('Solicitação inválida')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-reset-password`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            request_id: request.id,
            senha_temporaria: input.senha_temporaria,
          }),
        },
      )

      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Não foi possível redefinir a senha')
      return body as { nome: string; nome_usuario: string; senha_temporaria: string }
    },
    onSuccess: (data) => {
      toast.success('Senha temporária definida. Entregue ao aluno presencialmente.')
      reset()
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['password-reset-requests'] })
      onSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: AttendPasswordResetInput) => attend.mutate(data)

  const alunoNome = request?.profiles?.nome ?? request?.nome_usuario

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title="Atender solicitação de recuperação"
      description={
        request
          ? `Senha temporária gerada automaticamente para ${alunoNome} (@${request.nome_usuario}). Entregue pessoalmente — o aluno poderá trocá-la no perfil.`
          : undefined
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={applyGeneratedPassword}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Gerar outra senha
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha_temporaria">Senha temporária</Label>
          <PasswordInput id="senha_temporaria" {...register('senha_temporaria')} />
          <FieldError message={errors.senha_temporaria?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha_confirmacao">Confirmar senha</Label>
          <PasswordInput id="senha_confirmacao" {...register('senha_confirmacao')} />
          <FieldError message={errors.senha_confirmacao?.message} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || attend.isPending}>
            {isSubmitting || attend.isPending ? 'Salvando...' : 'Confirmar e entregar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
