import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { conteudoFormSchema, type ConteudoFormInput } from '@tcc-sistema/schemas'
import type { Conteudo, TipoConteudo } from '@tcc-sistema/types'
import { BookOpen, Music, PenLine, Quote, Video } from 'lucide-react'
import { CONTEUDO_TIPOS_PLATAFORMA } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { deleteCoverByUrl, uploadCover } from '@/lib/storage'
import { logAudit } from '@/lib/audit'
import { invalidateConteudoCaches } from '@/lib/conteudoQueries'
import { loadReflexaoFields, syncReflexaoTema } from '@/features/conteudos/conteudoReflexao'
import {
  REFLEXAO_LABELS,
  shouldSyncReflexao,
  toDbPayload,
  type PlataformaConteudoTipo,
  type ReflexaoFormVariant,
} from '@/features/conteudos/contentFormConfig'
import { ContentFormFieldsByTipo } from '@/features/conteudos/ContentFormFieldsByTipo'
import { ReflexaoFormFields } from '@/features/conteudos/ReflexaoFormFields'
import { TIPO_CONTEUDO_ICON_COLOR, TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CoverUpload } from '@/components/ui/CoverUpload'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { LabelWithHint } from '@/components/ui/FieldHint'
import { FieldError, Label } from '@/components/ui/Label'

interface ContentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conteudo?: Conteudo | null
  defaultTipo?: TipoConteudo
}

const TIPO_PICKER_META: Record<
  PlataformaConteudoTipo,
  { icon: typeof BookOpen; hint: string }
> = {
  livro: { icon: BookOpen, hint: 'Romances, contos e leituras completas' },
  cronica: { icon: PenLine, hint: 'Textos curtos e narrativas breves' },
  poema: { icon: Quote, hint: 'Versos e poemas' },
  musica: { icon: Music, hint: 'Letras e links para ouvir' },
  video: { icon: Video, hint: 'Link externo — título e descrição apenas' },
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
  video_url: '',
  catalog_anchor: '',
  video_categoria: '',
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
    video_url: conteudo.video_url ?? '',
    catalog_anchor: conteudo.catalog_anchor ?? '',
    video_categoria: conteudo.video_categoria ?? '',
    status: conteudo.status,
    reflexao_tema: '',
    reflexao_frase: '',
    reflexao_texto: '',
    reflexao_pergunta: '',
  }
}

function buildDefaultValues(defaultTipo?: TipoConteudo): ConteudoFormInput {
  return {
    ...defaultValues,
    tipo: defaultTipo ?? defaultValues.tipo,
  }
}

function isPlataformaTipo(tipo: TipoConteudo): tipo is PlataformaConteudoTipo {
  return (CONTEUDO_TIPOS_PLATAFORMA as readonly TipoConteudo[]).includes(tipo)
}

