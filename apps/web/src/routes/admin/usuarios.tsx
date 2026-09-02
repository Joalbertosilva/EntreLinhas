import { useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Plus, Pencil, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import type { Perfil, Profile } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { CreateUserDialog } from '@/features/admin/CreateUserDialog'
import { EditUserDialog } from '@/features/admin/EditUserDialog'
import { SetUserPasswordDialog } from '@/features/admin/SetUserPasswordDialog'
import { Dialog } from '@/components/ui/Dialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { TableSkeleton } from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'

export const Route = createFileRoute('/admin/usuarios')({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw redirect({ to: '/login' })

    const { data: profile } = await supabase
      .from('profiles')
      .select('perfil')
      .eq('id', session.user.id)
      .single()

    if (profile?.perfil !== 'administrador') {
      throw redirect({ to: '/admin' })
    }
  },
  component: UsuariosPage,
})

const PERFIL_CONFIG: Record<Perfil, { label: string; variant: 'primary' | 'accent' | 'default' }> = {
  aluno: { label: 'Aluno', variant: 'default' },
  professor: { label: 'Professor', variant: 'primary' },
  administrador: { label: 'Administrador', variant: 'accent' },
}

function UsuariosPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [resettingPassword, setResettingPassword] = useState<Profile | null>(null)
  const [deliveredPassword, setDeliveredPassword] = useState<{
    nome: string
    nome_usuario: string
    senha_temporaria: string
  } | null>(null)
  const [search, setSearch] = useState('')
  const [filterPerfil, setFilterPerfil] = useState<Perfil | 'all'>('all')

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Profile[]
    },
  })

  const filtered = useMemo(() => {
    if (!usuarios) return []
    const q = search.toLowerCase().trim()
    return usuarios.filter((u) => {
      const matchSearch =
        !q ||
        u.nome.toLowerCase().includes(q) ||
        u.nome_usuario.toLowerCase().includes(q)
      const matchPerfil = filterPerfil === 'all' || u.perfil === filterPerfil
      return matchSearch && matchPerfil
    })
  }, [usuarios, search, filterPerfil])

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status, nome_usuario }: { id: string; status: boolean; nome_usuario: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: !status })
        .eq('id', id)
      if (error) throw error
      return { id, nome_usuario, status }
    },
    onSuccess: (result) => {
      void logAudit({
        acao: result.status ? 'usuario.desativar' : 'usuario.reativar',
        entidade: 'profiles',
        entidade_id: result.id,
        detalhes: { nome_usuario: result.nome_usuario },
      })
      toast.success(result.status ? 'Usuário desativado' : 'Usuário reativado')
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      queryClient.invalidateQueries({ queryKey: ['visao-administrativa'] })
    },
    onError: () => toast.error('Não foi possível atualizar o status'),
  })

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Contas de alunos, professores e administradores."
        actions={
          <Button variant="secondary" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo usuário
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border bg-primary-light/25 p-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50" />
            <Input
              placeholder="Buscar por nome ou usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'aluno', 'professor', 'administrador'] as const).map((p) => (
              <Button
                key={p}
                variant={filterPerfil === p ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterPerfil(p)}
              >
                {p === 'all' ? 'Todos' : PERFIL_CONFIG[p].label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden md:table-cell">Login</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmpty
                  colSpan={5}
                  message={
                    search || filterPerfil !== 'all'
                      ? 'Nenhum usuário encontrado com os filtros aplicados'
                      : 'Nenhum usuário cadastrado ainda'
                  }
                />
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="transition-colors duration-200">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.nome} />
                        <span className="font-semibold text-text">{u.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden font-mono text-xs text-text-muted md:table-cell">
                      {u.nome_usuario}
                    </TableCell>
                    <TableCell>
                      <Badge variant={PERFIL_CONFIG[u.perfil].variant}>
                        {PERFIL_CONFIG[u.perfil].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status ? 'success' : 'error'}>
                        {u.status ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResettingPassword(u)}
                        >
                          <KeyRound className="h-4 w-4" />
                          Senha
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(u)}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant={u.status ? 'outline' : 'secondary'}
                          size="sm"
                          onClick={() =>
                            toggleStatus.mutate({
                              id: u.id,
                              status: u.status,
                              nome_usuario: u.nome_usuario,
                            })
                          }
                          disabled={toggleStatus.isPending}
                        >
                          {u.status ? 'Desativar' : 'Reativar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-border/80 px-4 py-3 text-xs text-text-muted">
            {filtered.length} de {usuarios?.length ?? 0} usuário(s)
          </div>
        )}
      </Card>

      {!isLoading && usuarios?.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/15 bg-accent-light/30 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-white shadow-[var(--shadow-soft)]">
            <UserPlus className="h-7 w-7" />
          </div>
          <p className="text-lg font-bold text-text">Nenhum usuário cadastrado</p>
          <p className="mt-2 text-sm text-text-muted">
            Comece adicionando o primeiro usuário da plataforma
          </p>
          <Button className="mt-5" variant="secondary" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Cadastrar usuário
          </Button>
        </div>
      )}

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <EditUserDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        usuario={editing}
      />
      <SetUserPasswordDialog
        usuario={resettingPassword}
        open={Boolean(resettingPassword)}
        onOpenChange={(open) => {
          if (!open) setResettingPassword(null)
        }}
        onSuccess={setDeliveredPassword}
      />
      <Dialog
        open={Boolean(deliveredPassword)}
        onOpenChange={(open) => {
          if (!open) setDeliveredPassword(null)
        }}
        title="Senha redefinida"
        description="Anote e entregue pessoalmente. Esta senha não será exibida novamente."
      >
        {deliveredPassword && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-text-muted">Usuário</p>
              <p className="font-medium text-text">{deliveredPassword.nome}</p>
              <p className="mt-2 font-mono text-text">@{deliveredPassword.nome_usuario}</p>
              <p className="mt-2 text-text-muted">Senha temporária</p>
              <p className="font-mono text-lg font-semibold text-text">
                {deliveredPassword.senha_temporaria}
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setDeliveredPassword(null)}>Entendi</Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  )
}
