import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { PasswordResetRequestStatus, PasswordResetRequestWithProfile } from '@tcc-sistema/types'
import { supabase } from '@/lib/supabase'
import { AttendPasswordResetDialog } from '@/features/admin/AttendPasswordResetDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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
import { Dialog } from '@/components/ui/Dialog'

export const Route = createFileRoute('/admin/requerimentos-senha')({
  component: RequerimentosSenhaPage,
})

function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'agora há pouco'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffHour < 24) return `há ${diffHour} h`
  if (diffDay < 30) return `há ${diffDay} dia${diffDay > 1 ? 's' : ''}`
  return date.toLocaleDateString('pt-BR')
}

const STATUS_FILTER: Array<{ value: PasswordResetRequestStatus | 'all'; label: string }> = [
  { value: 'pendente', label: 'Pendentes' },
  { value: 'atendido', label: 'Atendidos' },
  { value: 'all', label: 'Todos' },
]

function RequerimentosSenhaPage() {
  const [filter, setFilter] = useState<PasswordResetRequestStatus | 'all'>('pendente')
  const [attending, setAttending] = useState<PasswordResetRequestWithProfile | null>(null)
  const [delivered, setDelivered] = useState<{
    nome: string
    nome_usuario: string
    senha_temporaria: string
  } | null>(null)

  const { data: requests, isLoading } = useQuery({
    queryKey: ['password-reset-requests', filter],
    queryFn: async () => {
      let query = supabase
        .from('password_reset_requests')
        .select('*, profiles!password_reset_requests_profile_id_fkey(nome, perfil)')
        .order('created_at', { ascending: filter === 'pendente' })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query
      if (error) throw error
      return data as PasswordResetRequestWithProfile[]
    },
  })

  const { data: pendentesCount = 0 } = useQuery({
    queryKey: ['password-reset-requests', 'pendente-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('password_reset_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente')
      if (error) throw error
      return count ?? 0
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recuperação de senha"
        description="Solicitações enviadas por alunos em “Esqueci minha senha”. Defina uma senha temporária e entregue pessoalmente."
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTER.map((item) => (
          <Button
            key={item.value}
            variant={filter === item.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
            {item.value === 'pendente' && pendentesCount > 0 && filter !== 'pendente' && (
              <Badge variant="accent" className="ml-1.5 px-1.5 py-0 text-[10px]">
                {pendentesCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Aluno</TableHead>
                <TableHead scope="col">Usuário</TableHead>
                <TableHead scope="col">Solicitado</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col" className="text-right">
                  Ação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!requests?.length ? (
                <TableEmpty
                  colSpan={5}
                  message={
                    filter === 'pendente'
                      ? 'Nenhuma solicitação pendente. Quando um aluno usar “Esqueci minha senha”, a solicitação aparecerá aqui.'
                      : 'Nenhuma solicitação encontrada'
                  }
                />
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-text">
                      {req.profiles?.nome ?? '—'}
                    </TableCell>
                    <TableCell className="text-text-muted">{req.nome_usuario}</TableCell>
                    <TableCell className="text-text-muted">
                      {formatRelativeTime(req.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={req.status === 'pendente' ? 'accent' : 'default'}>
                        {req.status === 'pendente' ? 'Pendente' : 'Atendido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {req.status === 'pendente' ? (
                        <Button size="sm" onClick={() => setAttending(req)}>
                          Atender
                        </Button>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <AttendPasswordResetDialog
        request={attending}
        open={Boolean(attending)}
        onOpenChange={(open) => {
          if (!open) setAttending(null)
        }}
        onSuccess={(data) => setDelivered(data)}
      />

      <Dialog
        open={Boolean(delivered)}
        onOpenChange={(open) => {
          if (!open) setDelivered(null)
        }}
        title="Senha temporária definida"
        description="Anote e entregue pessoalmente ao aluno. Esta senha não será exibida novamente."
      >
        {delivered && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-text-muted">Aluno</p>
              <p className="font-medium text-text">{delivered.nome}</p>
              <p className="mt-2 text-text-muted">Usuário</p>
              <p className="font-mono text-text">{delivered.nome_usuario}</p>
              <p className="mt-2 text-text-muted">Senha temporária</p>
              <p className="font-mono text-lg font-semibold text-text">{delivered.senha_temporaria}</p>
            </div>
            <p className="text-text-muted">
              Oriente o aluno a trocar a senha em <strong className="font-medium text-text">Perfil</strong>{' '}
              após entrar no sistema.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setDelivered(null)}>Entendi</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
