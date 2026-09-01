import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ScrollReveal } from '@/features/app'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/admin/obras')({
  component: AdminObrasPage,
})

interface ObraAlunoRow {
  id: string
  titulo: string
  descricao: string | null
  updated_at: string
  profiles: { nome: string; nome_usuario: string } | null
}

function AdminObrasPage() {
  const { data: obras = [], isLoading } = useQuery({
    queryKey: ['admin-obras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obras')
        .select('id, titulo, descricao, updated_at, profiles(nome, nome_usuario)')
        .eq('status', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return (data ?? []).map((row) => ({
        ...row,
        profiles: Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles,
      })) as ObraAlunoRow[]
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Obras dos alunos"
        description="Acompanhe as produções autorais iniciadas na plataforma."
      />

      <ScrollReveal>
        <Card className="overflow-hidden p-0">
          {isLoading ? (
            <p className="p-6 text-sm text-text-muted">Carregando obras…</p>
          ) : obras.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">
              Nenhuma obra registrada ainda. Quando os alunos começarem a escrever, elas aparecerão
              aqui.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {obras.map((obra) => (
                <li key={obra.id} className="px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-text">{obra.titulo}</p>
                      <p className="mt-0.5 text-sm text-text-muted">
                        {obra.profiles?.nome ?? 'Aluno'} · @{obra.profiles?.nome_usuario ?? '—'}
                      </p>
                      {obra.descricao && (
                        <p className="mt-2 line-clamp-2 text-sm text-text-muted">{obra.descricao}</p>
                      )}
                    </div>
                    <time
                      className="shrink-0 text-xs text-text-muted"
                      dateTime={obra.updated_at}
                    >
                      {new Date(obra.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </ScrollReveal>
    </div>
  )
}
