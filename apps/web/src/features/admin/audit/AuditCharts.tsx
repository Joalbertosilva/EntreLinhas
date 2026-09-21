import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { AUDIT_CATEGORIA_FILTERS } from '@/lib/auditLabels'
import { cn } from '@/lib/utils'
import {
  availableAuditYears,
  computeActivitySeries,
  computeCategoriaCounts,
  filterLogsByActivityConfig,
} from './auditUtils'
import type { AuditActivityConfig, AuditActivityPeriod, AuditActivityPoint, AuditLogRow } from './types'

interface AuditChartsProps {
  logs: AuditLogRow[]
  config: AuditActivityConfig
  onConfigChange: (config: AuditActivityConfig) => void
  isLoading: boolean
}

const PERIOD_OPTIONS: Array<{ value: AuditActivityPeriod; label: string }> = [
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'month', label: 'Mês' },
  { value: 'year', label: 'Ano' },
]

const MESES: Array<{ value: number; label: string }> = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

const CATEGORIA_META: Record<string, { color: string; label: string }> = {
  senha: { color: '#efb034', label: 'Senhas' },
  usuarios: { color: '#1c756a', label: 'Usuários' },
  conteudos: { color: '#6ec4b5', label: 'Conteúdos' },
  outros: { color: '#94a8b4', label: 'Outras' },
}

function periodDescription(config: AuditActivityConfig): string {
  switch (config.period) {
    case '7d':
      return 'Últimos 7 dias'
    case '14d':
      return 'Últimos 14 dias'
    case '30d':
      return 'Últimos 30 dias'
    case 'month': {
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
        new Date(config.year, config.month - 1, 1),
      )
      return label.charAt(0).toUpperCase() + label.slice(1)
    }
    case 'year':
      return `Ano ${config.year}`
  }
}

function chartDimensions(period: AuditActivityPeriod) {
  switch (period) {
    case '7d':
      return { barW: 36, barGap: 12, plotH: 200, labelStep: 1 }
    case '14d':
      return { barW: 28, barGap: 10, plotH: 200, labelStep: 1 }
    case '30d':
      return { barW: 18, barGap: 6, plotH: 200, labelStep: 2 }
    case 'month':
      return { barW: 16, barGap: 5, plotH: 220, labelStep: 1 }
    case 'year':
      return { barW: 40, barGap: 14, plotH: 200, labelStep: 1 }
  }
}

function xAxisCaption(period: AuditActivityPeriod): string {
  if (period === 'year') return 'Meses do ano'
  if (period === 'month') return 'Dias do mês'
  return 'Data (dia/mês)'
}

function shouldShowXLabel(index: number, total: number, step: number, period: AuditActivityPeriod) {
  if (period === 'month') {
    const day = index + 1
    if (day === 1 || day === total || day % 5 === 0) return true
    return false
  }
  return index % step === 0 || index === total - 1
}

