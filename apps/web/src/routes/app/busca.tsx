import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ContentCard } from '@/features/app/ContentCard'
import { ScrollReveal } from '@/features/app/ScrollReveal'
import { useConteudoSearch } from '@/features/app/useConteudoSearch'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export const Route = createFileRoute('/app/busca')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  component: BuscaPage,
})

function BuscaPage() {
  const navigate = useNavigate()
  const { q: initialQ = '' } = Route.useSearch()
  const [query, setQuery] = useState(initialQ)
  const [debounced, setDebounced] = useState(initialQ.trim())

  useEffect(() => {
    setQuery(initialQ)
    setDebounced(initialQ.trim())
  }, [initialQ])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 280)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data: results = [], isLoading, isFetching } = useConteudoSearch(debounced, true)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const next = query.trim()
    void navigate({ to: '/app/busca', search: { q: next || undefined }, replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ScrollReveal>
        <header className="space-y-2">
          <Link
            to="/app"
            className="inline-flex text-sm font-medium text-text-muted transition-colors hover:text-primary"
          >
            ← Voltar para início
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-brand-navy">Buscar conteúdos</h1>
          <p className="text-sm text-text-muted">
            Pesquise por título ou autor nos materiais disponíveis para leitura.
          </p>
        </header>
      </ScrollReveal>

      <ScrollReveal delayMs={40}>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite título ou autor..."
              className="pl-10"
              aria-label="Termo de busca"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        {debounced.length < 2 ? (
          <p className="rounded-xl border border-dashed border-border bg-white/70 px-4 py-8 text-center text-sm text-text-muted">
            Digite pelo menos 2 caracteres para buscar.
          </p>
        ) : isLoading || isFetching ? (
          <p className="text-sm text-text-muted">Buscando conteúdos...</p>
        ) : results.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-white/70 px-4 py-8 text-center text-sm text-text-muted">
            Nenhum conteúdo encontrado para &quot;{debounced}&quot;.
          </p>
        ) : (
          <div>
            <p className="mb-4 text-sm text-text-muted">
              {results.length} resultado{results.length === 1 ? '' : 's'} para &quot;{debounced}&quot;
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((item) => (
                <ContentCard key={item.id} conteudo={item} showTipo />
              ))}
            </div>
          </div>
        )}
      </ScrollReveal>
    </div>
  )
}
