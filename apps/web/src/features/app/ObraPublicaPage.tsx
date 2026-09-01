import { Link } from '@tanstack/react-router'
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react'
import { ScrollReveal } from '@/features/app'
import { useObraPublica } from '@/features/app/useMinhaObra'
import { TIPO_OBRA_LABEL } from '@/lib/obraLabels'
import { Badge } from '@/components/ui/Badge'

interface ObraPublicaPageProps {
  obraId: string
}

export function ObraPublicaPage({ obraId }: ObraPublicaPageProps) {
  const { data: obra, isLoading, error } = useObraPublica(obraId)

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-sm text-text-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Carregando obra…
      </p>
    )
  }

  if (error || !obra) {
    return (
      <div className="rounded-2xl border border-border bg-elevated p-8 text-center">
        <p className="text-text-muted">Esta obra não está disponível ou foi despublicada.</p>
        <Link to="/app" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
          Voltar ao início
        </Link>
      </div>
    )
  }

  const isLivro = obra.tipo === 'livro'

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar
      </Link>

      <ScrollReveal>
        <article className="overflow-hidden rounded-2xl border border-primary/10 bg-elevated shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
            <div className="mx-auto h-52 w-36 shrink-0 overflow-hidden rounded-xl border border-primary/10 bg-primary-light shadow-sm sm:mx-0">
              {obra.capa_url ? (
                <img src={obra.capa_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-primary/40">
                  <BookOpen className="h-10 w-10" strokeWidth={1.5} aria-hidden />
                </div>
              )}
            </div>
            <header className="min-w-0 flex-1 text-center sm:text-left">
              <Badge variant="accent" className="mb-2">
                {TIPO_OBRA_LABEL[obra.tipo]}
              </Badge>
              <h1 className="font-display text-2xl font-semibold text-brand-navy sm:text-3xl">
                {obra.titulo}
              </h1>
              {obra.autor && (
                <p className="mt-1 text-sm text-text-muted">
                  por {obra.autor.nome}
                </p>
              )}
              {obra.descricao && (
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{obra.descricao}</p>
              )}
            </header>
          </div>

          <div className="border-t border-border/80 px-6 py-8 sm:px-8">
            {isLivro ? (
              <div className="space-y-8">
                {obra.capitulos.map((cap) => (
                  <section key={cap.id}>
                    <h2 className="mb-3 text-lg font-semibold text-brand-navy">{cap.titulo}</h2>
                    <div className="whitespace-pre-wrap text-[15px] leading-7 text-text">{cap.texto}</div>
                  </section>
                ))}
              </div>
            ) : (
              <div
                className={
                  obra.tipo === 'poema'
                    ? 'whitespace-pre-wrap font-display text-[15px] leading-8 text-text'
                    : 'whitespace-pre-wrap text-[15px] leading-7 text-text'
                }
              >
                {obra.capitulos[0]?.texto ?? ''}
              </div>
            )}
          </div>
        </article>
      </ScrollReveal>
    </div>
  )
}