function CategoryDonutChart({
  counts,
  total,
}: {
  counts: Record<string, number>
  total: number
}) {
  const categories = AUDIT_CATEGORIA_FILTERS.filter((f) => f.value !== 'all')
  const size = 168
  const stroke = 20
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <svg width={size} height={size} aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#d4ebe6"
            strokeWidth={stroke}
          />
        </svg>
        <p className="mt-3 text-base text-text-muted">Nenhum evento no período</p>
      </div>
    )
  }

  const segments = categories.map((cat) => {
    const count = counts[cat.value] ?? 0
    const pct = count / total
    const length = pct * circumference
    const segment = {
      key: cat.value,
      count,
      pct,
      dasharray: `${length} ${circumference - length}`,
      dashoffset: -offset,
      meta: CATEGORIA_META[cat.value],
    }
    offset += length
    return segment
  })

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:gap-10">
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#eef6f4"
            strokeWidth={stroke}
          />
          {segments.map((seg) =>
            seg.count > 0 ? (
              <circle
                key={seg.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.meta.color}
                strokeWidth={stroke}
                strokeDasharray={seg.dasharray}
                strokeDashoffset={seg.dashoffset}
                strokeLinecap="round"
              />
            ) : null,
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-text">{total}</span>
          <span className="text-sm text-text-muted">eventos</span>
        </div>
      </div>

      <ul className="w-full min-w-0 max-w-sm flex-1 space-y-2">
        {segments.map((seg) => (
          <li
            key={seg.key}
            className="grid grid-cols-[auto_minmax(0,1fr)_2.5rem_3rem] items-center gap-x-3 rounded-lg bg-surface-warm/50 px-3 py-2"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: seg.meta.color }}
              aria-hidden
            />
            <span className="truncate text-base text-text">{seg.meta.label}</span>
            <span className="text-right text-base font-semibold tabular-nums text-text">
              {seg.count}
            </span>
            <span className="text-right text-sm tabular-nums text-text-muted">
              {total > 0 ? `${Math.round(seg.pct * 100)}%` : '0%'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivityBarChart({
  series,
  period,
}: {
  series: AuditActivityPoint[]
  period: AuditActivityPeriod
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...series.map((d) => d.count), 1)
  const n = series.length
  const { barW, barGap, plotH, labelStep } = chartDimensions(period)

  const padLeft = 44
  const padRight = 20
  const padTop = 20
  const padBottom = 44
  const chartW = padLeft + padRight + n * barW + Math.max(0, n - 1) * barGap

  const yTicks = [0, Math.ceil(max / 2), max].filter((v, i, arr) => i === 0 || v !== arr[i - 1])
  const svgH = padTop + plotH + padBottom

  if (series.every((p) => p.count === 0)) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-surface-warm/30">
        <p className="text-base text-text-muted">Sem atividade no período selecionado</p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="overflow-x-auto rounded-xl border border-border/60 bg-gradient-to-b from-white to-primary-light/10 p-3 sm:p-4">
        <div style={{ width: chartW, minWidth: '100%' }}>
          <svg
            width={chartW}
            height={svgH}
            role="img"
            aria-label={xAxisCaption(period)}
          >
            <defs>
              <linearGradient id="audit-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ecdb8" />
                <stop offset="100%" stopColor="#1c756a" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const y = padTop + plotH * (1 - tick / max)
              return (
                <g key={tick}>
                  <text
                    x={padLeft - 10}
                    y={y + 5}
                    textAnchor="end"
                    fill="#5a7282"
                    fontSize="12"
                    fontFamily="inherit"
                  >
                    {tick}
                  </text>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={chartW - padRight}
                    y2={y}
                    stroke="#d4ebe6"
                    strokeWidth="1"
                  />
                </g>
              )
            })}

            {series.map((point, i) => {
              const slotW = barW + barGap
              const barH = max > 0 ? (plotH * point.count) / max : 0
              const x = padLeft + i * slotW
              const y = padTop + plotH - barH
              const isHovered = hovered === i
              const showLabel = shouldShowXLabel(i, n, labelStep, period)

              return (
                <g
                  key={point.date}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: 'default' }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(barH, point.count > 0 ? 4 : 0)}
                    rx={6}
                    fill={isHovered ? '#155a52' : 'url(#audit-bar-gradient)'}
                    opacity={isHovered ? 1 : point.count > 0 ? 0.95 : 0.25}
                    className="transition-all duration-150"
                  />
                  {point.count > 0 && isHovered ? (
                    <text
                      x={x + barW / 2}
                      y={y - 6}
                      textAnchor="middle"
                      fill="#1c756a"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="inherit"
                    >
                      {point.count}
                    </text>
                  ) : null}
                  {showLabel ? (
                    <text
                      x={x + barW / 2}
                      y={padTop + plotH + 22}
                      textAnchor="middle"
                      fill="#5a7282"
                      fontSize="11"
                      fontFamily="inherit"
                    >
                      {point.label}
                    </text>
                  ) : null}
                </g>
              )
            })}

            <text
              x={padLeft + (chartW - padLeft - padRight) / 2}
              y={svgH - 6}
              textAnchor="middle"
              fill="#5a7282"
              fontSize="12"
              fontWeight="600"
              fontFamily="inherit"
            >
              {xAxisCaption(period)}
            </text>
          </svg>
        </div>
      </div>

      {hovered != null && series[hovered] ? (
        <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-border bg-white px-4 py-3 shadow-[var(--shadow-card)]">
          <p className="text-base font-semibold text-text">{series[hovered].tooltip}</p>
          <p className="mt-0.5 text-base tabular-nums text-primary">
            {series[hovered].count} evento{series[hovered].count !== 1 ? 's' : ''}
          </p>
        </div>
      ) : null}
    </div>
  )
}

