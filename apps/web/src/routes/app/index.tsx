import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import { HOME_SECTIONS } from '@/features/app'
import { HomeCatalogSections } from '@/features/app/HomeCatalogSections'
import { HomeHero } from '@/features/app/HomeHero'
import { HomeSectionRailSticky } from '@/features/app/HomeSectionRailSticky'
import { useHomeViewportGlow } from '@/features/app/useHomeViewportGlow'

export const Route = createFileRoute('/app/')({
  component: AppHomePage,
})

const CATALOG_SECTIONS = HOME_SECTIONS.filter(
  (section) => section.id !== 'destaques' && section.id !== 'videos',
)

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
      <HomeHero userId={profile?.id} firstName={firstName} />

      <div className="home-catalog-shell">
        <div className="home-catalog-header">
          <div className="home-catalog-intro">
            <div className="home-catalog-inner home-catalog-intro__row">
              <div>
                <h2 className="home-catalog-intro__title">Explore o catálogo</h2>
                <p className="home-catalog-intro__text">
                  Livros, crônicas, poemas e músicas — vídeos aparecem no carrossel e nos blocos abaixo de
                  cada seção, conforme definido no painel.
                </p>
              </div>
            </div>
          </div>
        </div>

        <HomeSectionRailSticky />

        <section className="home-catalog-band">
          <div className="home-catalog-inner">
            <HomeCatalogSections sections={CATALOG_SECTIONS} />
          </div>
        </section>
      </div>
    </div>
  )
}
