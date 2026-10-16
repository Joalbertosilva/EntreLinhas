import { createFileRoute, Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { ChevronRight, LogOut, Shield, UserRound } from 'lucide-react'
import {
  ACCOUNT_MENU_ITEMS,
  ADMIN_ACCOUNT_ITEM,
  PERFIL_LABELS,
} from '@/features/app/accountMenu'
import { ScrollReveal } from '@/features/app'
import { useAuth } from '@/features/auth/AuthProvider'
import { Avatar } from '@/components/ui/Avatar'

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
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <ScrollReveal>
        <header className="border-b border-border/70 pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Conta</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand-navy sm:text-3xl">
            Minha conta
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            Gerencie seus dados, acesso e atalhos do EntreLinhas em um só lugar.
          </p>
        </header>
      </ScrollReveal>

      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        <ScrollReveal className="lg:col-span-4">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-white/90 shadow-[var(--shadow-soft)] backdrop-blur-sm">
              <div className="bg-gradient-to-br from-primary/12 via-primary-light/40 to-white px-5 py-6 sm:px-6">
                <div className="flex items-start gap-4">
                  <Avatar name={profile.nome} className="h-16 w-16 shrink-0 text-sm ring-2 ring-white/80" />
                  <div className="min-w-0 pt-0.5">
                    <p className="text-lg font-semibold leading-snug text-brand-navy">{profile.nome}</p>
                    <p className="mt-0.5 text-sm text-primary">@{profile.nome_usuario}</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Shield className="h-3 w-3" aria-hidden />
                      {perfilLabel}
                    </span>
                  </div>
                </div>
              </div>

              <dl className="divide-y divide-border/60 px-5 py-1 sm:px-6">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-3.5">
                  <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <UserRound className="h-3.5 w-3.5" aria-hidden />
                    Nome
                  </dt>
                  <dd className="text-sm font-medium text-text">{profile.nome}</dd>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">Usuário</dt>
                  <dd className="font-mono text-sm text-primary">@{profile.nome_usuario}</dd>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-3.5">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">Perfil</dt>
                  <dd className="text-sm font-medium text-text">{perfilLabel}</dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-white/90 py-3.5 text-sm font-semibold text-text-muted transition-colors hover:bg-primary-light/30 hover:text-text"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sair da conta
            </button>
          </aside>
        </ScrollReveal>

        <ScrollReveal delayMs={60} className="lg:col-span-8">
          <section aria-labelledby="perfil-atalhos-title">
            <h2 id="perfil-atalhos-title" className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Atalhos
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Leitura, jornada, obra e segurança da sua conta.
            </p>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {menuItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex h-full items-start gap-3 rounded-2xl border border-border/80 bg-white/90 p-4 transition-all hover:border-primary/20 hover:bg-primary-light/20 hover:shadow-[var(--shadow-soft)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light/80 text-primary">
                      <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-text group-hover:text-primary">
                          {item.label}
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-text-muted/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                          aria-hidden
                        />
                      </span>
                      {item.description ? (
                        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </ScrollReveal>
      </div>
    </div>
  )
}
