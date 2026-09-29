import type { CatalogAnchor } from '@tcc-sistema/types'
import { ContentCarousel } from '@/features/app/ContentCarousel'
import { CatalogVideoStrip } from '@/features/app/CatalogVideoStrip'
import { ScrollReveal } from '@/features/app/ScrollReveal'
import type { HomeSectionConfig } from '@/features/app/homeSections'
import { useVideosByCatalogAnchor } from '@/features/app/useConteudos'

const ANCHOR_BY_SECTION: Partial<Record<string, CatalogAnchor>> = {
  livros: 'livros',
  cronicas: 'cronicas',
  musicas: 'musicas',
  poemas: 'poemas',
}

interface HomeCatalogSectionsProps {
  sections: HomeSectionConfig[]
}

export function HomeCatalogSections({ sections }: HomeCatalogSectionsProps) {
  return (
    <div className="space-y-10 lg:space-y-12">
      {sections.map((section, index) => {
        const anchor = ANCHOR_BY_SECTION[section.id]
        return (
          <div key={section.id}>
            <ScrollReveal delayMs={Math.min(index * 60, 240)}>
              <ContentCarousel section={section} fadeTone="catalog" />
            </ScrollReveal>

            {anchor && (
              <ScrollReveal delayMs={Math.min(index * 60 + 30, 270)}>
                <AnchorVideos anchor={anchor} />
              </ScrollReveal>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AnchorVideos({ anchor }: { anchor: CatalogAnchor }) {
  const { data: videos = [] } = useVideosByCatalogAnchor(anchor)
  return <CatalogVideoStrip anchor={anchor} videos={videos} />
}
