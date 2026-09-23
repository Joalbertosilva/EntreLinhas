import { Link } from '@tanstack/react-router'
import { ChevronRight, LogOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Profile } from '@tcc-sistema/types'
import {
  ACCOUNT_MENU_ITEMS,
  ADMIN_ACCOUNT_ITEM,
  PERFIL_LABELS,
} from '@/features/app/accountMenu'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface UserAccountMenuProps {
  profile: Profile | null
  onSignOut: () => void
  isStaff?: boolean
  compact?: boolean
  className?: string
}

export function UserAccountMenu({
  profile,
  onSignOut,
  isStaff = false,
  compact = false,
  className,
}: UserAccountMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const firstName = profile?.nome.split(' ')[0] ?? 'Conta'

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  if (!profile) return null

  const perfilLabel = PERFIL_LABELS[profile.perfil]
  const menuItems = [
    ...ACCOUNT_MENU_ITEMS,
    ...(isStaff ? [ADMIN_ACCOUNT_ITEM] : []),
  ]

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        className={cn(
          'flex items-center gap-1.5 rounded-full p-0.5 transition-colors',
          'ring-1 ring-transparent hover:ring-primary/15 hover:bg-primary-light/50',
          open && 'bg-primary-light/60 ring-primary/20',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu da conta"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar name={profile.nome} className="h-8 w-8 text-[10px]" />
        {!compact && (
          <span className="hidden max-w-[100px] truncate pr-1 text-sm font-medium text-text sm:inline md:max-w-[120px]">
            {firstName}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-primary/10 bg-elevated shadow-[var(--shadow-card)] animate-fade-in"
        >
          <div className="bg-gradient-to-br from-primary via-primary to-[#155a52] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar name={profile.nome} className="h-11 w-11 border-2 border-white/25 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{profile.nome}</p>
                <p className="truncate text-xs text-white/80">@{profile.nome_usuario}</p>
                <span className="mt-1.5 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {perfilLabel}
                </span>
              </div>
            </div>
          </div>

          <ul className="py-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  role="menuitem"
                  className="group flex items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-primary-light/45"
                  onClick={() => setOpen(false)}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light/70 text-primary">
                    <item.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text group-hover:text-primary">
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="block truncate text-[11px] text-text-muted">{item.description}</span>
                    ) : null}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-text-muted/70 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-border">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-primary-light/40"
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-text-muted">
                <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="text-sm font-medium text-text-muted hover:text-text">Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
