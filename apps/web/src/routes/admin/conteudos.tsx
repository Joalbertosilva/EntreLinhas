import { useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookMarked,
  BookOpen,
  Music,
  PenLine,
  Plus,
  Quote,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Conteudo, TipoConteudo } from '@tcc-sistema/types'
import { TIPOS_CONTEUDO } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { deleteCoverByUrl } from '@/lib/storage'
import { logAudit } from '@/lib/audit'
import { invalidateConteudoCaches } from '@/lib/conteudoQueries'
import { ContentFormDialog } from '@/features/conteudos/ContentFormDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { TIPO_CONTEUDO_ICON_COLOR, TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/admin/conteudos')({
  component: ConteudosPage,
})

const TIPO_ICONS: Record<TipoConteudo, typeof BookOpen> = {
  livro: BookOpen,
  cronica: PenLine,
  poema: Quote,
  musica: Music,
  frase: Sparkles,
  outro: BookMarked,
}

function ConteudosPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Conteudo | null>(null)
  const [deleting, setDeleting] = useState<Conteudo | null>(null)
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState<TipoConteudo | 'all'>('all')

  const { data: conteudos, isLoading } = useQuery({
    queryKey: ['conteudos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conteudos')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Conteudo[]
    },
  })

  const filtered = useMemo(() => {
    if (!conteudos) return []
    const q = search.toLowerCase().trim()
    return conteudos.filter((c) => {
      const matchSearch =
        !q ||
        c.titulo.toLowerCase().includes(q) ||
        (c.autor?.toLowerCase().includes(q) ?? false)
      const matchTipo = filterTipo === 'all' || c.tipo === filterTipo
      return matchSearch && matchTipo
    })
  }, [conteudos, search, filterTipo])

  const deleteContent = useMutation({
    mutationFn: async (item: Conteudo) => {
      await deleteCoverByUrl(item.capa_url)
      const { error } = await supabase.from('conteudos').delete().eq('id', item.id)
      if (error) throw error
      return item
    },
    onSuccess: (item) => {
      void logAudit({
        acao: 'conteudo.excluir',
        entidade: 'conteudos',
        entidade_id: item.id,
        detalhes: { titulo: item.titulo },
      })
      toast.success('Conteúdo excluído')
      setDeleting(null)
      invalidateConteudoCaches(queryClient, item.id)
    },
    onError: () => toast.error('Não foi possível excluir o conteúdo'),
  })

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: boolean }) => {
      const { error } = await supabase
        .from('conteudos')
        .update({ status: !status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: (_, { id, status }) => {
      void logAudit({
        acao: status ? 'conteudo.desativar' : 'conteudo.reativar',
        entidade: 'conteudos',
        entidade_id: id,
      })
      toast.success(status ? 'Conteúdo desativado' : 'Conteúdo reativado')
      invalidateConteudoCaches(queryClient, id)
    },
    onError: () => toast.error('Não foi possível atualizar o status'),
  })

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (conteudo: Conteudo) => {
    setEditing(conteudo)
    setDialogOpen(true)
  }

  return (
    <>
      <PageHeader
        title="Conteúdos"
        description="Livros, crônicas, poemas e demais materiais para os alunos."
        actions={
          <Button variant="secondary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Novo conteúdo
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Buscar por título ou autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterTipo === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterTipo('all')}
          >
            Todos
          </Button>
          {TIPOS_CONTEUDO.map((t) => (
            <Button
              key={t}
              variant={filterTipo === t ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterTipo(t)}
            >
              {TIPO_CONTEUDO_LABEL[t]}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-32" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/15 bg-primary-light/35 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-[var(--shadow-soft)]">
            <BookOpen className="h-7 w-7" />
          </div>
          <p className="text-lg font-bold text-text">
            {search || filterTipo !== 'all'
              ? 'Nenhum conteúdo encontrado'
              : 'Nenhum conteúdo cadastrado'}
          </p>
          <p className="mt-2 text-sm text-text-muted max-w-sm">
            {search || filterTipo !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece adicionando o primeiro material literário da plataforma'}
          </p>
          {!search && filterTipo === 'all' && (
            <Button className="mt-6" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Cadastrar conteúdo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const Icon = TIPO_ICONS[c.tipo]
            return (
              <Card
                key={c.id}
                className={cn('group card-lift', !c.status && 'opacity-70')}
              >
                {c.capa_url ? (
                  <div className="relative h-36 overflow-hidden rounded-t-xl bg-surface">
                    <img
                      src={c.capa_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2 top-2">
                      <Badge variant={c.status ? 'success' : 'error'}>
                        {c.status ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        TIPO_CONTEUDO_ICON_COLOR[c.tipo],
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    {!c.capa_url && (
                      <Badge variant={c.status ? 'success' : 'error'}>
                        {c.status ? 'Ativo' : 'Inativo'}
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-4 font-bold text-text leading-snug line-clamp-2">
                    {c.titulo}
                  </h3>

                  {c.autor && (
                    <p className="mt-1 text-sm text-text-muted line-clamp-1">{c.autor}</p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="accent">{TIPO_CONTEUDO_LABEL[c.tipo]}</Badge>
                  </div>

                  {c.descricao && (
                    <p className="mt-3 text-sm text-text-muted line-clamp-2 leading-relaxed">
                      {c.descricao}
                    </p>
                  )}

                  <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
                    <Link
                      to="/admin/conteudos/$conteudoId"
                      params={{ conteudoId: c.id }}
                      className="block"
                    >
                      <Button variant="primary" size="sm" className="w-full">
                        <Settings2 className="h-4 w-4" />
                        Gerenciar
                      </Button>
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-w-0 flex-1"
                        onClick={() => openEdit(c)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant={c.status ? 'ghost' : 'secondary'}
                        size="sm"
                        className="min-w-0 flex-1"
                        onClick={() => toggleStatus.mutate({ id: c.id, status: c.status })}
                        disabled={toggleStatus.isPending}
                      >
                        {c.status ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => setDeleting(c)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="mt-6 text-center text-xs text-text-muted">
          {filtered.length} de {conteudos?.length ?? 0} conteúdo(s)
        </p>
      )}

      <ContentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        conteudo={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir conteúdo"
        description={
          deleting
            ? `Tem certeza que deseja excluir "${deleting.titulo}"? Temas e materiais vinculados também serão removidos.`
            : ''
        }
        confirmLabel="Excluir"
        loading={deleteContent.isPending}
        onConfirm={() => deleting && deleteContent.mutate(deleting)}
      />
    </>
  )
}
