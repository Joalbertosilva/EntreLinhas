import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
  /** default: modal compacto · wide: formulários grandes (ex.: cadastro de conteúdo) */
  size?: 'default' | 'wide'
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = 'default',
}: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[100] flex justify-center overflow-y-auto',
        size === 'wide' ? 'items-start p-2 sm:p-4' : 'items-start p-4 sm:p-6',
      )}
    >
      <div
        className="fixed inset-0 bg-primary-dark/40 backdrop-blur-[2px] animate-fade-in"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="dialog-title"
        className={cn(
          'relative z-[101] my-2 flex w-full flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[var(--shadow-card)]',
          'animate-dialog-enter sm:my-3',
          size === 'wide'
            ? 'max-h-[min(96vh,calc(100dvh-1rem))] min-h-[min(86vh,calc(100dvh-3rem))] max-w-[calc(100vw-1rem)] lg:max-w-[calc(100vw-15.5rem)]'
            : 'max-h-[min(92vh,calc(100dvh-2rem))] max-w-lg',
          className,
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-between gap-3 border-b border-border',
            size === 'wide' ? 'px-6 py-4 sm:px-8' : 'px-5 py-3',
          )}
        >
          <h2
            id="dialog-title"
            className={cn(
              'min-w-0 flex-1 font-semibold text-text',
              size === 'wide' ? 'text-lg' : 'text-base',
            )}
          >
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div
          className={cn(
            'min-h-0 flex-1 overflow-y-auto',
            size === 'wide' ? 'px-6 py-5 sm:px-8 sm:py-6' : 'px-5 py-4',
          )}
        >
          {description && (
            <p
              className={cn(
                'leading-relaxed text-text-muted',
                size === 'wide' ? 'mb-5 text-base' : 'mb-4 text-base',
              )}
            >
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
