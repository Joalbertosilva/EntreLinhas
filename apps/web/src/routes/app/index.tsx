import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  ContentCarousel,
  getTimeGreeting,
  HOME_SECTIONS,
  ScrollReveal,
  SectionIcon,
} from '@/features/app'

export const Route = createFileRoute('/app/')({
  component: AppHomePage,
})

function AppHomePage() {
  const { profile } = useAuth()
  const firstName = profile?.nome.split(' ')[0] ?? 'Leitor'

  return (
    <div className="space-y-8 lg:space-y-10">
      <ScrollReveal>
        <section className="overflow-hidden rounded-2xl border border-primary/10 bg-white/82 shadow-[var(--shadow-soft)] backdrop-blur-sm">
          <div className="relative p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <SectionIcon section="home" size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary">{getTimeGreeting()},</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
                  {firstName}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted sm:text-[15px]">
                  Explore livros, crônicas, músicas e poemas organizados para continuar sua leitura.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="space-y-10 lg:space-y-12">
        {HOME_SECTIONS.map((section, index) => (
          <ScrollReveal key={section.id} delayMs={Math.min(index * 70, 280)}>
            <ContentCarousel section={section} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
