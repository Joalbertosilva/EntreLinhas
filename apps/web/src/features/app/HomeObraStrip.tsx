import { HomeObraCard } from '@/features/app/HomeObraCard'
import type { MinhaObraResumo } from '@/features/app/useMinhaObra'

interface HomeObraStripProps {
  obra: MinhaObraResumo | null
  isLoading: boolean
  sectionLabel: string
}

/** Painel principal do hero — escrita à esquerda, ao lado da jornada. */
export function HomeObraStrip({ obra, isLoading, sectionLabel }: HomeObraStripProps) {
  const obraLabel = obra
    ? [sectionLabel, obra.titulo, obra.descricao ?? obra.ultimaProducao?.titulo].filter(Boolean).join('. ')
    : `${sectionLabel}. Comece sua obra — livro, crônica ou poema.`

  return (
    <section className="home-hero-panel home-hero-panel--obra" aria-labelledby="home-hero-obra">
      <h2 id="home-hero-obra" className="home-hero-panel__title">
        {sectionLabel}
      </h2>
      <HomeObraCard obra={obra} isLoading={isLoading} speakLabel={obraLabel} variant="hero-row" />
    </section>
  )
}
