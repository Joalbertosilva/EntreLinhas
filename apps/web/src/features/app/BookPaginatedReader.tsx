import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { BookPage } from '@/features/app/bookPagination'
import { getBookPageStorageKey } from '@/features/app/bookPagination'
import { cn } from '@/lib/utils'

interface BookPaginatedReaderProps {
  pages: BookPage[]
  conteudoId: string
  titulo: string
}

type TurnDirection = 'next' | 'prev' | null

export function BookPaginatedReader({ pages, conteudoId, titulo }: BookPaginatedReaderProps) {
  const storageKey = getBookPageStorageKey(conteudoId)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [pageIndex, setPageIndex] = useState(0)
  const [turn, setTurn] = useState<TurnDirection>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey)
    if (saved) {
      const n = Number.parseInt(saved, 10)
      if (!Number.isNaN(n) && n >= 0 && n < pages.length) {
        setPageIndex(n)
      }
    }
    setHydrated(true)
  }, [storageKey, pages.length])

  useEffect(() => {
    if (!hydrated) return
    sessionStorage.setItem(storageKey, String(pageIndex))
  }, [pageIndex, storageKey, hydrated])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [pageIndex])

  const goTo = useCallback(
    (direction: TurnDirection) => {
      if (!direction || turn) return
      const next = direction === 'next' ? pageIndex + 1 : pageIndex - 1
      if (next < 0 || next >= pages.length) return

      setTurn(direction)
      window.setTimeout(() => {
        setPageIndex(next)
        setTurn(null)
      }, 460)
    },
    [pageIndex, pages.length, turn],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') goTo('next')
      if (e.key === 'ArrowLeft') goTo('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo])

  if (pages.length === 0) return null

  const current = pages[pageIndex]
  const atStart = pageIndex === 0
  const atEnd = pageIndex >= pages.length - 1
  const progress = ((pageIndex + 1) / pages.length) * 100

  return (
    <div className="book-reader" aria-label={`Leitura paginada: ${titulo}`}>
      <div className="book-reader-spread">
        <div
          className={cn(
            'book-page-viewport',
            turn === 'next' && 'book-page-viewport--turn-next',
            turn === 'prev' && 'book-page-viewport--turn-prev',
          )}
        >
          <div key={pageIndex} className="book-page-sheet">
            <div className="book-page-inner-shadow" aria-hidden />
            <h3 className="book-page-title">{current.title}</h3>
            <div ref={scrollRef} className="book-prose book-page-text scrollbar-thin whitespace-pre-wrap">
              {current.body}
            </div>
            <p className="book-page-scroll-hint">Role dentro da página para ler tudo</p>
          </div>
        </div>
      </div>

      <div
        className="book-page-progress"
        role="progressbar"
        aria-valuenow={pageIndex + 1}
        aria-valuemin={1}
        aria-valuemax={pages.length}
        aria-label="Progresso da leitura"
      >
        <div className="book-page-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <footer className="book-page-footer">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="book-page-nav rounded-full"
          disabled={atStart || Boolean(turn)}
          onClick={() => goTo('prev')}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Anterior
        </Button>

        <div className="book-page-indicator text-center">
          <p className="text-sm font-semibold text-brand-navy">
            Página {pageIndex + 1} de {pages.length}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">{current.title}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="book-page-nav rounded-full"
          disabled={atEnd || Boolean(turn)}
          onClick={() => goTo('next')}
          aria-label="Próxima página"
        >
          Próxima
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </footer>
    </div>
  )
}
