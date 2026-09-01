import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/features/auth/AuthProvider'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Outlet />
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  ),
})
