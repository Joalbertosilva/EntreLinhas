import { createFileRoute, Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { ChevronRight, LogOut } from 'lucide-react'
import {
  ACCOUNT_MENU_ITEMS,
  ADMIN_ACCOUNT_ITEM,
  PERFIL_LABELS,
} from '@/features/app/accountMenu'
import { ScrollReveal } from '@/features/app'
import { useAuth } from '@/features/auth/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/app/perfil')({
  component: PerfilRoute,
})

function PerfilRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname.startsWith('/app/perfil/')) return <Outlet />
  return <AppPerfilPage />
}

function AppPerfilPage() {
  const { profile, signOut, isStaff } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.navigate({ to: '/login' })
  }

  if (!profile) return null

  const perfilLabel = PERFIL_LABELS[profile.perfil]
  const menuItems = [
    ...ACCOUNT_MENU_ITEMS.filter((item) => item.to !== '/app/perfil'),
    ...(isStaff ? [ADMIN_ACCOUNT_ITEM] : []),
  ]

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <ScrollReveal>
        <div className="flex items-center gap-4">
          <Avatar name={profile.nome} className="h-14 w-14 text-sm" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-brand-navy sm:text-2xl">
              {profile.nome}
            </h1>
            <p className="mt-0.5 text-sm text-primary">@{profile.nome_usuario}</p>
            <span className="mt-2 inline-block rounded-full bg-primary-light px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {perfilLabel}
            </span>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={40}>
        <dl className="grid grid-cols-2 gap-3 rounded-2xl border border-border/80 bg-white/90 p-4 text-sm backdrop-blur-sm">
          <div>
            <dt className="text-text-muted">Nome</dt>
            <dd className="mt-0.5 font-medium text-text">{profile.nome}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Usuário</dt>
            <dd className="mt-0.5 font-mono text-primary">{profile.nome_usuario}</dd>
          </div>
        </dl>
      </ScrollReveal>

      <ScrollReveal delayMs={80}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Configurações
        </p>
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-white/90 backdrop-blur-sm">
          <ul>
            {menuItems.map((item, index) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary-light/40',
                    index < menuItems.length - 1 && 'border-b border-border/70',
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light/80 text-primary">
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-text group-hover:text-primary">
                      {item.label}
                    </span>
                    {item.description ? (
                      <span className="block truncate text-xs text-text-muted">{item.description}</span>
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
        </div>
      </ScrollReveal>

      <ScrollReveal delayMs={120}>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-white/90 py-3.5 text-sm font-semibold text-text-muted transition-colors hover:bg-primary-light/30 hover:text-text"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Sair da conta
        </button>
      </ScrollReveal>
    </div>
  )
}
