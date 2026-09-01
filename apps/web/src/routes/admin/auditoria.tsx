import { useMemo } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
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

export const Route = createFileRoute('/admin/auditoria')({
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
  component: AuditoriaPage,
})

interface AuditLogRow {
  id: string
  acao: string
  entidade: string | null
  entidade_id: string | null
  detalhes: Record<string, unknown> | null
  created_at: string
  usuario: { nome: string; nome_usuario: string } | null
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function AuditoriaPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, acao, entidade, entidade_id, detalhes, created_at, profiles!audit_logs_usuario_id_fkey(nome, nome_usuario)')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error

      return (data ?? []).map((row) => {
        const profile = row.profiles
        const usuario = Array.isArray(profile) ? profile[0] ?? null : profile
        return {
          id: row.id,
          acao: row.acao,
          entidade: row.entidade,
          entidade_id: row.entidade_id,
          detalhes: row.detalhes as Record<string, unknown> | null,
          created_at: row.created_at,
          usuario,
        }
      }) as AuditLogRow[]
    },
  })

  const empty = useMemo(() => !isLoading && (logs?.length ?? 0) === 0, [isLoading, logs])

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Registro de ações administrativas na plataforma."
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead className="hidden md:table-cell">Entidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empty ? (
                <TableEmpty colSpan={4} message="Nenhum registro de auditoria ainda" />
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm text-text-muted">
                      {formatDate(log.created_at)}
                    </TableCell>
                    <TableCell>
                      {log.usuario ? (
                        <div>
                          <p className="font-medium text-text">{log.usuario.nome}</p>
                          <p className="text-xs text-text-muted">{log.usuario.nome_usuario}</p>
                        </div>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="primary">{log.acao}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-text-muted">
                      {log.entidade ?? '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {empty && (
        <div className="mt-6 flex flex-col items-center rounded-xl border-2 border-dashed border-border/80 bg-white py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <p className="font-bold text-text">Sem registros por enquanto</p>
          <p className="mt-1 text-sm text-text-muted max-w-sm">
            Ações como criação de usuários aparecem aqui conforme forem registradas.
          </p>
        </div>
      )}
    </>
  )
}
