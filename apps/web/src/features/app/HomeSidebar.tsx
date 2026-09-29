import { Link } from '@tanstack/react-router'
import { HomeObraCard } from '@/features/app/HomeObraCard'
import { HomeProgressCard } from '@/features/app/HomeProgressCard'
import type { MinhaObraResumo, ObraPublicaCard } from '@/features/app/useMinhaObra'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { CATEGORIA_OBRA_LABEL } from '@/lib/obraCategoriaLabels'
import { cn } from '@/lib/utils'

interface HomeSidebarProps {
  userId: string | undefined
  obra: MinhaObraResumo | null
  loadingObra: boolean
  obrasComunidade: ObraPublicaCard[]
  loadingComunidade: boolean
  obraSectionLabel: string
  className?: string
}

/** Coluna lateral estilo feed editorial — jornada, obra e digest da comunidade. */
export function HomeSidebar({
  userId,
  obra,
  loadingObra,
  obrasComunidade,
  loadingComunidade,
  obraSectionLabel,
  className,
}: HomeSidebarProps) {
  const digest = obrasComunidade.slice(0, 4)

  return (
    <aside className={cn('home-sidebar', className)} aria-label="Painel lateral">
      <HomeProgressCard userId={userId} />

      <div className="home-sidebar__panel">
        <h2 className="home-sidebar__title">{obraSectionLabel}</h2>
        <HomeObraCard obra={obra} isLoading={loadingObra} />
      </div>

      <div className="home-sidebar__panel home-sidebar__panel--digest">
        <div className="home-sidebar__digest-head">
          <h2 className="home-sidebar__title mb-0">Da comunidade</h2>
          <Link to="/app/livros" className="home-sidebar__link">
            Ver tudo
          </Link>
        </div>

        {loadingComunidade ? (
          <p className="text-sm text-text-muted">Carregando…</p>
        ) : digest.length === 0 ? (
          <p className="home-sidebar__empty">
            Nenhuma obra publicada ainda.{' '}
            <Link to="/app/minha-obra" className="font-semibold text-primary hover:underline">
              Publique a sua
            </Link>
            .
          </p>
        ) : (
          <ul className="home-sidebar__digest-list">
            {digest.map((item) => (
              <li key={item.id}>
                <Link to="/app/obras/$obraId" params={{ obraId: item.id }} className="home-sidebar__digest-item">
                  <div className="home-sidebar__digest-thumb">
                    {item.capa_url ? (
                      <img src={item.capa_url} alt="" loading="lazy" />
                    ) : (
                      <span aria-hidden>{item.titulo.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="home-sidebar__digest-cat">
                      {CATEGORIA_OBRA_LABEL[item.categoria] ?? item.categoria}
                    </p>
                    <p className="home-sidebar__digest-titulo">{item.titulo}</p>
                    <p className="home-sidebar__digest-meta">
                      {item.autor?.nome ?? 'Autor da comunidade'} · {TIPO_OBRA_LABEL[item.tipo]}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
