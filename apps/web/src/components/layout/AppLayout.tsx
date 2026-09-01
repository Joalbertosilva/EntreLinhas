import { Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { ChevronDown, Menu, Search, User } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { resolveSectionId } from '@/features/app/appNavigation'
import { SectionIcon } from '@/features/app/SectionIcon'
import { useScrollAtmosphere } from '@/features/app/useScrollAtmosphere'
import { useAuth } from '@/features/auth/AuthProvider'
import { BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { AppDrawer } from '@/components/layout/AppDrawer'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { SkipLink } from '@/components/ui/SkipLink'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { profile, signOut, isStaff } = useAuth()
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const scrollProgress = useScrollAtmosphere()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const activeSection = resolveSectionId(pathname)
  const isBookReading = pathname.startsWith('/app/conteudos/')

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

  const atmosphereStyle = {
    '--app-scroll': scrollProgress,
  } as CSSProperties

  const sectionLabel =
    pathname.startsWith('/app/perfil/senha')
      ? 'Alterar senha'
      : activeSection === 'home'
        ? 'Início'
        : activeSection === 'livros'
          ? 'Livros'
          : activeSection === 'cronicas'
            ? 'Crônicas'
            : activeSection === 'musicas'
              ? 'Músicas'
              : activeSection === 'poemas'
                ? 'Poemas'
                : activeSection === 'perfil'
                  ? 'Minha conta'
                  : null

  return (
    <div className="app-shell relative flex min-h-screen" style={atmosphereStyle}>
      <div className="app-atmosphere-gradient pointer-events-none fixed inset-0 -z-20" aria-hidden />
      <div className="app-atmosphere-dots pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <AppSidebar pathname={pathname} isStaff={isStaff} onSignOut={handleSignOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        <SkipLink />
        <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/85 backdrop-blur-md">
          <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 lg:px-6 xl:px-8">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-xl border-primary/15 bg-white shadow-[var(--shadow-soft)] lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu de navegação"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-5 w-5 text-brand-navy" />
            </Button>

            <Link
              to="/app"
              className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl py-1 pr-2 transition-colors hover:bg-primary-light/40 lg:hidden"
            >
              <BrandLogo variant="icon" className="h-9 w-9" />
              <span className="hidden truncate font-semibold text-brand-navy sm:inline">{BRAND_NAME}</span>
            </Link>

            <div className="mx-1 hidden min-w-0 items-center gap-2 rounded-full bg-primary-light/35 px-2 py-1 sm:flex lg:hidden">
              <SectionIcon section={activeSection} size="sm" className="shadow-none" />
              <span className="truncate text-xs font-semibold text-brand-navy">{sectionLabel}</span>
            </div>

            <div className="mx-auto hidden max-w-sm flex-1 px-1 md:block lg:max-w-lg xl:max-w-xl">
              <label className="relative block">
                <span className="sr-only">Pesquisar conteúdos</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                  aria-hidden
                />
                <input
                  type="search"
                  disabled
                  placeholder="Pesquisar conteúdos..."
                  className="input-auth h-10 w-full rounded-full pl-9 pr-4 text-sm opacity-75"
                  aria-disabled
                />
              </label>
            </div>

            <div className="relative ml-auto shrink-0" ref={menuRef}>
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
                  className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-[var(--shadow-card)] animate-fade-in"
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
        </header>

        <AppDrawer
          open={drawerOpen}
          pathname={pathname}
          isStaff={isStaff}
          onClose={() => setDrawerOpen(false)}
          onSignOut={handleSignOut}
        />

        <main id="conteudo-principal" className="relative flex-1" tabIndex={-1}>
          <div
            key={pathname}
            className={cn(
              'page-enter mx-auto w-full px-4 py-6 lg:px-6 lg:py-8 xl:px-8',
              isBookReading ? 'max-w-[90rem]' : 'max-w-7xl',
            )}
          >
            <Outlet />
          </div>
        </main>

        <AppFooter />
      </div>
    </div>
  )
}
