import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createUserFormSchema, type CreateUserFormInput } from '@tcc-sistema/schemas'
import { supabase } from '@/lib/supabase'
import { generateTempPassword } from '@/lib/tempPassword'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { FieldError, Label } from '@/components/ui/Label'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Select } from '@/components/ui/Select'

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormInput>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { perfil: 'aluno' },
  })

  const applyGeneratedPassword = () => {
    const senha = generateTempPassword()
    setValue('senha', senha, { shouldValidate: true })
    setValue('senha_confirmacao', senha, { shouldValidate: true })
  }

  useEffect(() => {
    if (open) {
      reset({ perfil: 'aluno' })
      applyGeneratedPassword()
    }
  }, [open, reset])

  const createUser = useMutation({
    mutationFn: async (input: CreateUserFormInput) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada')

      const { senha_confirmacao: _, ...payload } = input

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      )

      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Não foi possível criar o usuário')
      return body
    },
    onSuccess: () => {
      toast.success('Usuário cadastrado com sucesso')
      reset()
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['visao-administrativa'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const onSubmit = (data: CreateUserFormInput) => createUser.mutate(data)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title="Novo usuário"
      description="Senha temporária gerada automaticamente. O usuário poderá alterá-la depois."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" placeholder="Nome e sobrenome" {...register('nome')} />
          <FieldError message={errors.nome?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_usuario">Nome de usuário</Label>
          <Input id="nome_usuario" placeholder="usuario.exemplo" {...register('nome_usuario')} />
          <FieldError message={errors.nome_usuario?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="perfil">Perfil de acesso</Label>
          <Select id="perfil" {...register('perfil')}>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="administrador">Administrador</option>
          </Select>
          <FieldError message={errors.perfil?.message} />
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={applyGeneratedPassword}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Gerar outra senha
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Senha temporária</Label>
          <PasswordInput id="senha" autoComplete="new-password" {...register('senha')} />
          <FieldError message={errors.senha?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha_confirmacao">Confirmar senha</Label>
          <PasswordInput
            id="senha_confirmacao"
            autoComplete="new-password"
            {...register('senha_confirmacao')}
          />
          <FieldError message={errors.senha_confirmacao?.message} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || createUser.isPending}>
            {createUser.isPending ? 'Salvando...' : 'Cadastrar usuário'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
