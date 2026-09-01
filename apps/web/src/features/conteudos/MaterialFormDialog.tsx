import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { materialFormSchema, type MaterialFormInput } from '@tcc-sistema/schemas'
import type { MaterialComplementar, TipoMaterial } from '@tcc-sistema/types'
import { TIPOS_MATERIAL } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { emptyToNull, TIPO_MATERIAL_LABEL } from '@/lib/labels'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { FieldError, Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface MaterialFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conteudoId: string
  material?: MaterialComplementar | null
}

const defaultValues: MaterialFormInput = {
  titulo: '',
  tipo: 'video',
  link: '',
  descricao: '',
  status: true,
}

function toFormValues(m: MaterialComplementar): MaterialFormInput {
  return {
    titulo: m.titulo,
    tipo: m.tipo,
    link: m.link,
    descricao: m.descricao ?? '',
    status: m.status,
  }
}

function toDbPayload(data: MaterialFormInput, conteudoId: string) {
  return {
    conteudo_id: conteudoId,
    titulo: data.titulo.trim(),
    tipo: data.tipo,
    link: data.link.trim(),
    descricao: emptyToNull(data.descricao ?? ''),
    status: data.status,
  }
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  conteudoId,
  material,
}: MaterialFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(material)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormInput>({
    resolver: zodResolver(materialFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) reset(material ? toFormValues(material) : defaultValues)
  }, [open, material, reset])

  const save = useMutation({
    mutationFn: async (input: MaterialFormInput) => {
      const payload = toDbPayload(input, conteudoId)
      if (isEditing && material) {
        const { error } = await supabase
          .from('materiais_complementares')
          .update(payload)
          .eq('id', material.id)
        if (error) throw error
        return
      }
      const { error } = await supabase.from('materiais_complementares').insert(payload)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Material atualizado' : 'Material cadastrado')
      reset()
      onOpenChange(false)
      queryClient.invalidateQueries({ queryKey: ['materiais', conteudoId] })
    },
    onError: (err: Error) => toast.error(err.message || 'Erro ao salvar material'),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title={isEditing ? 'Editar material' : 'Novo material'}
      description="Vídeos, áudios e links externos complementares ao conteúdo."
    >
      <form onSubmit={handleSubmit((d) => save.mutate(d))} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mat-titulo">Título *</Label>
          <Input id="mat-titulo" placeholder="Nome do material" {...register('titulo')} />
          <FieldError message={errors.titulo?.message} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mat-tipo">Tipo *</Label>
            <Select id="mat-tipo" {...register('tipo')}>
              {TIPOS_MATERIAL.map((t) => (
                <option key={t} value={t}>
                  {TIPO_MATERIAL_LABEL[t as TipoMaterial]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="mat-link">Link *</Label>
            <Input id="mat-link" placeholder="https://..." {...register('link')} />
            <FieldError message={errors.link?.message} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mat-descricao">Descrição</Label>
          <Textarea id="mat-descricao" rows={2} {...register('descricao')} />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="mat-status" className="h-4 w-4 rounded" {...register('status')} />
          <Label htmlFor="mat-status" className="font-normal cursor-pointer">Material ativo</Label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting || save.isPending}>
            {save.isPending ? 'Salvando...' : isEditing ? 'Salvar' : 'Cadastrar material'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
