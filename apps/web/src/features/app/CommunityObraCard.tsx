import { Link } from '@tanstack/react-router'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { Speakable } from '@/features/accessibility/Speakable'
import { SpeakButton } from '@/features/accessibility/SpeakButton'
import type { ObraPublicaCard } from '@/features/app/useMinhaObra'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'

interface CommunityObraCardProps {
  item: ObraPublicaCard
  speakLabel: string
}

/** Obra da comunidade — capa à esquerda, áudio ao lado da capa, texto ao lado. */
export function CommunityObraCard({ item, speakLabel }: CommunityObraCardProps) {
  const { audioEnabled } = useAccessibility()

  return (
    <article className="home-community-card home-obra-card--hero-row group">
      <Link
        to="/app/obras/$obraId"
        params={{ obraId: item.id }}
        className="home-obra-card__cover-link home-community-card__cover block no-underline"
      >
        <div className="home-writing-row__thumb">
          {item.capa_url ? (
            <img src={item.capa_url} alt="" loading="lazy" />
          ) : (
            <span aria-hidden>{item.titulo.charAt(0)}</span>
          )}
        </div>
      </Link>
      {audioEnabled === true && (
        <div className="home-obra-card__speak-aside">
          <SpeakButton label={speakLabel} />
        </div>
      )}
      <Speakable hideButton label={speakLabel} className="home-obra-card__text-col min-w-0">
        <Link
          to="/app/obras/$obraId"
          params={{ obraId: item.id }}
          className="block min-w-0 no-underline"
        >
          <p className="home-writing-row__cat">{CATEGORIA_OBRA_LABEL[item.categoria] ?? item.categoria}</p>
          <p className="home-writing-row__titulo">{item.titulo}</p>
          <p className="home-writing-row__meta">
            {item.autor?.nome ?? 'Autor da comunidade'} · {TIPO_OBRA_LABEL[item.tipo]}
          </p>
        </Link>
      </Speakable>
    </article>
  )
}
