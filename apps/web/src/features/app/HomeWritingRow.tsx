import { Link } from '@tanstack/react-router'
import { SectionSpeakHeader } from '@/features/accessibility/SectionSpeakHeader'
import { CommunityObraCard } from '@/features/app/CommunityObraCard'
import { ChevronRight } from 'lucide-react'
import { HomeLeiturasWidget } from '@/features/app/HomeLeiturasWidget'
import type { ObraPublicaCard } from '@/features/app/useMinhaObra'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'

interface HomeWritingRowProps {
  userId: string | undefined
  obrasComunidade: ObraPublicaCard[]
  loadingComunidade: boolean
}

/** Continue lendo + digest da comunidade — linha inferior da home editorial. */
export function HomeWritingRow({
  userId,
  obrasComunidade,
  loadingComunidade,
}: HomeWritingRowProps) {
  const digest = obrasComunidade.slice(0, 4)

  return (
    <div className="home-writing-row">
      <section
        className="home-writing-row__panel home-writing-row__panel--comunidade"
        aria-labelledby="home-comunidade"
      >
        <SectionSpeakHeader
          label="Obras da comunidade. Leituras publicadas por outros alunos."
          className="home-writing-row__head section-head-inline mb-0"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="home-comunidade" className="home-writing-row__title mb-0">
              Obras da comunidade
            </h2>
            <Link to="/app/livros" className="section-action-link section-action-link--panel">
              Ver tudo
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </SectionSpeakHeader>

        {loadingComunidade ? (
          <p className="text-sm text-text-muted">Carregando…</p>
        ) : digest.length === 0 ? (
          <p className="home-writing-row__empty">
            Nenhuma obra publicada ainda.{' '}
            <Link to="/app/minha-obra" className="font-semibold text-primary hover:underline">
              Publique a sua
            </Link>
            .
          </p>
        ) : (
          <ul className="home-writing-row__list">
            {digest.map((item) => {
              const itemLabel = [
                item.titulo,
                CATEGORIA_OBRA_LABEL[item.categoria] ?? item.categoria,
                item.autor?.nome ?? 'Autor da comunidade',
                TIPO_OBRA_LABEL[item.tipo],
              ]
                .filter(Boolean)
                .join('. ')

              return (
                <li key={item.id}>
                  <CommunityObraCard item={item} speakLabel={itemLabel} />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <HomeLeiturasWidget userId={userId} />
    </div>
  )
}
