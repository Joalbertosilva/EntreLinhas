import { Link } from '@tanstack/react-router'
import { ChevronRight, Info } from 'lucide-react'
import { PLATFORM_APP_VERSION, PLATFORM_SUPPORT_EMAIL } from '@/features/auth/platformCredits'

interface PlatformInfoStripProps {
  sobreTo?: string
  sobreLabel?: string
}

export function PlatformInfoStrip({
  sobreTo = '/app/sobre',
  sobreLabel = 'Sobre a plataforma',
}: PlatformInfoStripProps) {
  return (
    <section className="platform-info-strip" aria-labelledby="platform-info-title">
      <h2 id="platform-info-title" className="platform-info-strip__title">
        Informações
      </h2>
      <ul className="platform-info-strip__list">
        <li>
          <Link to={sobreTo} className="platform-info-strip__row platform-info-strip__row--link">
            <span className="platform-info-strip__row-main">
              <Info className="platform-info-strip__icon" strokeWidth={2} aria-hidden />
              <span>{sobreLabel}</span>
            </span>
            <ChevronRight className="platform-info-strip__chev" strokeWidth={2} aria-hidden />
          </Link>
        </li>
        <li className="platform-info-strip__row">
          <span className="text-text-muted">Versão</span>
          <span className="font-medium tabular-nums text-text">{PLATFORM_APP_VERSION}</span>
        </li>
        <li className="platform-info-strip__row">
          <span className="text-text-muted">Suporte</span>
          <a href={`mailto:${PLATFORM_SUPPORT_EMAIL}`} className="platform-info-strip__mailto">
            {PLATFORM_SUPPORT_EMAIL}
          </a>
        </li>
      </ul>
    </section>
  )
}
