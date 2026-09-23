import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

interface AppShellContextValue {
  drawerOpen: boolean
  accountOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  openAccount: () => void
  closeAccount: () => void
  closeAll: () => void
}

const AppShellContext = createContext<AppShellContextValue | null>(null)

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const closeAll = useCallback(() => {
    setDrawerOpen(false)
    setAccountOpen(false)
  }, [])

  const value = useMemo<AppShellContextValue>(
    () => ({
      drawerOpen,
      accountOpen,
      openDrawer: () => {
        setAccountOpen(false)
        setDrawerOpen(true)
      },
      closeDrawer: () => setDrawerOpen(false),
      openAccount: () => {
        setDrawerOpen(false)
        setAccountOpen(true)
      },
      closeAccount: () => setAccountOpen(false),
      closeAll,
    }),
    [drawerOpen, accountOpen, closeAll],
  )

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
}

export function useAppShell() {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('useAppShell must be used within AppShellProvider')
  return ctx
}
