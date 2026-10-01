import { Link } from '@tanstack/react-router'
import { HomeObraCard } from '@/features/app/HomeObraCard'
import type { MinhaObraResumo, ObraPublicaCard } from '@/features/app/useMinhaObra'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'

interface HomeWritingRowProps {
  obra: MinhaObraResumo | null
  loadingObra: boolean
  obrasComunidade: ObraPublicaCard[]
  loadingComunidade: boolean
  obraSectionLabel: string
}

/** Minha obra + digest da comunidade — linha inferior da home editorial. */
export function HomeWritingRow({
  obra,
  loadingObra,
  obrasComunidade,
  loadingComunidade,
  obraSectionLabel,
}: HomeWritingRowProps) {
  const digest = obrasComunidade.slice(0, 4)

  return (
    <div className="home-writing-row">
      <section
        className="home-writing-row__panel home-writing-row__panel--comunidade"
        aria-labelledby="home-comunidade"
      >
        <div className="home-writing-row__head">
          <h2 id="home-comunidade" className="home-writing-row__title mb-0">
            Obras da comunidade
          </h2>
          <Link to="/app/livros" className="home-writing-row__link">
            Ver tudo
          </Link>
        </div>

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
            {digest.map((item) => (
              <li key={item.id}>
                <Link
                  to="/app/obras/$obraId"
                  params={{ obraId: item.id }}
                  className="home-writing-row__item"
                >
                  <div className="home-writing-row__thumb">
                    {item.capa_url ? (
                      <img src={item.capa_url} alt="" loading="lazy" />
                    ) : (
                      <span aria-hidden>{item.titulo.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="home-writing-row__cat">
                      {CATEGORIA_OBRA_LABEL[item.categoria] ?? item.categoria}
                    </p>
                    <p className="home-writing-row__titulo">{item.titulo}</p>
                    <p className="home-writing-row__meta">
                      {item.autor?.nome ?? 'Autor da comunidade'} · {TIPO_OBRA_LABEL[item.tipo]}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="home-writing-row__panel home-writing-row__panel--obra" aria-labelledby="home-minha-obra">
        <h2 id="home-minha-obra" className="home-writing-row__title">
          {obraSectionLabel}
        </h2>
        <HomeObraCard obra={obra} isLoading={loadingObra} variant="row" />
      </section>
    </div>
  )
}
