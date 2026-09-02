import { Link } from '@tanstack/react-router'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Profile } from '@tcc-sistema/types'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface UserAccountMenuProps {
  profile: Profile | null
  onSignOut: () => void
  accountPath: string
  compact?: boolean
  className?: string
}

export function UserAccountMenu({
  profile,
  onSignOut,
  accountPath,
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

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        className={cn(
          'flex items-center gap-1.5 rounded-xl px-1.5 py-1 transition-colors',
          'hover:bg-primary-light/60',
          open && 'bg-primary-light/60',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu da conta"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar name={profile.nome} className="h-8 w-8 text-[10px]" />
        {!compact && (
          <>
            <span className="hidden max-w-[100px] truncate text-sm font-medium text-text sm:inline md:max-w-[120px]">
              {firstName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-elevated py-1 shadow-[var(--shadow-card)] animate-fade-in"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-text">{profile.nome}</p>
            <p className="truncate text-xs text-text-muted">@{profile.nome_usuario}</p>
          </div>
          <Link
            to={accountPath}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-text hover:bg-primary-light/50"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4 text-primary" aria-hidden />
            Minha conta
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-text-muted hover:bg-primary-light/50 hover:text-text"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
