import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { AccessibilityProvider, AccessibilityToolbar } from '@/features/accessibility'
import { AuthProvider } from '@/features/auth/AuthProvider'

export const Route = createRootRoute({
  component: () => (
    <AccessibilityProvider>
      <AuthProvider>
        <Outlet />
        <AccessibilityToolbar floating />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </AccessibilityProvider>
  ),
})
