import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, Search, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ConteudoCardData } from '@/features/app/useConteudos'
import { useConteudoSearch } from '@/features/app/useConteudoSearch'
import { TIPO_CONTEUDO_LABEL } from '@/lib/labels'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AppSearchBarProps {
  className?: string
  inputClassName?: string
  onNavigate?: () => void
  /** Em telas pequenas, mostra ícone que abre /app/busca */
  mobileIcon?: boolean
}

export function AppSearchBar({
  className,
  inputClassName,
  onNavigate,
  mobileIcon = true,
}: AppSearchBarProps) {
  const navigate = useNavigate()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [debounced, setDebounced] = useState('')
  const [mobileExpanded, setMobileExpanded] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 280)
    return () => window.clearTimeout(timer)
  }, [query])

  const { data: results = [], isFetching } = useConteudoSearch(debounced, open || debounced.length >= 2)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const goToResult = (item: ConteudoCardData) => {
    setOpen(false)
    setQuery('')
    setMobileExpanded(false)
    onNavigate?.()
    void navigate({ to: '/app/conteudos/$conteudoId', params: { conteudoId: item.id } })
  }

  const goToSearchPage = () => {
    const q = query.trim()
    if (q.length < 2) {
      onNavigate?.()
      void navigate({ to: '/app/busca', search: { q: undefined } })
      return
    }
    setOpen(false)
    setMobileExpanded(false)
    onNavigate?.()
    void navigate({ to: '/app/busca', search: { q } })
  }

  const showDropdown = open && debounced.trim().length >= 2

  if (mobileIcon && !mobileExpanded) {
    return (
      <div className={cn('flex items-center', className)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl border-primary/15 sm:hidden"
          aria-label="Buscar conteúdos"
          onClick={() => setMobileExpanded(true)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <div ref={rootRef} className="relative hidden min-w-0 sm:block">
          <SearchInput
            listId={listId}
            query={query}
            setQuery={setQuery}
            setOpen={setOpen}
            goToSearchPage={goToSearchPage}
            inputClassName={inputClassName}
            showDropdown={showDropdown}
            results={results}
            isFetching={isFetching}
            debounced={debounced}
            goToResult={goToResult}
          />
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className={cn('relative min-w-0', mobileExpanded && 'flex-1 sm:flex-none', className)}>
      {mobileExpanded && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute -left-10 top-0 h-9 w-9 sm:hidden"
          aria-label="Fechar busca"
          onClick={() => {
            setMobileExpanded(false)
            setQuery('')
            setOpen(false)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <SearchInput
        listId={listId}
        query={query}
        setQuery={setQuery}
        setOpen={setOpen}
        goToSearchPage={goToSearchPage}
        inputClassName={cn(inputClassName, mobileExpanded && 'w-full min-w-[10rem]')}
        showDropdown={showDropdown}
        results={results}
        isFetching={isFetching}
        debounced={debounced}
        goToResult={goToResult}
        autoFocus={mobileExpanded}
      />
    </div>
  )
}

function SearchInput({
  listId,
  query,
  setQuery,
  setOpen,
  goToSearchPage,
  inputClassName,
  showDropdown,
  results,
  isFetching,
  debounced,
  goToResult,
  autoFocus,
}: {
  listId: string
  query: string
  setQuery: (v: string) => void
  setOpen: (v: boolean) => void
  goToSearchPage: () => void
  inputClassName?: string
  showDropdown: boolean
  results: ConteudoCardData[]
  isFetching: boolean
  debounced: string
  goToResult: (item: ConteudoCardData) => void
  autoFocus?: boolean
}) {
  return (
    <>
      <label className="relative block">
        <span className="sr-only">Pesquisar conteúdos por título ou autor</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              goToSearchPage()
            }
            if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder="Pesquisar..."
          className={cn(
            'input-auth h-9 w-full rounded-full pl-9 pr-4 text-sm',
            inputClassName,
          )}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
        />
      </label>

      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 overflow-hidden rounded-xl border border-border bg-elevated py-1 shadow-[var(--shadow-card)] animate-fade-in"
        >
          {isFetching ? (
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Buscando...
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-text-muted">Nenhum conteúdo encontrado.</p>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm hover:bg-primary-light/50"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToResult(item)}
              >
                <span className="font-medium text-text">{item.titulo}</span>
                <span className="text-xs text-text-muted">
                  {TIPO_CONTEUDO_LABEL[item.tipo]}
                  {item.autor ? ` · ${item.autor}` : ''}
                </span>
              </button>
            ))
          )}
          {debounced.trim().length >= 2 && (
            <button
              type="button"
              className="w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-primary hover:bg-primary-light/40"
              onMouseDown={(e) => e.preventDefault()}
              onClick={goToSearchPage}
            >
              Ver todos para &quot;{debounced.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </>
  )
}

/** Atalho para abrir busca — útil no gerenciador */
export function AppSearchLink({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <Link
      to="/app/busca"
      search={{ q: undefined }}
      onClick={onNavigate}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-elevated text-text-muted transition-colors hover:bg-primary-light/50 hover:text-primary',
        className,
      )}
      aria-label="Buscar conteúdos na plataforma"
      title="Buscar conteúdos"
    >
      <Search className="h-4 w-4" />
    </Link>
  )
}
