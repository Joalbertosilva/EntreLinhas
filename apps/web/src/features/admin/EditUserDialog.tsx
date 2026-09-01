import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateUserSchema, type UpdateUserInput } from '@tcc-sistema/schemas'
import type { Profile } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { FieldError, Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: Profile | null
}

export function EditUserDialog({ open, onOpenChange, usuario }: EditUserDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { nome: '', perfil: 'aluno' },
  })

  useEffect(() => {
    if (open && usuario) {
      reset({ nome: usuario.nome, perfil: usuario.perfil })
    }
  }, [open, usuario, reset])

  const updateUser = useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      if (!usuario) throw new Error('Usuário não selecionado')

      const { error } = await supabase
        .from('profiles')
        .update({ nome: input.nome.trim(), perfil: input.perfil })
        .eq('id', usuario.id)
      if (error) throw error
    },
    onSuccess: () => {
      if (usuario) {
        void logAudit({
          acao: 'usuario.atualizar',
          entidade: 'profiles',
          entidade_id: usuario.id,
          detalhes: { nome_usuario: usuario.nome_usuario },
        })
      }
      toast.success('Usuário atualizado')
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['visao-administrativa'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Não foi possível atualizar o usuário')
    },
  })

  const onSubmit = (data: UpdateUserInput) => updateUser.mutate(data)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar usuário"
      description={
        usuario
          ? `Altere nome e perfil de ${usuario.nome_usuario}. O login não pode ser alterado aqui.`
          : undefined
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-nome">Nome completo</Label>
          <Input id="edit-nome" {...register('nome')} />
          <FieldError message={errors.nome?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-perfil">Perfil de acesso</Label>
          <Select id="edit-perfil" {...register('perfil')}>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
            <option value="administrador">Administrador</option>
          </Select>
          <FieldError message={errors.perfil?.message} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || updateUser.isPending}>
            {updateUser.isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
