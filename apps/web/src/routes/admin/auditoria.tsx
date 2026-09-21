import { useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  BarChart3,
  ClipboardList,
  Download,
  GitBranch,
  History,
  List,
  Search,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  AuditDetailPanel,
  AuditFlowFilterBanner,
  AuditListView,
  AuditResumoView,
  AuditSystemFlowsDiagram,
  AuditTimelineView,
  computeAuditStats,
  exportAuditLogsCsv,
  filterAuditLogs,
  useAuditLogs,
  type AuditActivityConfig,
  type AuditLogRow,
  type AuditViewTab,
  type SystemFlowId,
} from '@/features/admin/audit'
import { usePendingPasswordResetCount } from '@/features/admin/usePendingPasswordResetCount'
import { AUDIT_CATEGORIA_FILTERS, type AuditCategoria } from '@/lib/auditLabels'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

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

const VIEW_TABS: Array<{ id: AuditViewTab; label: string; icon: typeof List }> = [
  { id: 'lista', label: 'Lista', icon: List },
  { id: 'timeline', label: 'Linha do tempo', icon: History },
  { id: 'fluxo', label: 'Fluxos do sistema', icon: GitBranch },
  { id: 'resumo', label: 'Resumo', icon: BarChart3 },
]

function AuditoriaPage() {
  const [categoria, setCategoria] = useState<AuditCategoria>('all')
  const [search, setSearch] = useState('')
  const [viewTab, setViewTab] = useState<AuditViewTab>('lista')
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null)
  const [selectedFlowId, setSelectedFlowId] = useState<SystemFlowId>('senha')
  const [flowStepId, setFlowStepId] = useState<string | null>(null)
  const [flowAcoesFilter, setFlowAcoesFilter] = useState<string[] | null>(null)
  const [activityConfig, setActivityConfig] = useState<AuditActivityConfig>(() => {
    const now = new Date()
    return { period: '14d', month: now.getMonth() + 1, year: now.getFullYear() }
  })

  const { data: logs, isLoading } = useAuditLogs()
  const { data: pendingSenhaCount = 0 } = usePendingPasswordResetCount()

  const stats = useMemo(() => (logs ? computeAuditStats(logs) : undefined), [logs])

  const filtered = useMemo(() => {
    if (!logs) return []
    return filterAuditLogs(logs, categoria, search, flowAcoesFilter)
  }, [logs, categoria, search, flowAcoesFilter])

  const hasFlowFilter =
    flowStepId !== null || (flowAcoesFilter !== null && flowAcoesFilter.length > 0)

  const emptyMessage =
    search || categoria !== 'all' || hasFlowFilter
      ? 'Nenhum registro encontrado com esses filtros'
      : 'Nenhum registro de auditoria ainda'

  const clearFlowFilter = () => {
    setFlowStepId(null)
    setFlowAcoesFilter(null)
    setCategoria('all')
  }

  const handleFlowChange = (flowId: SystemFlowId) => {
    setSelectedFlowId(flowId)
    setFlowStepId(null)
    setFlowAcoesFilter(null)
  }

  const handleFlowStepSelect = (
    stepId: string | null,
    acoes: string[],
    flowId: SystemFlowId,
  ) => {
    if (!stepId) {
      clearFlowFilter()
      return
    }

    setFlowStepId(stepId)

    if (flowId === 'senha' && stepId === 'fila') {
      setCategoria('senha')
      setFlowAcoesFilter(null)
      setViewTab('lista')
      return
    }

    if (flowId === 'usuarios') setCategoria('usuarios')
    if (flowId === 'conteudos') setCategoria('conteudos')
    if (flowId === 'senha') setCategoria('senha')

    setFlowAcoesFilter(acoes.length > 0 ? acoes : null)
    if (stepId && acoes.length > 0 && viewTab === 'fluxo') {
      setViewTab('lista')
    }
  }

  const handleExport = () => {
    exportAuditLogsCsv(filtered)
  }

  const showEmptyState =
    !isLoading &&
    filtered.length === 0 &&
    !search &&
    categoria === 'all' &&
    !hasFlowFilter &&
    viewTab !== 'resumo' &&
    viewTab !== 'fluxo'

  const isHistoricoTab = viewTab === 'lista' || viewTab === 'timeline'

  return (
    <>
      <PageHeader
        title="Auditoria"
        description="Histórico de ações administrativas e de segurança. Consulte registros, linha do tempo ou fluxos do sistema — gráficos ficam em Resumo."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoading || filtered.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="space-y-3 border-b border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1 rounded-xl bg-primary-light/40 p-1">
              {VIEW_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    type="button"
                    size="sm"
                    variant={viewTab === tab.id ? 'primary' : 'ghost'}
                    className={cn(
                      'rounded-lg',
                      viewTab !== tab.id && 'text-text-muted hover:text-primary',
                    )}
                    onClick={() => setViewTab(tab.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>

          </div>

          {isHistoricoTab && hasFlowFilter ? (
            <AuditFlowFilterBanner
              flowId={selectedFlowId}
              stepId={flowStepId}
              acoesFilter={flowAcoesFilter}
              onClear={clearFlowFilter}
            />
          ) : null}

          {isHistoricoTab ? (
            <>
              <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Buscar por ação, usuário ou detalhe..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {AUDIT_CATEGORIA_FILTERS.map((item) => (
                  <Button
                    key={item.value}
                    type="button"
                    size="sm"
                    variant={categoria === item.value ? 'primary' : 'outline'}
                    className={cn('rounded-full', categoria !== item.value && 'bg-white')}
                    onClick={() => setCategoria(item.value)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {viewTab === 'lista' ? (
          <AuditListView
            logs={filtered}
            isLoading={isLoading}
            selectedId={selectedLog?.id ?? null}
            onSelect={setSelectedLog}
            emptyMessage={emptyMessage}
          />
        ) : null}

        {viewTab === 'timeline' ? (
          isLoading ? (
            <div className="p-8 text-center text-sm text-text-muted">Carregando...</div>
          ) : (
            <AuditTimelineView
              logs={filtered}
              selectedId={selectedLog?.id ?? null}
              onSelect={setSelectedLog}
              emptyMessage={emptyMessage}
            />
          )
        ) : null}

        {viewTab === 'fluxo' ? (
          <AuditSystemFlowsDiagram
            logs={logs ?? []}
            pendingSenha={pendingSenhaCount}
            selectedFlowId={selectedFlowId}
            onFlowChange={handleFlowChange}
            activeStepId={flowStepId}
            onStepSelect={handleFlowStepSelect}
          />
        ) : null}

        {viewTab === 'resumo' ? (
          <AuditResumoView
            logs={logs ?? []}
            stats={stats}
            pendingSenha={pendingSenhaCount}
            activityConfig={activityConfig}
            onActivityConfigChange={setActivityConfig}
            isLoading={isLoading}
          />
        ) : null}
      </Card>

      {showEmptyState && (
        <div className="mt-6 flex flex-col items-center rounded-xl border-2 border-dashed border-border/80 bg-white py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <p className="font-bold text-text">Sem registros por enquanto</p>
          <p className="mt-1 max-w-sm text-sm text-text-muted">
            Criação de usuários, alterações de conteúdo e pedidos de senha aparecem aqui
            automaticamente.
          </p>
        </div>
      )}

      <AuditDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  )
}
