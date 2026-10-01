import { Link } from '@tanstack/react-router'
import { BookOpen, ChevronRight, PenLine, Sparkles, TrendingUp } from 'lucide-react'
import { ScrollReveal } from '@/features/app/ScrollReveal'
import { BRAND_INSTITUTION, BRAND_NAME, BRAND_TAGLINE } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'

const SECTIONS = [
  {
    id: 'ler',
    kicker: 'Leitura',
    title: 'Descobrir textos',
    body: 'Livros, crônicas, poemas e músicas pensados para adolescentes. Você explora no seu ritmo, vai se interessando por histórias que fazem sentido e constrói o hábito de ler aos poucos.',
    icon: BookOpen,
  },
  {
    id: 'escrever',
    kicker: 'Minha obra',
    title: 'Escrever a sua história',
    body: 'O que você lê pode virar inspiração. Escreva do seu jeito, no seu tempo, e monte uma obra que seja sua. Quando quiser, mostre para a turma.',
    icon: PenLine,
  },
  {
    id: 'acompanhar',
    kicker: 'Sua jornada',
    title: 'Ver seu crescimento',
    body: 'Registre o que leu, anote o que pensou e acompanhe como você evolui. Cada leitura conta e ajuda no seu desenvolvimento como leitor.',
    icon: TrendingUp,
  },
  {
    id: 'comunidade',
    kicker: 'Comunidade',
    title: 'Ler e conversar juntos',
    body: 'Conheça o que colegas escreveram, comente e troque ideias. Ler junto também faz parte do caminho.',
    icon: Sparkles,
  },
] as const

export function SobrePage() {
  return (
    <div className="sobre-page sobre-page--marvel mx-auto max-w-5xl">
      <ScrollReveal>
        <header className="sobre-marvel-hero">
          <div className="sobre-marvel-hero__overlay" aria-hidden />
          <div className="sobre-marvel-hero__content">
            <BrandLogo variant="icon" className="h-12 w-12 opacity-90" />
            <p className="sobre-marvel-hero__eyebrow">Sobre a plataforma</p>
            <h1 className="sobre-marvel-hero__title">{BRAND_NAME.toUpperCase()}</h1>
            <p className="sobre-marvel-hero__tagline">{BRAND_TAGLINE}</p>
            <p className="sobre-marvel-hero__deck">
              O {BRAND_NAME} existe para aproximar adolescentes da leitura, despertar curiosidade por
              novos textos e apoiar quem quer crescer lendo e escrevendo. Projeto de TCC da{' '}
              {BRAND_INSTITUTION}.
            </p>
          </div>
        </header>
      </ScrollReveal>

      <ScrollReveal delayMs={60}>
        <div className="sobre-marvel-grid">
          {SECTIONS.map((section, index) => {
            const Icon = section.icon
            return (
              <article key={section.id} className="sobre-marvel-card">
                <p className="sobre-marvel-card__kicker">{section.kicker}</p>
                <div className="sobre-marvel-card__head">
                  <span className="sobre-marvel-card__icon" aria-hidden>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <h2 className="sobre-marvel-card__title">{section.title}</h2>
                </div>
                <p className="sobre-marvel-card__body">{section.body}</p>
                <span className="sobre-marvel-card__num" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </article>
            )
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={120}>
        <footer className="sobre-marvel-footer">
          <p className="sobre-marvel-footer__label">Comece agora</p>
          <div className="sobre-marvel-footer__actions">
            <Link to="/app/minha-obra" className="sobre-marvel-footer__btn sobre-marvel-footer__btn--primary">
              Iniciar minha obra
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/app" className="sobre-marvel-footer__btn sobre-marvel-footer__btn--ghost">
              Ir para o início
            </Link>
          </div>
        </footer>
      </ScrollReveal>
    </div>
  )
}
