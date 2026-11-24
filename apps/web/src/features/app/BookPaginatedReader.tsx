import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useAccessibility } from '@/features/accessibility/AccessibilityProvider'
import { Speakable } from '@/features/accessibility/Speakable'
import { SpeakButton } from '@/features/accessibility/SpeakButton'
import { AmbientCanvasField } from '@/components/layout/LoginAmbientBackground'
import { Button } from '@/components/ui/Button'
import type { BookPage } from '@/features/app/bookPagination'
import { getBookPageStorageKey } from '@/features/app/bookPagination'
import { cn } from '@/lib/utils'

interface BookPaginatedReaderProps {
  pages: BookPage[]
  conteudoId: string
  titulo: string
  /** Chave de sessionStorage; padrão usa conteudoId */
  storageKey?: string
  /** Exibe botão de expandir (modo Kindle) */
  allowImmersive?: boolean
  /** Abre o modo imersivo ao montar */
  openImmersiveOnMount?: boolean
}

type TurnDirection = 'next' | 'prev' | null

export function BookPaginatedReader({
  pages,
  conteudoId,
  titulo,
  storageKey: storageKeyProp,
  allowImmersive = true,
  openImmersiveOnMount = false,
}: BookPaginatedReaderProps) {
  const storageKey = storageKeyProp ?? getBookPageStorageKey(conteudoId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { audioEnabled } = useAccessibility()

  const [pageIndex, setPageIndex] = useState(0)
  const [turn, setTurn] = useState<TurnDirection>(null)
  const [hydrated, setHydrated] = useState(false)
  const [immersive, setImmersive] = useState(openImmersiveOnMount)

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
      if (e.key === 'Escape' && immersive) {
        e.preventDefault()
        setImmersive(false)
        return
      }
      if (e.key === 'ArrowRight') goTo('next')
      if (e.key === 'ArrowLeft') goTo('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goTo, immersive])

  useEffect(() => {
    if (!immersive) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [immersive])

  if (pages.length === 0) return null

  const current = pages[pageIndex]!
  const atStart = pageIndex === 0
  const atEnd = pageIndex >= pages.length - 1
  const progress = ((pageIndex + 1) / pages.length) * 100
  const pageSpeakLabel = `${current.title}. ${current.body}`

  const pageViewport = (
    <div
      className={cn(
        'book-page-viewport',
        immersive && 'book-page-viewport--immersive',
        turn === 'next' && 'book-page-viewport--turn-next',
        turn === 'prev' && 'book-page-viewport--turn-prev',
      )}
    >
      <div key={pageIndex} className={cn('book-page-sheet', immersive && 'book-page-sheet--immersive')}>
        <div className="book-page-inner-shadow" aria-hidden />
        {immersive && (
          <>
            <button
              type="button"
              className="kindle-tap-zone kindle-tap-zone--prev"
              disabled={atStart || Boolean(turn)}
              aria-label="Página anterior"
              onClick={() => goTo('prev')}
            />
            <button
              type="button"
              className="kindle-tap-zone kindle-tap-zone--next"
              disabled={atEnd || Boolean(turn)}
              aria-label="Próxima página"
              onClick={() => goTo('next')}
            />
          </>
        )}
        <div className="book-page-title-row">
          <h3 className={cn('book-page-title', immersive && 'book-page-title--immersive')}>{current.title}</h3>
          {audioEnabled && <SpeakButton label={pageSpeakLabel} className="book-page-title-speak" />}
        </div>
        <Speakable hideButton label={pageSpeakLabel} className="book-page-text-region">
          <div
            ref={scrollRef}
            className={cn(
              'book-prose book-page-text scrollbar-thin whitespace-pre-wrap',
              immersive && 'book-page-text--immersive',
            )}
            tabIndex={0}
          >
            {current.body}
          </div>
        </Speakable>
        <p className="book-page-scroll-hint">
          {immersive ? 'Role o texto abaixo para continuar lendo' : 'Role dentro da página para ler tudo'}
        </p>
      </div>
    </div>
  )

  const footer = (
    <footer className={cn('book-page-footer', immersive && 'book-page-footer--immersive')}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="book-page-nav book-page-nav--prev rounded-full"
        disabled={atStart || Boolean(turn)}
        onClick={() => goTo('prev')}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="book-page-nav__label">Anterior</span>
      </Button>

      <div className="book-page-indicator text-center">
        <p className="text-sm font-semibold text-brand-navy">
          Página {pageIndex + 1} de {pages.length}
        </p>
        <p className="mt-0.5 hidden text-xs text-text-muted sm:block">{current.title}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="book-page-nav book-page-nav--next rounded-full"
        disabled={atEnd || Boolean(turn)}
        onClick={() => goTo('next')}
        aria-label="Próxima página"
      >
        <span className="book-page-nav__label">Próxima</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Button>

      {allowImmersive && !immersive && (
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="book-page-immersive-cta col-span-full w-full rounded-full sm:col-span-1 sm:ml-auto sm:w-auto"
          onClick={() => setImmersive(true)}
        >
          <Maximize2 className="h-4 w-4" aria-hidden />
          Modo leitura
        </Button>
      )}
    </footer>
  )

  const progressBar = (
    <div
      className={cn('book-page-progress', immersive && 'book-page-progress--immersive')}
      role="progressbar"
      aria-valuenow={pageIndex + 1}
      aria-valuemin={1}
      aria-valuemax={pages.length}
      aria-label="Progresso da leitura"
    >
      <div className="book-page-progress-fill" style={{ width: `${progress}%` }} />
    </div>
  )

  const readerCore = (inImmersivePaper: boolean) => (
    <div
      className={cn('book-reader', inImmersivePaper && 'book-reader--kindle-paper')}
      aria-label={`Leitura paginada: ${titulo}`}
    >
      <div className={cn('book-reader-spread', inImmersivePaper && 'book-reader-spread--immersive')}>
        {pageViewport}
      </div>
      {progressBar}
      {footer}
    </div>
  )

  const immersiveLayer =
    immersive &&
    typeof document !== 'undefined' &&
    createPortal(
      <div className="kindle-immersive" role="dialog" aria-modal aria-label={`Leitura imersiva: ${titulo}`}>
        <AmbientCanvasField className="kindle-immersive__ambient ambient-canvas-field" />
        <header className="kindle-immersive__header">
          <div className="kindle-immersive__heading min-w-0 flex-1">
            <p className="kindle-immersive__kicker">EntreLinhas · leitura</p>
            <h2 className="kindle-immersive__title">{titulo}</h2>
          </div>
          <div className="kindle-immersive__header-actions">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full bg-white/70"
              onClick={() => setImmersive(false)}
            >
              <Minimize2 className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Sair</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full bg-white/50 text-brand-navy hover:bg-white/80"
              onClick={() => setImmersive(false)}
              aria-label="Fechar leitura em tela cheia"
            >
              <X className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </header>

        <div className="kindle-immersive__stage">
          <div className="kindle-immersive__frame">
            <div className="kindle-immersive__frame-accent kindle-immersive__frame-accent--gold" aria-hidden />
            <div className="kindle-immersive__frame-accent kindle-immersive__frame-accent--navy" aria-hidden />
            <div className="kindle-immersive__paper">{readerCore(true)}</div>
          </div>
        </div>

        <p className="kindle-immersive__hint">
          Role o texto no centro · ← → mudam de página · Esc fecha
        </p>
      </div>,
      document.body,
    )

  return (
    <>
      {!immersive && readerCore(false)}
      {immersiveLayer}
    </>
  )
}