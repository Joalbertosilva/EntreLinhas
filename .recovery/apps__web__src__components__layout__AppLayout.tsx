import { Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { ChevronDown, Menu, Search, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { resolveSectionId } from '@/features/app/appNavigation'
import { useAuth } from '@/features/auth/AuthProvider'
import { BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { AppDrawer } from '@/components/layout/AppDrawer'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeaderNav } from '@/components/layout/AppHeaderNav'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { SkipLink } from '@/components/ui/SkipLink'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { profile, signOut, isStaff } = useAuth()
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeSection = resolveSectionId(pathname)
  const isBookReading = pathname.startsWith('/app/conteudos/')
  const isHome = pathname === '/app' || pathname === '/app/'

  useEffect(() => {
    setDrawerOpen(false)
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  const handleSignOut = async () => {
    await signOut()
    router.navigate({ to: '/login' })
  }

  const firstName = profile?.nome.split(' ')[0] ?? 'Leitor'

  return (
    <div className="app-shell relative flex min-h-screen flex-col">
      <SkipLink />
      <header
        className={cn(
          'app-header-bar',
          isHome ? 'app-header-bar-home' : 'app-header-bar-sticky',
        )}
      >
        <div className="app-header-inner mx-auto flex max-w-[100rem] items-center gap-3 px-5 py-2 sm:px-8 lg:items-end lg:gap-4 lg:px-10 lg:pb-1.5 lg:pt-2.5 xl:px-14">
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none lg:pb-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl border-primary/15 bg-elevated shadow-[var(--shadow-soft)] lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu de navegação"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-4 w-4 text-text" />
            </Button>

            <Link
              to="/app"
              className="flex min-w-0 items-center gap-2 rounded-xl py-1 pr-1 transition-colors hover:bg-primary-light/40"
            >
              <BrandLogo variant="icon" className="h-8 w-8 sm:h-9 sm:w-9" />
              <span className="truncate text-sm font-semibold text-text">{BRAND_NAME}</span>
            </Link>
          </div>

          <AppHeaderNav activeSection={activeSection} isStaff={isStaff} className="hidden flex-1 lg:flex" />

          <div className="hidden shrink-0 items-center gap-2 pb-1 lg:flex lg:gap-3 lg:pb-1.5">
            <label className="relative hidden md:block">
              <span className="sr-only">Pesquisar conteúdos</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                aria-hidden
              />
              <input
                type="search"
                disabled
                placeholder="Pesquisar conteúdos..."
                className="input-auth h-9 w-44 rounded-full pl-9 pr-4 text-sm opacity-75 lg:w-52"
                aria-disabled
              />
            </label>

            <div className="relative flex shrink-0 items-center gap-2" ref={menuRef}>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors',
                  'hover:bg-primary-light/60',
                  menuOpen && 'bg-primary-light/60',
                )}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                {profile && <Avatar name={profile.nome} className="h-8 w-8 text-[10px]" />}
                <span className="hidden max-w-[100px] truncate text-sm font-medium text-text md:inline lg:max-w-[140px]">
                  {firstName}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-text-muted sm:block" aria-hidden />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-elevated py-1 shadow-[var(--shadow-card)] animate-fade-in"
                >
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="truncate text-sm font-medium text-text">{profile?.nome}</p>
                    <p className="truncate text-xs text-text-muted">@{profile?.nome_usuario}</p>
                  </div>
                  <Link
                    to="/app/perfil"
                    role="menuitem"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-text hover:bg-primary-light/50"
                    onClick={() => setMenuOpen(false)}
                  >
                    <User className="h-4 w-4 text-primary" aria-hidden />
                    Minha conta
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-text-muted hover:bg-primary-light/50 hover:text-text"
                    onClick={handleSignOut}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AppDrawer
        open={drawerOpen}
        pathname={pathname}
        isStaff={isStaff}
        profile={profile}
        onClose={() => setDrawerOpen(false)}
        onSignOut={handleSignOut}
      />

      <main id="conteudo-principal" className="relative flex-1" tabIndex={-1}>
        <div
          key={pathname}
          className={cn(
            'w-full',
            !isHome && 'page-enter px-5 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8 xl:px-14',
            isHome && 'px-0 pb-0 pt-0',
            isBookReading && 'mx-auto max-w-[90rem]',
          )}
        >
          <Outlet />
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
