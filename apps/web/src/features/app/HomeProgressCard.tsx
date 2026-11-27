import { Link } from '@tanstack/react-router'
import { Speakable } from '@/features/accessibility/Speakable'
import { ReaderProfileAvatar } from '@/features/app/ReaderProfileAvatar'
import { useAuth } from '@/features/auth/AuthProvider'
import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { useHomeLevelUpNotice } from '@/features/app/useHomeLevelUpNotice'
import { BookOpen, LineChart } from 'lucide-react'
import { JornadaXpBar } from '@/features/app/JornadaXpBar'
import { cn } from '@/lib/utils'

interface HomeProgressCardProps {
  userId: string | undefined
  displayName: string
}

export function HomeProgressCard({ userId, displayName }: HomeProgressCardProps) {
  const { profile } = useAuth()
  const { data: progress, isLoading } = useAlunoProgress(userId)
  const levelUpBanner = useHomeLevelUpNotice(userId, progress?.nivel, progress?.nivelMaximo)
  const showLevelUp = levelUpBanner

  if (isLoading) {
    return (
      <div className="home-progress-wrap" aria-hidden>
        <div className="jornada-card jornada-card--gamified jornada-card--loading animate-pulse">
          <div className="jornada-card__head jornada-card__head--profile">
            <div className="jornada-card__photo-wrap">
              <div className="jornada-card__photo-skeleton" />
            </div>
            <div className="h-5 w-40 max-w-full rounded-lg bg-primary-light/35" />
          </div>
          <div className="jornada-card__xp-bar-row">
            <div className="jornada-card__xp-track bg-primary-light/30" />
            <div className="h-4 w-16 shrink-0 rounded bg-primary-light/35" />
          </div>
          <div className="mt-2 h-3 w-48 max-w-full rounded bg-primary-light/25" />
          <div className="jornada-card__actions">
            <div className="h-10 flex-1 rounded-full bg-primary-light/30" />
            <div className="h-10 flex-1 rounded-full bg-primary-light/30" />
          </div>
        </div>
      </div>
    )
  }

  if (!progress) return null

  const journeyLabel = [
    displayName,
    `Nível ${progress.nivel}`,
    `${progress.xpNoNivel} de ${progress.xpNecessarioNivel} XP neste nível`,
    progress.nivelMaximo
      ? 'Nível máximo alcançado'
      : progress.xpParaProximoNivel > 0
        ? `Faltam ${progress.xpParaProximoNivel} XP para o nível ${progress.nivel + 1}`
        : null,
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <div className="home-progress-wrap">
      {showLevelUp && (
        <p className="home-level-up-banner" role="status">
          Você subiu de nível!
        </p>
      )}
      <Speakable label={journeyLabel} className="home-jornada-speakable">
        <article
          className={cn('jornada-card jornada-card--gamified', showLevelUp && 'jornada-card--celebrate')}
          aria-label={journeyLabel}
        >
          <div className="jornada-card__head jornada-card__head--profile">
            <ReaderProfileAvatar
              name={displayName}
              imageUrl={profile?.avatar_url}
              nivel={progress.nivel}
              editable
            />
            <p className="jornada-card__name">{displayName}</p>
          </div>

          <JornadaXpBar
            barPct={progress.progressoNivelPct}
            xpNoNivel={progress.xpNoNivel}
            xpNecessarioNivel={progress.xpNecessarioNivel}
            xpParaProximoNivel={progress.xpParaProximoNivel}
            nivel={progress.nivel}
            nivelMaximo={progress.nivelMaximo}
          />

          <div className="jornada-card__actions">
            <Link to="/app/progresso" className="jornada-card__action jornada-card__action--jornada">
              <LineChart className="jornada-card__action-icon" strokeWidth={2} aria-hidden />
              Minha Jornada
            </Link>
            <Link to="/app/minha-obra" className="jornada-card__action jornada-card__action--obras">
              <BookOpen className="jornada-card__action-icon" strokeWidth={2} aria-hidden />
              Minhas Obras
            </Link>
          </div>
        </article>
      </Speakable>
    </div>
  )
}
