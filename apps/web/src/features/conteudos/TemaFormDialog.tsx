import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { temaFormSchema, type TemaFormInput } from '@tcc-sistema/schemas'
import type { Tema } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { emptyToNull } from '@/lib/labels'
import { normalizeReflexaoParts } from '@/features/conteudos/conteudoReflexao'
import { ReflexaoFormFields } from '@/features/conteudos/ReflexaoFormFields'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FieldError, Label } from '@/components/ui/Label'

interface TemaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conteudoId: string
  tema?: Tema | null
}

const defaultValues: TemaFormInput = {
  tema: '',
  descricao: '',
  ensinamento: '',
  questionamento: '',
  status: true,
}

function toFormValues(t: Tema): TemaFormInput {
  const { frase, reflexao, pergunta } = normalizeReflexaoParts(t)
  return {
    tema: t.tema,
    descricao: reflexao,
    ensinamento: pergunta === 'O que essa frase desperta em você?' ? '' : pergunta,
    questionamento: frase,
    status: t.status,
  }
}

function toDbPayload(data: TemaFormInput, conteudoId: string) {
  return {
    conteudo_id: conteudoId,
    tema: data.tema.trim(),
    descricao: emptyToNull(data.descricao ?? ''),
    ensinamento: emptyToNull(data.ensinamento ?? ''),
    questionamento: emptyToNull(data.questionamento ?? ''),
    status: data.status,
  }
}

export function TemaFormDialog({ open, onOpenChange, conteudoId, tema }: TemaFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(tema)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TemaFormInput>({
    resolver: zodResolver(temaFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) reset(tema ? toFormValues(tema) : defaultValues)
  }, [open, tema, reset])

  const save = useMutation({
    mutationFn: async (input: TemaFormInput) => {
      const payload = toDbPayload(input, conteudoId)
      if (isEditing && tema) {
        const { error } = await supabase.from('temas').update(payload).eq('id', tema.id)
        if (error) throw error
        return { id: tema.id, titulo: input.tema.trim(), acao: 'tema.atualizar' as const }
      }
      const { data, error } = await supabase.from('temas').insert(payload).select('id').single()
      if (error) throw error
      return { id: data.id, titulo: input.tema.trim(), acao: 'tema.criar' as const }
    },
    onSuccess: (result) => {
      if (result) {
        void logAudit({
          acao: result.acao,
          entidade: 'temas',
          entidade_id: result.id,
          detalhes: { conteudo_id: conteudoId, tema: result.titulo },
        })
      }
      toast.success(isEditing ? 'Reflexão atualizada' : 'Reflexão cadastrada')
      reset()
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['temas', conteudoId] })
      queryClient.invalidateQueries({ queryKey: ['app-temas', conteudoId] })
    },
    onError: (err: Error) => toast.error(err.message || 'Erro ao salvar'),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title={isEditing ? 'Editar reflexão' : 'Nova reflexão'}
      description="Três partes: frase do livro, orientação para o aluno e pergunta."
    >
      <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
        <ReflexaoFormFields register={register} mode="tema" />
        <FieldError message={errors.tema?.message} />
        <FieldError message={errors.questionamento?.message} />

        <div className="flex items-center gap-2">
          <input type="checkbox" id="tema-status" className="h-4 w-4 rounded" {...register('status')} />
          <Label htmlFor="tema-status" className="font-normal cursor-pointer">Ativo</Label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || save.isPending}>
            {save.isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
