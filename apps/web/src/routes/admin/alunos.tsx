import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import type { StatusLeitura } from '@tcc-sistema/types'
import {
  calcularProgressoAluno,
  faixaDoNivel,
  progressoJornadaAdmin,
  rotuloFaixaNivel,
} from '@/features/app/alunoProgress'
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
  nivel: number
  xp: number
  faixaNome: string
  faixaCor: string
  percentualJornada: number
  progressoNaFaixaPct: number
  rotuloProximoMarco: string
}

export const Route = createFileRoute('/admin/alunos')({
  component: AlunosPage,
})

function AlunosPage() {
  const [search, setSearch] = useState('')

  const { data: alunos, isLoading } = useQuery({
    queryKey: ['evolucao-alunos'],
    queryFn: async () => {
      const [{ data: evolucao, error: evolucaoError }, { data: leituras, error: leiturasError }] =
        await Promise.all([
          supabase.from('evolucao_aluno').select('*').order('nome'),
          supabase.from('leituras').select('usuario_id, status_leitura'),
        ])

      if (evolucaoError) throw evolucaoError
      if (leiturasError) throw leiturasError

      const leiturasPorAluno = new Map<string, Array<{ status_leitura: StatusLeitura }>>()
      for (const l of leituras ?? []) {
        const uid = l.usuario_id as string
        const list = leiturasPorAluno.get(uid) ?? []
        list.push({ status_leitura: l.status_leitura as StatusLeitura })
        leiturasPorAluno.set(uid, list)
      }

      return (evolucao ?? []).map((row) => {
        const progress = calcularProgressoAluno(leiturasPorAluno.get(row.usuario_id as string) ?? [])
        const faixa = faixaDoNivel(progress.nivel)
        const jornada = progressoJornadaAdmin(progress.nivel)
        return {
          ...(row as Omit<
            EvolucaoAluno,
            | 'nivel'
            | 'xp'
            | 'faixaNome'
            | 'faixaCor'
            | 'percentualJornada'
            | 'progressoNaFaixaPct'
            | 'rotuloProximoMarco'
          >),
          nivel: progress.nivel,
          xp: progress.xp,
          faixaNome: faixa.nome,
          faixaCor: faixa.cor,
          percentualJornada: jornada.percentualJornada,
          progressoNaFaixaPct: jornada.progressoNaFaixaPct,
          rotuloProximoMarco: jornada.rotuloProximoMarco,
        }
      }) as EvolucaoAluno[]
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
        description="Acompanhe leituras concluídas, nível de progresso e última atividade."
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
                <TableHead>Nível</TableHead>
                <TableHead className="hidden md:table-cell">Jornada (nv. 50)</TableHead>
                <TableHead className="hidden lg:table-cell">Última atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableEmpty
                  colSpan={5}
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
                      <div className="space-y-1.5">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
                          style={{
                            backgroundColor: `${a.faixaCor}18`,
                            color: a.faixaCor,
                          }}
                          title={`${rotuloFaixaNivel(a.nivel)} · ${a.xp} XP`}
                        >
                          Nv. {a.nivel}/{50}
                          <span className="font-normal opacity-80">· {a.faixaNome}</span>
                        </span>
                        <div className="flex items-center gap-2 md:hidden">
                          <div
                            className="h-1.5 min-w-[4.5rem] flex-1 overflow-hidden rounded-full bg-primary-light"
                            title={a.rotuloProximoMarco}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${a.percentualJornada}%`,
                                backgroundColor: a.faixaCor,
                              }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-text-muted">
                            {a.percentualJornada}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="min-w-[10rem] space-y-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-24 overflow-hidden rounded-full bg-primary-light"
                            title={`${a.percentualJornada}% da jornada até o nível 50`}
                          >
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${a.percentualJornada}%`,
                                backgroundColor: a.faixaCor,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium tabular-nums text-text">
                            {a.percentualJornada}%
                          </span>
                        </div>
                        <p className="text-xs leading-snug text-text-muted" title={a.rotuloProximoMarco}>
                          {a.rotuloProximoMarco}
                        </p>
                        <p className="text-[0.6875rem] text-text-muted/80">
                          Faixa atual: {a.progressoNaFaixaPct}% · {a.xp} XP
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-text-muted">
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
