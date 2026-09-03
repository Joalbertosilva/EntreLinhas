import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { ContentCarousel, HOME_SECTIONS, ScrollReveal } from '@/features/app'
import { HomeHero } from '@/features/app/HomeHero'
import { HomeSectionRailSticky } from '@/features/app/HomeSectionRailSticky'

export const Route = createFileRoute('/app/')({
  component: AppHomePage,
})

const CATALOG_SECTIONS = HOME_SECTIONS.filter((section) => section.id !== 'destaques')

function AppHomePage() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  const firstName = profile?.nome.split(' ')[0] ?? 'Leitor'
  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['app-conteudos'] })
  }, [queryClient])

  return (
    <div className="home-page">
      <HomeHero userId={profile?.id} firstName={firstName} />

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
