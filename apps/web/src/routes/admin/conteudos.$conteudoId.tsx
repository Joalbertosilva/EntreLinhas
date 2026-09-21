import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  ExternalLink,
  Layers,
  Lightbulb,
  Pencil,
  Plus,
  Trash2,
  Video,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Conteudo, MaterialComplementar, Tema } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { invalidateConteudoCaches } from '@/lib/conteudoQueries'
import { ContentFormDialog } from '@/features/conteudos/ContentFormDialog'
import { MaterialFormDialog } from '@/features/conteudos/MaterialFormDialog'
import { TemaFormDialog } from '@/features/conteudos/TemaFormDialog'
import { getReflexaoDisplay } from '@/features/conteudos/conteudoReflexao'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { TIPO_CONTEUDO_LABEL, TIPO_MATERIAL_LABEL } from '@/lib/labels'

export const Route = createFileRoute('/admin/conteudos/$conteudoId')({
  component: ConteudoDetailPage,
})

function ConteudoDetailPage() {
  const { conteudoId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [contentDialog, setContentDialog] = useState(false)
  const [temaDialog, setTemaDialog] = useState(false)
  const [materialDialog, setMaterialDialog] = useState(false)
  const [editingTema, setEditingTema] = useState<Tema | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<MaterialComplementar | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<
    { type: 'conteudo' } | { type: 'tema'; item: Tema } | { type: 'material'; item: MaterialComplementar } | null
  >(null)

  const { data: conteudo, isLoading, error } = useQuery({
    queryKey: ['conteudo', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .eq('id', conteudoId)
        .single()
      if (error) throw error
      return data as Conteudo
    },
  })

  const { data: temas, isLoading: loadingTemas } = useQuery({
    queryKey: ['temas', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('temas')
        .select('*')
        .eq('conteudo_id', conteudoId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Tema[]
    },
  })

  const { data: materiais, isLoading: loadingMateriais } = useQuery({
    queryKey: ['materiais', conteudoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais_complementares')
        .select('*')
        .eq('conteudo_id', conteudoId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as MaterialComplementar[]
    },
  })

  const deleteItem = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !conteudo) return null

      if (deleteTarget.type === 'conteudo') {
        const { error } = await supabase
          .from('conteudos')
          .update({ status: false })
          .eq('id', conteudo.id)
        if (error) throw error
        return {
          acao: 'conteudo.desativar',
          entidade: 'conteudos',
          entidade_id: conteudo.id,
          detalhes: { titulo: conteudo.titulo },
          type: 'conteudo' as const,
        }
      }

      if (deleteTarget.type === 'tema') {
        const { error } = await supabase
          .from('temas')
          .update({ status: false })
          .eq('id', deleteTarget.item.id)
        if (error) throw error
        return {
          acao: 'tema.desativar',
          entidade: 'temas',
          entidade_id: deleteTarget.item.id,
          detalhes: { conteudo_id: conteudoId, tema: deleteTarget.item.tema },
          type: 'tema' as const,
        }
      }

      const { error } = await supabase
        .from('materiais_complementares')
        .update({ status: false })
        .eq('id', deleteTarget.item.id)
      if (error) throw error
      return {
        acao: 'material.desativar',
        entidade: 'materiais_complementares',
        entidade_id: deleteTarget.item.id,
        detalhes: { conteudo_id: conteudoId, titulo: deleteTarget.item.titulo },
        type: 'material' as const,
      }
    },
    onSuccess: (result) => {
      if (result) {
        void logAudit({
          acao: result.acao,
          entidade: result.entidade,
          entidade_id: result.entidade_id,
          detalhes: result.detalhes,
        })
      }
      if (result?.type === 'conteudo') {
        toast.success('Conteúdo excluído')
        invalidateConteudoCaches(queryClient, conteudoId)
        navigate({ to: '/admin/conteudos' })
      } else if (result?.type === 'tema') {
        toast.success('Tema excluído')
        queryClient.invalidateQueries({ queryKey: ['temas', conteudoId] })
      } else if (result) {
        toast.success('Material excluído')
        queryClient.invalidateQueries({ queryKey: ['materiais', conteudoId] })
      }
      setDeleteTarget(null)
    },
    onError: () => toast.error('Não foi possível excluir'),
  })

  const toggleTema = useMutation({
    mutationFn: async ({ id, status, tema }: { id: string; status: boolean; tema: string }) => {
      const { error } = await supabase.from('temas').update({ status: !status }).eq('id', id)
      if (error) throw error
      return { id, status, tema }
    },
    onSuccess: (result) => {
      void logAudit({
        acao: result.status ? 'tema.desativar' : 'tema.reativar',
        entidade: 'temas',
        entidade_id: result.id,
        detalhes: { conteudo_id: conteudoId, tema: result.tema },
      })
      queryClient.invalidateQueries({ queryKey: ['temas', conteudoId] })
      toast.success('Status do tema atualizado')
    },
  })

  const toggleMaterial = useMutation({
    mutationFn: async ({
      id,
      status,
      titulo,
    }: {
      id: string
      status: boolean
      titulo: string
    }) => {
      const { error } = await supabase
        .from('materiais_complementares')
        .update({ status: !status })
        .eq('id', id)
      if (error) throw error
      return { id, status, titulo }
    },
    onSuccess: (result) => {
      void logAudit({
        acao: result.status ? 'material.desativar' : 'material.reativar',
        entidade: 'materiais_complementares',
        entidade_id: result.id,
        detalhes: { conteudo_id: conteudoId, titulo: result.titulo },
      })
      queryClient.invalidateQueries({ queryKey: ['materiais', conteudoId] })
      toast.success('Status do material atualizado')
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (error || !conteudo) {
    return (
      <div className="text-center py-16">
        <p className="font-bold text-text">Conteúdo não encontrado</p>
        <Link to="/admin/conteudos" className="mt-4 inline-block">
          <Button variant="outline">Voltar aos conteúdos</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <Link
          to="/admin/conteudos"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar aos conteúdos
        </Link>
      </div>

      <Card className="mb-8 overflow-hidden border-primary/10">
        {conteudo.capa_url && (
          <div className="h-48 sm:h-56 overflow-hidden bg-surface">
            <img
              src={conteudo.capa_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="accent">{TIPO_CONTEUDO_LABEL[conteudo.tipo]}</Badge>
                <Badge variant={conteudo.status ? 'success' : 'error'}>
                  {conteudo.status ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">{conteudo.titulo}</h1>
              {conteudo.autor && (
                <p className="mt-1 text-text-muted">por {conteudo.autor}</p>
              )}
              {conteudo.descricao && (
                <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-2xl">
                  {conteudo.descricao}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" onClick={() => setContentDialog(true)}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
              <Button variant="destructive" onClick={() => setDeleteTarget({ type: 'conteudo' })}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Temas */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light">
              <Lightbulb className="h-4 w-4 text-[#6b5a00]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Reflexão do aluno</h2>
              <p className="text-xs text-text-muted">
                Frase do livro e tema que aparecem na plataforma do aluno
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingTema(null)
              setTemaDialog(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Novo tema
          </Button>
        </div>

        {loadingTemas ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : !temas?.length ? (
          <EmptyBlock
            icon={<Lightbulb className="h-6 w-6 text-primary" />}
            title="Nenhuma reflexão cadastrada"
            description="Adicione a frase ou pergunta do livro que estimula a reflexão do aluno."
            action={
              <Button size="sm" variant="secondary" onClick={() => setTemaDialog(true)}>
                <Plus className="h-4 w-4" />
                Adicionar tema
              </Button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {temas.map((t) => {
              const { frase, reflexao, pergunta } = getReflexaoDisplay(t)
              return (
              <Card key={t.id} className={!t.status ? 'opacity-70' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-text">{t.tema}</h3>
                    <Badge variant={t.status ? 'success' : 'error'}>
                      {t.status ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {frase && (
                    <p className="mt-2 text-base leading-relaxed text-brand-navy">
                      &ldquo;{frase}&rdquo;
                    </p>
                  )}
                  {reflexao && (
                    <p className="mt-2 text-base leading-relaxed text-text-muted line-clamp-3">
                      Reflexão: {reflexao}
                    </p>
                  )}
                  {pergunta && (
                    <p className="mt-2 text-sm font-medium text-text">
                      Pergunta: {pergunta}
                    </p>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTema(t)
                        setTemaDialog(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTema.mutate({ id: t.id, status: t.status, tema: t.tema })}
                    >
                      {t.status ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label="Excluir tema"
                      onClick={() => setDeleteTarget({ type: 'tema', item: t })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        )}
      </section>

      {/* Materiais */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text">Materiais complementares</h2>
              <p className="text-xs text-text-muted">Vídeos, áudios e links externos</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingMaterial(null)
              setMaterialDialog(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Novo material
          </Button>
        </div>

        {loadingMateriais ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : !materiais?.length ? (
          <EmptyBlock
            icon={<Video className="h-6 w-6 text-primary" />}
            title="Nenhum material cadastrado"
            description="Adicione vídeos, áudios ou páginas externas relacionadas."
            action={
              <Button size="sm" variant="secondary" onClick={() => setMaterialDialog(true)}>
                <Plus className="h-4 w-4" />
                Adicionar material
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {materiais.map((m) => (
              <Card key={m.id} className={!m.status ? 'opacity-70' : ''}>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-text">{m.titulo}</h3>
                      <Badge variant="primary">{TIPO_MATERIAL_LABEL[m.tipo]}</Badge>
                      <Badge variant={m.status ? 'success' : 'error'}>
                        {m.status ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    {m.descricao && (
                      <p className="mt-1 text-sm text-text-muted line-clamp-1">{m.descricao}</p>
                    )}
                    <a
                      href={m.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {m.link}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMaterial(m)
                        setMaterialDialog(true)
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleMaterial.mutate({ id: m.id, status: m.status, titulo: m.titulo })
                      }
                    >
                      {m.status ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label="Excluir material"
                      onClick={() => setDeleteTarget({ type: 'material', item: m })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <ContentFormDialog
        open={contentDialog}
        onOpenChange={setContentDialog}
        conteudo={conteudo}
      />
      <TemaFormDialog
        open={temaDialog}
        onOpenChange={setTemaDialog}
        conteudoId={conteudoId}
        tema={editingTema}
      />
      <MaterialFormDialog
        open={materialDialog}
        onOpenChange={setMaterialDialog}
        conteudoId={conteudoId}
        material={editingMaterial}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.type === 'conteudo'
            ? 'Excluir conteúdo'
            : deleteTarget?.type === 'tema'
              ? 'Excluir tema'
              : 'Excluir material'
        }
        description={
          deleteTarget?.type === 'conteudo'
            ? `Excluir "${conteudo.titulo}" permanentemente? Temas e materiais também serão removidos.`
            : deleteTarget?.type === 'tema'
              ? `Excluir o tema "${deleteTarget.item.tema}"?`
              : deleteTarget?.type === 'material'
                ? `Excluir "${deleteTarget.item.titulo}"?`
                : ''
        }
        confirmLabel="Excluir"
        loading={deleteItem.isPending}
        onConfirm={() => deleteItem.mutate()}
      />
    </>
  )
}

function EmptyBlock({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border/80 bg-primary-light/20 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-[var(--shadow-soft)]">
        {icon}
      </div>
      <p className="font-bold text-text">{title}</p>
      <p className="mt-1 text-sm text-text-muted max-w-xs">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  )
}
