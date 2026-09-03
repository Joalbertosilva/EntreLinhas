import { Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import {
  ClipboardList,
  GraduationCap,
  Home,
  KeyRound,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  PenLine,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { AccessibilityTrigger } from '@/features/accessibility'
import { AppSearchLink } from '@/features/app/AppSearchBar'
import { useAuth } from '@/features/auth/AuthProvider'
import { BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { SkipLink } from '@/components/ui/SkipLink'
import { cn } from '@/lib/utils'

const NAV: Array<{
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
  adminOnly?: boolean
}> = [
  { to: '/admin', label: 'Início', icon: LayoutDashboard, end: true },
  { to: '/admin/conteudos', label: 'Conteúdos', icon: Library },
  { to: '/admin/alunos', label: 'Alunos', icon: GraduationCap },
  { to: '/admin/obras', label: 'Obras dos alunos', icon: PenLine },
  { to: '/admin/requerimentos-senha', label: 'Recuperação de senha', icon: KeyRound },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users, adminOnly: true },
  { to: '/admin/auditoria', label: 'Auditoria', icon: ClipboardList, adminOnly: true },
]

const PERFIL_LABEL: Record<string, string> = {
  administrador: 'Administrador',
  professor: 'Professor',
  aluno: 'Aluno',
}

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Início',
  '/admin/usuarios': 'Usuários',
  '/admin/conteudos': 'Conteúdos',
  '/admin/alunos': 'Alunos',
  '/admin/obras': 'Obras dos alunos',
  '/admin/requerimentos-senha': 'Recuperação de senha',
  '/admin/auditoria': 'Auditoria',
  '/admin/perfil': 'Minha conta',
}

function resolvePageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/conteudos/') && pathname !== '/admin/conteudos') {
    return 'Conteúdo'
  }
  return PAGE_TITLES[pathname] ?? 'Gerenciador'
}

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.navigate({ to: '/login' })
  }

  const pageTitle = resolvePageTitle(pathname)

  const sidebar = (
    <>
      <div className="border-b border-primary/10 bg-gradient-to-b from-primary-light/70 to-white px-4 py-5">
        <div className="flex items-center gap-3">
          <BrandLogo variant="mark" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{BRAND_NAME}</p>
            <p className="truncate text-xs text-text-muted">Gerenciador</p>
          </div>
        </div>
      </div>

      <div className="border-b border-primary/10 px-3 py-3">
        <Link
          to="/app"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 rounded-xl border border-primary/12 bg-primary-light/45 px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light/70"
        >
          <Home className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          Plataforma
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Navegação principal">
        {NAV.filter((item) => !item.adminOnly || profile?.perfil === 'administrador').map(
          (item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={<item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
              end={'end' in item ? item.end : false}
              onNavigate={() => setMobileOpen(false)}
            >
              {item.label}
            </SidebarLink>
          ),
        )}
      </nav>

      <div className="space-y-1 border-t border-border bg-surface/50 p-3">
        <Link
          to="/app/perfil"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 hover:bg-primary-light/60"
        >
          {profile && <Avatar name={profile.nome} className="h-8 w-8 text-[10px]" />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{profile?.nome}</p>
            <p className="truncate text-xs text-text-muted">
              {profile ? PERFIL_LABEL[profile.perfil] : ''}
            </p>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-xl text-text-muted hover:bg-primary-light/50 hover:text-primary"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  )

  return (
    <div className="platform-bg relative flex min-h-screen">
      <SkipLink />
      <aside className="hidden w-[232px] shrink-0 flex-col border-r border-border bg-white lg:flex" aria-label="Menu lateral">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-primary-dark/30 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[260px] flex-col border-r border-border bg-white shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-14 flex-wrap items-center gap-2 border-b border-primary/10 bg-white/90 px-3 py-2 backdrop-blur-sm sm:gap-3 sm:px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{pageTitle}</p>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <AppSearchLink />
            <AccessibilityTrigger />
            <UserAccountMenu
              profile={profile}
              onSignOut={handleSignOut}
              accountPath="/app/perfil"
              compact
            />
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/12 bg-primary-light/40 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-light/65 sm:gap-2 sm:px-3 sm:text-sm"
            >
              <Home className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              <span className="hidden sm:inline">Plataforma</span>
            </Link>
          </div>
        </header>

        <main id="conteudo-principal" className="flex-1 overflow-auto" tabIndex={-1}>
          <div key={pathname} className="page-enter mx-auto max-w-5xl px-4 py-7 lg:px-8 lg:py-9">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarLink({
  to,
  icon,
  children,
  end,
  onNavigate,
}: {
  to: string
  icon: React.ReactNode
  children: React.ReactNode
  end?: boolean
  onNavigate?: () => void
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={cn(
        'relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium',
        'text-text-muted transition-all duration-200',
        'hover:bg-primary-light/50 hover:text-primary',
        '[&.active]:bg-primary-light [&.active]:text-primary [&.active]:font-semibold',
        '[&.active]:before:absolute [&.active]:before:left-0 [&.active]:before:top-1/2',
        '[&.active]:before:h-5 [&.active]:before:w-1 [&.active]:before:-translate-y-1/2',
        '[&.active]:before:rounded-full [&.active]:before:bg-primary',
      )}
      activeOptions={{ exact: end }}
      activeProps={{ className: 'active' }}
    >
      {icon}
      {children}
    </Link>
  )
}
