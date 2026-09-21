import { ContentCarousel } from '@/features/app/ContentCarousel'
import { getTimeGreeting } from '@/features/app/greeting'
import { HomeObraCard } from '@/features/app/HomeObraCard'
import { HomeProgressCard } from '@/features/app/HomeProgressCard'
import { HOME_SECTIONS } from '@/features/app/homeSections'
import { ObrasComunidadeSection } from '@/features/app/ObrasComunidadeSection'
import { useMinhaObra, useObrasPublicas } from '@/features/app/useMinhaObra'
import { cn } from '@/lib/utils'

interface HomeHeroProps {
  userId: string | undefined
  firstName: string
}

export function HomeHero({ userId, firstName }: HomeHeroProps) {
  const { data: obra, isLoading: loadingObra } = useMinhaObra(userId)
  const { data: obrasComunidade = [], isLoading: loadingComunidade } = useObrasPublicas(8)
  const destaques = HOME_SECTIONS[0]
  const showComunidade = loadingComunidade || obrasComunidade.length > 0

  const hasProducao = Boolean(obra?.ultimaProducao)
  const obraSectionLabel = hasProducao ? 'Continue sua obra' : 'Comece sua obra'
  const subtitle = hasProducao
    ? 'Continue sua jornada — explore e se divirta com nossa plataforma.'
    : 'Explore e se divirta com nossa plataforma.'

  return (
    <section className="home-hero-band" aria-labelledby="home-greeting">
      <div className="home-hero-inner">
        <header className="home-hero-greeting">
          <h1 id="home-greeting" className="home-hero-title">
            {getTimeGreeting()}, {firstName}
          </h1>
          <p className="home-hero-subtitle">{subtitle}</p>
        </header>

        <div
          className={cn(
            'home-hero-grid mt-8 sm:mt-10',
            !showComunidade && 'home-hero-grid--sem-comunidade',
          )}
        >
          <div className="home-hero-cell home-hero-cell--obra min-w-0">
            <h2 className="home-hero-section-label">{obraSectionLabel}</h2>
            <HomeObraCard obra={obra ?? null} isLoading={loadingObra} />
          </div>

          <div className="home-hero-cell home-hero-cell--read min-w-0">
            <h2 className="home-hero-section-label">Destaques para ler</h2>
            <ContentCarousel section={destaques} showViewAll={false} variant="hero" fadeTone="hero" />
          </div>

          <div className="home-hero-cell home-hero-cell--progress min-w-0">
            <HomeProgressCard userId={userId} />
          </div>

          {showComunidade && (
            <div className="home-hero-cell home-hero-cell--comunidade min-w-0">
              <ObrasComunidadeSection limit={8} hideWhenEmpty variant="inline" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
