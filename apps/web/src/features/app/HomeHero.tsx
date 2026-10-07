import { ContentCarousel } from '@/features/app/ContentCarousel'
import { HomeObraStrip } from '@/features/app/HomeObraStrip'
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
  const personalLine = progress ? mensagemAcolhedora(progress) : null

  return (
    <>
      <section className="home-hero-band" aria-labelledby="home-greeting">
        <div className="home-hero-inner">
          <header className="home-hero-greeting">
            <h1 id="home-greeting" className="home-hero-title">
              {getTimeGreeting()}, {firstName}
            </h1>
            <p className="home-hero-deck">
              Leia obras da comunidade, escreva a sua e acompanhe sua jornada — tudo num só lugar.
            </p>
            {personalLine && <p className="home-hero-subtitle">{personalLine}</p>}
          </header>

          <div className="home-hero-priority">
            <HomeObraStrip
              obra={obra ?? null}
              isLoading={loadingObra}
              sectionLabel={obraSectionLabel}
            />
            <HomeProgressCard userId={userId} />
          </div>
        </div>
      </section>

      <HomeSpotlight userId={userId} />

      <section className="home-editorial" aria-label="Destaques e obras da comunidade">
        <div className="home-editorial__inner home-editorial__inner--highlights">
          <div className="home-editorial__section-head">
            <h2 className="home-editorial__section-title">Destaques do EntreLinhas</h2>
            <p className="home-editorial__section-deck">
              Livros, crônicas, poemas e músicas mais curtidos — até doze itens em filas de quatro.
            </p>
          </div>
          <ContentCarousel section={destaques} showViewAll variant="hero" fadeTone="catalog" />
        </div>

        <div className="home-editorial__inner home-editorial__inner--writing">
          <HomeWritingRow
            userId={userId}
            obrasComunidade={obrasComunidade}
            loadingComunidade={loadingComunidade}
          />
        </div>
      </section>
    </>
  )
}