export function ContentFormDialog({
  open,
  onOpenChange,
  conteudo,
  defaultTipo,
}: ContentFormDialogProps) {
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<ConteudoFormInput>({
    resolver: zodResolver(conteudoFormSchema),
    defaultValues: buildDefaultValues(defaultTipo),
  })

  const tipo = watch('tipo')
  const plataformaTipo = isPlataformaTipo(tipo) ? tipo : 'livro'
  const reflexaoVariant: ReflexaoFormVariant | null =
    plataformaTipo !== 'video' ? plataformaTipo : null

  useEffect(() => {
    if (open) {
      reset(conteudo ? toFormValues(conteudo) : buildDefaultValues(defaultTipo))
      setCoverFile(null)
      setCoverUrl(conteudo?.capa_url ?? null)

      if (conteudo?.id && shouldSyncReflexao(conteudo.tipo)) {
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
  }, [open, conteudo, defaultTipo, reset, setValue])

  const saveContent = useMutation({
    mutationFn: async (input: ConteudoFormInput) => {
      if (input.tipo === 'video' && !input.video_url?.trim()) {
        throw new Error('Informe o link do vídeo.')
      }

      if (
        (input.tipo === 'cronica' || input.tipo === 'poema' || input.tipo === 'musica') &&
        !input.conteudo_textual?.trim()
      ) {
        throw new Error(
          input.tipo === 'musica'
            ? 'Informe a letra completa da música.'
            : input.tipo === 'poema'
              ? 'Informe o texto completo do poema.'
              : 'Informe o texto completo da crônica.',
        )
      }

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

        if (shouldSyncReflexao(input.tipo)) {
          await syncReflexaoTema(
            conteudo.id,
            input.reflexao_tema,
            input.reflexao_frase,
            input.reflexao_texto,
            input.reflexao_pergunta,
          )
        }

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

      if (shouldSyncReflexao(input.tipo)) {
        await syncReflexaoTema(
          inserted.id,
          input.reflexao_tema,
          input.reflexao_frase,
          input.reflexao_texto,
          input.reflexao_pergunta,
        )
      }

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
      description="Cada tipo tem seu próprio formulário. Escolha o tipo e preencha só os campos relevantes."
      size="wide"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <LabelWithHint
            hint={
              isEditing
                ? 'O tipo não pode ser alterado após o cadastro.'
                : 'Escolha o tipo — o formulário abaixo muda conforme a seleção.'
            }
          >
            Tipo de conteúdo *
          </LabelWithHint>

          {isEditing ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3 py-2">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  TIPO_CONTEUDO_ICON_COLOR[tipo],
                )}
              >
                {(() => {
                  const Icon = TIPO_PICKER_META[plataformaTipo]?.icon ?? BookOpen
                  return <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                })()}
              </span>
              <span className="text-sm font-semibold text-text">{TIPO_CONTEUDO_LABEL[tipo]}</span>
            </div>
          ) : (
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
                  {CONTEUDO_TIPOS_PLATAFORMA.map((option) => {
                    const meta = TIPO_PICKER_META[option]
                    const Icon = meta.icon
                    const selected = field.value === option

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => field.onChange(option)}
                        className={cn(
                          'flex flex-col items-start gap-1 rounded-xl border-2 px-3 py-2.5 text-left transition-colors',
                          selected
                            ? 'border-primary bg-primary-light/45 shadow-[var(--shadow-soft)]'
                            : 'border-border bg-white hover:border-primary/25 hover:bg-surface/50',
                        )}
                        aria-pressed={selected}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg',
                              TIPO_CONTEUDO_ICON_COLOR[option],
                            )}
                          >
                            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                          </span>
                          <span className="text-sm font-semibold text-text">
                            {TIPO_CONTEUDO_LABEL[option]}
                          </span>
                        </span>
                        <span className="text-[11px] leading-snug text-text-muted">{meta.hint}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            />
          )}

          <FieldError message={errors.tipo?.message} />
        </div>

        <section className="space-y-4 rounded-xl border border-border/80 bg-white p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" placeholder="Nome do conteúdo" {...register('titulo')} />
              <FieldError message={errors.titulo?.message} />
            </div>

            {plataformaTipo !== 'video' && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="autor">Autor / canal</Label>
                <Input id="autor" placeholder="Autor, canal ou referência" {...register('autor')} />
              </div>
            )}
          </div>

          {plataformaTipo !== 'video' && (
            <div className="space-y-2">
              <Label>Capa {plataformaTipo === 'livro' ? 'do livro' : 'do conteúdo'}</Label>
              <CoverUpload
                value={coverUrl}
                onChange={setCoverUrl}
                onFileSelect={setCoverFile}
                disabled={saveContent.isPending}
              />
            </div>
          )}
        </section>

        <ContentFormFieldsByTipo
          tipo={plataformaTipo}
          register={register}
          errors={errors}
        />

        {reflexaoVariant && (
          <section className="space-y-4 rounded-xl border border-accent/25 bg-accent-light/25 p-4 sm:p-5">
            <div>
              <p className="text-sm font-semibold text-brand-navy">
                {REFLEXAO_LABELS[reflexaoVariant].sectionTitle}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                {REFLEXAO_LABELS[reflexaoVariant].sectionHint}
              </p>
            </div>
            <ReflexaoFormFields register={register} mode="conteudo" variant={reflexaoVariant} />
          </section>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="status"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            {...register('status')}
          />
          <Label htmlFor="status" className="cursor-pointer font-normal">
            Conteúdo ativo (visível para alunos)
          </Label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 pt-2">
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
