import { Link, Outlet, useRouter, useRouterState } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { resolveSectionId } from '@/features/app/appNavigation'
import { AppSearchBar } from '@/features/app/AppSearchBar'
import { AccessibilityTrigger } from '@/features/accessibility'
import { useAuth } from '@/features/auth/AuthProvider'
import { BRAND_NAME } from '@/features/auth/brand'
import { BrandLogo } from '@/features/auth/BrandLogo'
import { AppDrawer } from '@/components/layout/AppDrawer'
import { AppFooter } from '@/components/layout/AppFooter'
import { AppHeaderNav } from '@/components/layout/AppHeaderNav'
import { UserAccountMenu } from '@/components/layout/UserAccountMenu'
import { Button } from '@/components/ui/Button'
import { SkipLink } from '@/components/ui/SkipLink'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const { profile, signOut, isStaff } = useAuth()
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeSection = resolveSectionId(pathname)
  const isBookReading = pathname.startsWith('/app/conteudos/')
  const isHome = pathname === '/app' || pathname === '/app/'

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    router.navigate({ to: '/login' })
  }

  return (
    <div className="app-shell relative flex min-h-screen flex-col">
      <SkipLink />
      <header
        className={cn(
          'app-header-bar',
          isHome ? 'app-header-bar-home' : 'app-header-bar-sticky',
        )}
      >
        <div className="app-header-inner mx-auto flex max-w-[100rem] items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6 lg:items-end lg:gap-4 lg:px-10 lg:pb-1.5 lg:pt-2.5 xl:px-14">
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
              <span className="truncate text-sm font-semibold text-text sm:text-base">{BRAND_NAME}</span>
            </Link>
          </div>

          <AppHeaderNav activeSection={activeSection} isStaff={isStaff} className="hidden flex-1 lg:flex" />

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3 lg:pb-1.5">
            <AppSearchBar
              mobileIcon
              inputClassName="w-36 md:w-44 lg:w-52"
            />
            <AccessibilityTrigger />
            <UserAccountMenu
              profile={profile}
              onSignOut={handleSignOut}
              isStaff={isStaff}
              compact
              className="lg:[&_button]:gap-2"
            />
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
            !isHome && 'page-enter px-4 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-8 xl:px-14',
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
