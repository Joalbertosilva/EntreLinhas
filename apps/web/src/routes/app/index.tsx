import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { ContentCarousel, HOME_SECTIONS, ScrollReveal } from '@/features/app'
import { HomeHero } from '@/features/app/HomeHero'
import { HomeObrasPublicas } from '@/features/app/HomeObrasPublicas'
import { HomeSectionRailSticky } from '@/features/app/HomeSectionRailSticky'
import { useHomeViewportGlow } from '@/features/app/useHomeViewportGlow'

export const Route = createFileRoute('/app/')({
  component: AppHomePage,
})

const CATALOG_SECTIONS = HOME_SECTIONS.filter((section) => section.id !== 'destaques')

function AppHomePage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const firstName = profile?.nome.split(' ')[0] ?? 'Leitor'
  useHomeViewportGlow(true)

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['app-conteudos'] })
  }, [queryClient])

  return (
    <div className="home-page">
      <div className="home-viewport-glow pointer-events-none" aria-hidden />

      <HomeHero userId={profile?.id} firstName={firstName} />

      <div className="home-obras-publicas-wrap px-5 sm:px-8 lg:px-10 xl:px-14">
        <HomeObrasPublicas />
      </div>

      <HomeSectionRailSticky />

      <section className="home-catalog-band">
        <div className="home-catalog-inner space-y-10 lg:space-y-12">
          {CATALOG_SECTIONS.map((section, index) => (
            <ScrollReveal key={section.id} delayMs={Math.min(index * 60, 240)}>
              <ContentCarousel section={section} fadeTone="catalog" />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
