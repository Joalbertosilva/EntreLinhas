import { cn } from '@/lib/utils'
import {
  CESMAC_CENTRO_LOGO,
  CESMAC_CITEC_LOGO,
  PLATFORM_APP_VERSION,
  PLATFORM_CREDITS,
  PLATFORM_SUPPORT_EMAIL,
} from '@/features/auth/platformCredits'

function formatNames(items: readonly string[]) {
  return items.length > 0 ? items.join(', ') : null
}

interface PlatformCreditsBlockProps {
  showMeta?: boolean
  className?: string
}

export function PlatformCreditsBlock({ showMeta = true, className }: PlatformCreditsBlockProps) {
  const sections = [
    {
      id: 'professores',
      label: 'Professores e pesquisadores envolvidos',
      names: formatNames(PLATFORM_CREDITS.professorsResearchers),
    },
    {
      id: 'devs',
      label: 'Desenvolvedores responsáveis',
      names: formatNames(PLATFORM_CREDITS.developers),
    },
    {
      id: 'design',
      label: 'Designers',
      names: formatNames(PLATFORM_CREDITS.designers),
    },
    {
      id: 'colab',
      label: 'Colaboração',
      names: formatNames(PLATFORM_CREDITS.collaboration),
    },
  ] as const

  return (
    <section
      className={cn('platform-credits', className)}
      aria-labelledby="platform-credits-title"
    >
      <h2 id="platform-credits-title" className="sr-only">
        Créditos e equipe
      </h2>

      <div className="platform-credits__developed">
        <p className="platform-credits__section-label">Desenvolvido por</p>
        <div className="platform-credits__logos">
          <img
            src={CESMAC_CITEC_LOGO}
            alt="CESMAC CITEC"
            className="platform-credits__logo platform-credits__logo--citec"
            width={184}
            height={96}
            loading="lazy"
            decoding="async"
          />
          <img
            src={CESMAC_CENTRO_LOGO}
            alt="CESMAC Centro Universitário"
            className="platform-credits__logo platform-credits__logo--centro"
            width={216}
            height={56}
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>

      <div className="platform-credits__sections">
        {sections.map((section) => (
          <div key={section.id}>
            <p className="platform-credits__section-label">{section.label}</p>
            {section.names ? (
              <p className="platform-credits__names">{section.names}</p>
            ) : (
              <p className="platform-credits__names platform-credits__names--empty" aria-hidden>
                &nbsp;
              </p>
            )}
          </div>
        ))}
      </div>

      {showMeta ? (
        <dl className="platform-credits__meta">
          <div className="platform-credits__meta-row">
            <dt>Versão</dt>
            <dd className="tabular-nums">{PLATFORM_APP_VERSION}</dd>
          </div>
          <div className="platform-credits__meta-row">
            <dt>Suporte</dt>
            <dd>
              <a href={`mailto:${PLATFORM_SUPPORT_EMAIL}`} className="platform-credits__mailto">
                {PLATFORM_SUPPORT_EMAIL}
              </a>
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}
