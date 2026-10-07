import { HomeObraCard } from '@/features/app/HomeObraCard'
import type { MinhaObraResumo } from '@/features/app/useMinhaObra'

interface HomeObraStripProps {
  obra: MinhaObraResumo | null
  isLoading: boolean
  sectionLabel: string
}

/** Painel principal do hero — escrita à esquerda, ao lado da jornada. */
export function HomeObraStrip({ obra, isLoading, sectionLabel }: HomeObraStripProps) {
  return (
    <section className="home-hero-panel home-hero-panel--obra" aria-labelledby="home-hero-obra">
      <h2 id="home-hero-obra" className="home-hero-panel__title">
        {sectionLabel}
      </h2>
      <HomeObraCard obra={obra} isLoading={isLoading} variant="row" />
    </section>
  )
}
