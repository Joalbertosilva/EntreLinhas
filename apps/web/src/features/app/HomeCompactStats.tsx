import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { useMinhasLeituras } from '@/features/app/useMinhasLeituras'
import { cn } from '@/lib/utils'

interface HomeCompactStatsProps {
  userId: string | undefined
  className?: string
}

/** Linha única de métricas — sem atalhos duplicando o menu. */
export function HomeCompactStats({ userId, className }: HomeCompactStatsProps) {
  const { data: progress } = useAlunoProgress(userId)
  const { data: leituras } = useMinhasLeituras(userId)

  const emAndamento = leituras?.em_andamento.length ?? 0
  const concluidas = leituras?.concluido.length ?? 0
  const naLista = leituras?.na_lista.length ?? 0
  const nivel = progress?.nivel ?? 1
  const xp = progress?.xp ?? 0

  const parts = [
    emAndamento === 1 ? '1 em andamento' : `${emAndamento} em andamento`,
    concluidas === 1 ? '1 concluída' : `${concluidas} concluídas`,
    naLista > 0 ? (naLista === 1 ? '1 na lista' : `${naLista} na lista`) : null,
    `Nível ${nivel} · ${xp} XP`,
  ].filter(Boolean)

  return (
    <p className={cn('home-compact-stats', className)} aria-label="Resumo da sua leitura">
      {parts.join(' · ')}
    </p>
  )
}
