import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { conteudoFormSchema, type ConteudoFormInput } from '@tcc-sistema/schemas'
import type { Conteudo, TipoConteudo } from '@tcc-sistema/types'
import { TIPOS_CONTEUDO } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { deleteCoverByUrl, uploadCover } from '@/lib/storage'
import { logAudit } from '@/lib/audit'
import { invalidateConteudoCaches } from '@/lib/conteudoQueries'
import { loadReflexaoFields, syncReflexaoTema } from '@/features/conteudos/conteudoReflexao'
import { ReflexaoFormFields } from '@/features/conteudos/ReflexaoFormFields'
import { emptyToNull, TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { Button } from '@/components/ui/Button'
import { CoverUpload } from '@/components/ui/CoverUpload'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { FieldError, Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface ContentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conteudo?: Conteudo | null
}

const defaultValues: ConteudoFormInput = {
  titulo: '',
  tipo: 'livro',
  autor: '',
  descricao: '',
  resumo: '',
  personagens: '',
  contexto: '',
  pontos_importantes: '',
  curiosidades: '',
  conteudo_textual: '',
  capa_url: '',
  status: true,
  reflexao_tema: '',
  reflexao_frase: '',
  reflexao_texto: '',
  reflexao_pergunta: '',
}

function toFormValues(conteudo: Conteudo): ConteudoFormInput {
  return {
    titulo: conteudo.titulo,
    tipo: conteudo.tipo,
    autor: conteudo.autor ?? '',
    descricao: conteudo.descricao ?? '',
    resumo: conteudo.resumo ?? '',
    personagens: conteudo.personagens ?? '',
    contexto: conteudo.contexto ?? '',
    pontos_importantes: conteudo.pontos_importantes ?? '',
    curiosidades: conteudo.curiosidades ?? '',
    conteudo_textual: conteudo.conteudo_textual ?? '',
    capa_url: conteudo.capa_url ?? '',
    status: conteudo.status,
    reflexao_tema: '',
    reflexao_frase: '',
    reflexao_texto: '',
    reflexao_pergunta: '',
  }
}

function toDbPayload(data: ConteudoFormInput, userId: string, isEdit: boolean, capaUrl: string | null) {
  const base = {
    titulo: data.titulo.trim(),
    tipo: data.tipo,
    autor: emptyToNull(data.autor ?? ''),
    descricao: emptyToNull(data.descricao ?? ''),
    resumo: emptyToNull(data.resumo ?? ''),
    personagens: emptyToNull(data.personagens ?? ''),
    contexto: emptyToNull(data.contexto ?? ''),
    pontos_importantes: emptyToNull(data.pontos_importantes ?? ''),
    curiosidades: emptyToNull(data.curiosidades ?? ''),
    conteudo_textual: emptyToNull(data.conteudo_textual ?? ''),
    capa_url: capaUrl,
    status: data.status ?? true,
  }
  return isEdit ? base : { ...base, responsavel_id: userId }
}

export function ContentFormDialog({ open, onOpenChange, conteudo }: ContentFormDialogProps) {
  const queryClient = useQueryClient()
  const isEditing = Boolean(conteudo)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConteudoFormInput>({
    resolver: zodResolver(conteudoFormSchema),
    defaultValues,
  })

  const tipo = watch('tipo')

  useEffect(() => {
    if (open) {
      reset(conteudo ? toFormValues(conteudo) : defaultValues)
      setCoverFile(null)
      setCoverUrl(conteudo?.capa_url ?? null)

      if (conteudo?.id) {
        void loadReflexaoFields(conteudo.id).then(
          ({ reflexao_tema, reflexao_frase, reflexao_texto, reflexao_pergunta }) => {
            setValue('reflexao_tema', reflexao_tema)
            setValue('reflexao_frase', reflexao_frase)
            setValue('reflexao_texto', reflexao_texto)
            setValue('reflexao_pergunta', reflexao_pergunta)
          },
        )
      }
    }
  }, [open, conteudo, reset, setValue])

  const saveContent = useMutation({
    mutationFn: async (input: ConteudoFormInput) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Sessão expirada')

      const previousCoverUrl = conteudo?.capa_url ?? null
      let finalCoverUrl = coverUrl

      if (isEditing && conteudo) {
        if (coverFile) {
          finalCoverUrl = await uploadCover(coverFile, conteudo.id)
          if (previousCoverUrl && previousCoverUrl !== finalCoverUrl) {
            await deleteCoverByUrl(previousCoverUrl)
          }
        } else if (coverUrl === null && previousCoverUrl) {
          await deleteCoverByUrl(previousCoverUrl)
        }

        const payload = toDbPayload(input, user.id, true, finalCoverUrl)
        const { error } = await supabase
          .from('conteudos')
          .update(payload)
          .eq('id', conteudo.id)
        if (error) throw error
        await syncReflexaoTema(
          conteudo.id,
          input.reflexao_tema,
          input.reflexao_frase,
          input.reflexao_texto,
          input.reflexao_pergunta,
        )
        return { id: conteudo.id, titulo: input.titulo, action: 'atualizar' as const }
      }

      const payload = toDbPayload(input, user.id, false, null)
      const { data: inserted, error } = await supabase
        .from('conteudos')
        .insert(payload)
        .select('id')
        .single()
      if (error) throw error

      if (coverFile && inserted?.id) {
        finalCoverUrl = await uploadCover(coverFile, inserted.id)
        const { error: updateError } = await supabase
          .from('conteudos')
          .update({ capa_url: finalCoverUrl })
          .eq('id', inserted.id)
        if (updateError) throw updateError
      }

      await syncReflexaoTema(
        inserted.id,
        input.reflexao_tema,
        input.reflexao_frase,
        input.reflexao_texto,
        input.reflexao_pergunta,
      )
      return { id: inserted.id, titulo: input.titulo, action: 'criar' as const }
    },
    onSuccess: (result) => {
      if (result) {
        void logAudit({
          acao: result.action === 'criar' ? 'conteudo.criar' : 'conteudo.atualizar',
          entidade: 'conteudos',
          entidade_id: result.id,
          detalhes: { titulo: result.titulo },
        })
      }
      toast.success(isEditing ? 'Conteúdo atualizado' : 'Conteúdo cadastrado')
      reset()
      setCoverFile(null)
      onOpenChange(false)
      invalidateConteudoCaches(queryClient, result?.id ?? conteudo?.id)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Não foi possível salvar o conteúdo')
    },
  })

  const onSubmit = (data: ConteudoFormInput) => saveContent.mutate(data)

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset()
          setCoverFile(null)
        }
        onOpenChange(v)
      }}
      title={isEditing ? 'Editar conteúdo' : 'Novo conteúdo'}
      description="Cadastre livros, crônicas, poemas e outros materiais para os alunos."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label>Capa {tipo === 'livro' ? 'do livro' : 'do conteúdo'}</Label>
          <CoverUpload
            value={coverUrl}
            onChange={setCoverUrl}
            onFileSelect={setCoverFile}
            disabled={saveContent.isPending}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" placeholder="Nome do conteúdo" {...register('titulo')} />
            <FieldError message={errors.titulo?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <Select id="tipo" {...register('tipo')}>
              {TIPOS_CONTEUDO.map((t) => (
                <option key={t} value={t}>
                  {TIPO_CONTEUDO_LABEL[t as TipoConteudo]}
                </option>
              ))}
            </Select>
            <FieldError message={errors.tipo?.message} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autor">Autor</Label>
            <Input id="autor" placeholder="Autor ou referência" {...register('autor')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            rows={3}
            placeholder="Breve apresentação do conteúdo..."
            {...register('descricao')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resumo">Resumo</Label>
          <Textarea
            id="resumo"
            rows={3}
            placeholder="Síntese do conteúdo para orientar a leitura..."
            {...register('resumo')}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-accent/25 bg-accent-light/30 p-4">
          <div>
            <p className="text-sm font-semibold text-brand-navy">Reflexão do aluno</p>
            <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
              Três partes separadas: frase do livro, orientação e pergunta. O aluno vê cada uma
              em blocos distintos.
            </p>
          </div>
          <ReflexaoFormFields register={register} mode="conteudo" />
        </div>

        <details className="group rounded-lg border border-border bg-surface/50">
          <summary className="cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-text hover:bg-surface transition-colors">
            Detalhes adicionais
          </summary>
          <div className="space-y-4 border-t border-border/60 px-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="conteudo_textual">Texto integral</Label>
              <Textarea
                id="conteudo_textual"
                rows={4}
                placeholder="Conteúdo textual completo (se aplicável)..."
                {...register('conteudo_textual')}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="personagens">Personagens</Label>
                <Textarea id="personagens" rows={2} {...register('personagens')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contexto">Contexto histórico</Label>
                <Textarea id="contexto" rows={2} {...register('contexto')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pontos_importantes">Pontos importantes</Label>
              <Textarea id="pontos_importantes" rows={2} {...register('pontos_importantes')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curiosidades">Curiosidades</Label>
              <Textarea id="curiosidades" rows={2} {...register('curiosidades')} />
            </div>
          </div>
        </details>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="status"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            {...register('status')}
          />
          <Label htmlFor="status" className="font-normal cursor-pointer">
            Conteúdo ativo (visível para alunos)
          </Label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || saveContent.isPending}>
            {saveContent.isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar conteúdo'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
