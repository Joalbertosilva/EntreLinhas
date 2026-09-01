import type { StatusLeitura } from '@tcc-sistema/types'
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Loader2,
  MoreHorizontal,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { useAtualizarLeituraUsuario } from '@/features/app/useLeiturasMap'
import { useAuth } from '@/features/auth/AuthProvider'
import { cn } from '@/lib/utils'

interface ContentCardLeituraMenuProps {
  conteudoId: string
  status?: StatusLeitura | null
  className?: string
  variant?: 'cover' | 'list'
}

const ACTIONS: Array<{
  status: StatusLeitura
  label: string
  hint: string
  icon: typeof BookOpen
  tone: string
}> = [
  {
    status: 'em_andamento',
    label: 'Iniciar leitura',
    hint: 'Continuar de onde parar',
    icon: BookOpen,
    tone: 'text-primary',
  },
  {
    status: 'na_lista',
    label: 'Salvar para depois',
    hint: 'Adicionar à sua lista',
    icon: Bookmark,
    tone: 'text-text',
  },
  {
    status: 'concluido',
    label: 'Marcar como lido',
    hint: 'Registrar como concluída',
    icon: CheckCircle2,
    tone: 'text-success',
  },
]

function useFloatingPosition(open: boolean, triggerRef: React.RefObject<HTMLButtonElement | null>) {
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' })

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return

    const update = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const panelWidth = 236
      const panelHeight = 196
      const gap = 8
      const padding = 12

      let top = rect.bottom + gap
      let left = rect.right - panelWidth

      if (left < padding) left = padding
      if (left + panelWidth > window.innerWidth - padding) {
        left = window.innerWidth - panelWidth - padding
      }
      if (top + panelHeight > window.innerHeight - padding) {
        top = rect.top - panelHeight - gap
      }
      if (top < padding) top = padding

      setStyle({
        position: 'fixed',
        top,
        left,
        width: panelWidth,
        zIndex: 9999,
        visibility: 'visible',
      })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, triggerRef])

  return style
}

export function ContentCardLeituraMenu({
  conteudoId,
  status = null,
  className,
  variant = 'cover',
}: ContentCardLeituraMenuProps) {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelStyle = useFloatingPosition(open, triggerRef)
  const atualizar = useAtualizarLeituraUsuario(profile?.id)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!profile) return null

  const handleAction = async (next: StatusLeitura) => {
    setOpen(false)
    try {
      await atualizar.mutateAsync({ conteudoId, status_leitura: next })
      const messages: Record<StatusLeitura, string> = {
        em_andamento: 'Leitura iniciada',
        na_lista: 'Adicionado à sua lista',
        concluido: 'Marcado como lido',
      }
      toast.success(messages[next])
    } catch {
      toast.error('Não foi possível atualizar a leitura')
    }
  }

  const menu = open
    ? createPortal(
        <>
          <button
            type="button"
            className="leitura-menu-backdrop"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            style={panelStyle}
            className="leitura-menu-panel animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="leitura-menu-heading">Minha leitura</p>
            {ACTIONS.map((action) => {
              const Icon = action.icon
              const isCurrent = status === action.status
              return (
                <button
                  key={action.status}
                  type="button"
                  role="menuitem"
                  disabled={isCurrent || atualizar.isPending}
                  className={cn('leitura-menu-item', isCurrent && 'is-current')}
                  onClick={() => void handleAction(action.status)}
                >
                  <span
                    className={cn(
                      'leitura-menu-item-icon',
                      isCurrent ? 'bg-primary/12 text-primary' : 'bg-surface text-text-muted',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', !isCurrent && action.tone)} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="block text-sm font-medium text-text">{action.label}</span>
                    <span className="block text-[11px] text-text-muted">{action.hint}</span>
                  </span>
                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      Atual
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          variant === 'cover' ? 'leitura-menu-trigger-cover' : 'leitura-menu-trigger-list',
          open && 'is-open',
          className,
        )}
        aria-label="Opções de leitura"
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={atualizar.isPending}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
      >
        {atualizar.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <MoreHorizontal className="h-4 w-4" strokeWidth={2} aria-hidden />
        )}
      </button>
      {menu}
    </>
  )
}
