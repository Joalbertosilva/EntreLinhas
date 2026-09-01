import { ContentCarousel } from '@/features/app/ContentCarousel'
import { getTimeGreeting } from '@/features/app/greeting'
import { HomeObraCard } from '@/features/app/HomeObraCard'
import { HOME_SECTIONS } from '@/features/app/homeSections'
import { useMinhaObra } from '@/features/app/useMinhaObra'

interface HomeHeroProps {
  userId: string | undefined
  firstName: string
}

export function HomeHero({ userId, firstName }: HomeHeroProps) {
  const { data: obra, isLoading: loadingObra } = useMinhaObra(userId)
  const destaques = HOME_SECTIONS[0]

  const subtitle = obra
    ? 'Retome sua escrita — ou mergulhe nos livros em destaque.'
    : 'Comece sua obra — ou mergulhe nos livros em destaque.'

  return (
    <section className="home-hero-band" aria-labelledby="home-greeting">
      <div className="home-hero-inner">
        <header className="home-hero-greeting">
          <h1 id="home-greeting" className="home-hero-title">
            {getTimeGreeting()}, {firstName}
          </h1>
          <p className="home-hero-subtitle">{subtitle}</p>
        </header>

        <div className="home-hero-grid mt-8 sm:mt-10">
          <div className="home-hero-obra min-w-0">
            <h2 className="home-hero-section-label">Continue sua obra</h2>
            <HomeObraCard obra={obra ?? null} isLoading={loadingObra} />
          </div>

          <div className="home-hero-read min-w-0">
            <h2 className="home-hero-section-label">Destaques para ler</h2>
            <ContentCarousel section={destaques} showViewAll={false} variant="hero" fadeTone="hero" />
          </div>
        </div>
      </div>
    </section>
  )
}