export function AuditCharts({ logs, config, onConfigChange, isLoading }: AuditChartsProps) {
  const periodLogs = filterLogsByActivityConfig(logs, config)
  const porCategoria = computeCategoriaCounts(periodLogs)
  const series = computeActivitySeries(logs, config)
  const years = availableAuditYears(logs)
  const total = Object.values(porCategoria).reduce((a, b) => a + b, 0)

  const setPeriod = (period: AuditActivityPeriod) => {
    onConfigChange({ ...config, period })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-gradient-to-br from-white to-primary-light/20 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-semibold text-text">Período dos gráficos</p>
            <p className="mt-1 text-base text-text-muted">{periodDescription(config)}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-white/80 p-1 ring-1 ring-border/80">
            {PERIOD_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                size="sm"
                variant={config.period === opt.value ? 'primary' : 'ghost'}
                className={cn(
                  'rounded-lg px-3',
                  config.period !== opt.value && 'text-text-muted hover:bg-primary-light/50',
                )}
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {config.period === 'month' ? (
          <div className="mt-4 flex flex-wrap gap-4 border-t border-border/60 pt-4">
            <div className="min-w-[160px] flex-1 sm:max-w-[220px]">
              <label htmlFor="audit-chart-month" className="mb-1.5 block text-sm font-medium text-text-muted">
                Mês
              </label>
              <Select
                id="audit-chart-month"
                value={String(config.month)}
                onChange={(e) =>
                  onConfigChange({ ...config, month: Number(e.target.value) })
                }
              >
                {MESES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="min-w-[120px] sm:max-w-[160px]">
              <label htmlFor="audit-chart-year-month" className="mb-1.5 block text-sm font-medium text-text-muted">
                Ano
              </label>
              <Select
                id="audit-chart-year-month"
                value={String(config.year)}
                onChange={(e) =>
                  onConfigChange({ ...config, year: Number(e.target.value) })
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : null}

        {config.period === 'year' ? (
          <div className="mt-4 border-t border-border/60 pt-4">
            <div className="min-w-[120px] max-w-[160px]">
              <label htmlFor="audit-chart-year" className="mb-1.5 block text-sm font-medium text-text-muted">
                Ano
              </label>
              <Select
                id="audit-chart-year"
                value={String(config.year)}
                onChange={(e) => onConfigChange({ ...config, year: Number(e.target.value) })}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <h3 className="text-base font-semibold text-text">Distribuição por categoria</h3>
            <p className="mt-1 text-base text-text-muted">{periodDescription(config)}</p>
            {isLoading ? (
              <Skeleton className="mt-6 h-52" />
            ) : (
              <div className="mt-6">
                <CategoryDonutChart counts={porCategoria} total={total} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-text">
                  {config.period === 'year' ? 'Atividade mensal' : 'Atividade diária'}
                </h3>
                <p className="mt-1 text-base text-text-muted">
                  Passe o mouse sobre as barras para ver a data completa e o total de eventos
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-primary-light px-3 py-1.5 text-sm font-semibold tabular-nums text-primary">
                pico: {Math.max(...series.map((d) => d.count), 0)}
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="h-[280px]" />
            ) : (
              <ActivityBarChart series={series} period={config.period} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
