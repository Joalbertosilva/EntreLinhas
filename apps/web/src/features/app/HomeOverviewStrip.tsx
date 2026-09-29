import { Link } from '@tanstack/react-router'
import { BookMarked, BookOpen, PenLine, Search, Sparkles, Trophy } from 'lucide-react'
import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { useMinhasLeituras } from '@/features/app/useMinhasLeituras'
import { cn } from '@/lib/utils'

interface HomeOverviewStripProps {
  userId: string | undefined
  className?: string
}

const QUICK_LINKS = [
  { to: '/app/minhas-leituras', label: 'Minhas leituras', icon: BookOpen },
  { to: '/app/minha-obra', label: 'Minha obra', icon: PenLine },
  { to: '/app/busca', label: 'Buscar', icon: Search },
  { to: '/app/progresso', label: 'Minha jornada', icon: Trophy },
] as const

export function HomeOverviewStrip({ userId, className }: HomeOverviewStripProps) {
  const { data: progress } = useAlunoProgress(userId)
  const { data: leituras } = useMinhasLeituras(userId)

  const emAndamento = leituras?.em_andamento.length ?? 0
  const concluidas = leituras?.concluido.length ?? 0
  const naLista = leituras?.na_lista.length ?? 0
  const nivel = progress?.nivel ?? 1
  const xp = progress?.xp ?? 0

  return (
    <div className={cn('home-overview-strip', className)}>
      <div className="home-overview-stats" role="list" aria-label="Resumo da sua leitura">
        <StatChip
          icon={BookOpen}
          label="Em andamento"
          value={String(emAndamento)}
          hint={emAndamento === 1 ? 'leitura ativa' : 'leituras ativas'}
        />
        <StatChip
          icon={BookMarked}
          label="Concluídas"
          value={String(concluidas)}
          hint={concluidas === 1 ? 'obra finalizada' : 'obras finalizadas'}
        />
        <StatChip
          icon={Sparkles}
          label="Na lista"
          value={String(naLista)}
          hint="salvas para depois"
        />
        <StatChip
          icon={Trophy}
          label="Nível"
          value={String(nivel)}
          hint={`${xp} XP acumulados`}
          accent
        />
      </div>

      <nav className="home-overview-links" aria-label="Atalhos rápidos">
        {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="home-overview-link">
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

function StatChip({
  icon: Icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: typeof BookOpen
  label: string
  value: string
  hint: string
  accent?: boolean
}) {
  return (
    <div
      role="listitem"
      className={cn('home-stat-chip', accent && 'home-stat-chip--accent')}
    >
      <span className="home-stat-chip__icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="home-stat-chip__label">{label}</p>
        <p className="home-stat-chip__value">{value}</p>
        <p className="home-stat-chip__hint">{hint}</p>
      </div>
    </div>
  )
}
