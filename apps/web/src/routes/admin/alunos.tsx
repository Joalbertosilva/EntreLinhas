import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'

interface EvolucaoAluno {
  usuario_id: string
  nome: string
  nome_usuario: string
  quantidade_concluida: number
  pontuacao: number
  percentual_progresso: number
  ultima_interacao: string
}

export const Route = createFileRoute('/admin/alunos')({
  component: AlunosPage,
})

function AlunosPage() {
  const [search, setSearch] = useState('')

  const { data: alunos, isLoading } = useQuery({
    queryKey: ['evolucao-alunos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evolucao_aluno')
        .select('*')
        .order('nome')
      if (error) throw error
      return data as EvolucaoAluno[]
    },
  })

  const filtered = useMemo(() => {
    if (!alunos) return []
    const q = search.toLowerCase().trim()
    if (!q) return alunos
    return alunos.filter(
      (a) =>
        a.nome.toLowerCase().includes(q) ||
        a.nome_usuario.toLowerCase().includes(q),
    )
  }, [alunos, search])

  return (
    <>
      <PageHeader
        title="Alunos"
        description="Acompanhe leituras concluídas e última atividade na plataforma."
      />

      <Card>
        <div className="border-b border-border p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Aluno</TableHead>
                <TableHead className="hidden sm:table-cell">Leituras</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead className="hidden md:table-cell">Última atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmpty
                  colSpan={4}
                  message={
                    search
                      ? 'Nenhum aluno encontrado'
                      : 'Ainda não há alunos cadastrados'
                  }
                />
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.usuario_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={a.nome} />
                        <div>
                          <p className="font-medium text-text">{a.nome}</p>
                          <p className="text-xs text-text-muted">{a.nome_usuario}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell tabular-nums">
                      {a.quantidade_concluida}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-primary-light">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(a.percentual_progresso, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums text-text-muted">
                          {a.percentual_progresso}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-text-muted">
                      {a.ultima_interacao && a.ultima_interacao !== '1970-01-01T00:00:00+00:00'
                        ? new Date(a.ultima_interacao).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Sem atividade ainda'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  )
}
