import { ContentCarousel } from '@/features/app/ContentCarousel'
import { HomeCompactStats } from '@/features/app/HomeCompactStats'
import { HomeContinueReading } from '@/features/app/HomeContinueReading'
import { HomeProgressCard } from '@/features/app/HomeProgressCard'
import { HomeWritingRow } from '@/features/app/HomeWritingRow'
import { HomeSpotlight } from '@/features/app/HomeSpotlight'
import { getTimeGreeting } from '@/features/app/greeting'
import { HOME_SECTIONS } from '@/features/app/homeSections'
import { mensagemAcolhedora } from '@/features/app/progressCopy'
import { useAlunoProgress } from '@/features/app/useAlunoProgress'
import { useMinhaObra, useObrasPublicas } from '@/features/app/useMinhaObra'

interface HomeHeroProps {
  userId: string | undefined
  firstName: string
}

export function HomeHero({ userId, firstName }: HomeHeroProps) {
  const destaques = HOME_SECTIONS[0]!
  const { data: obra, isLoading: loadingObra } = useMinhaObra(userId)
  const { data: obrasComunidade = [], isLoading: loadingComunidade } = useObrasPublicas(8)
  const { data: progress } = useAlunoProgress(userId)

  const hasProducao = Boolean(obra?.ultimaProducao)
  const obraSectionLabel = hasProducao ? 'Continue sua obra' : 'Comece sua obra'
  const subtitle = progress
    ? mensagemAcolhedora(progress)
    : hasProducao
      ? 'Continue sua jornada — explore e se divirta com nossa plataforma.'
      : 'Explore leituras, registre reflexões e publique sua própria obra na comunidade.'

  return (
    <>
      <section className="home-hero-band" aria-labelledby="home-greeting">
        <div className="home-hero-inner">
          <header className="home-hero-greeting">
            <h1 id="home-greeting" className="home-hero-title">
              {getTimeGreeting()}, {firstName}
            </h1>
            <p className="home-hero-subtitle">{subtitle}</p>
            <HomeCompactStats userId={userId} className="mt-3" />
            <HomeContinueReading userId={userId} />
          </header>
        </div>
      </section>

      <HomeSpotlight userId={userId} />

      <section className="home-editorial" aria-label="Destaques, nível e obras da comunidade">
        <div className="home-editorial__inner home-editorial__inner--highlights">
          <div className="home-editorial__main">
            <div className="home-editorial__section-head">
              <h2 className="home-editorial__section-title">Destaques do EntreLinhas</h2>
              <p className="home-editorial__section-deck">
                Livros, crônicas, poemas e músicas mais curtidos — até doze itens em filas de quatro.
              </p>
            </div>
            <ContentCarousel section={destaques} showViewAll variant="hero" fadeTone="catalog" />
          </div>

          <aside className="home-editorial__aside home-editorial__aside--jornada" aria-label="Sua jornada de leitura">
            <HomeProgressCard userId={userId} />
          </aside>
        </div>

        <div className="home-editorial__inner home-editorial__inner--writing">
          <HomeWritingRow
            obra={obra ?? null}
            loadingObra={loadingObra}
            obrasComunidade={obrasComunidade}
            loadingComunidade={loadingComunidade}
            obraSectionLabel={obraSectionLabel}
          />
        </div>
      </section>
    </>
  )
}
