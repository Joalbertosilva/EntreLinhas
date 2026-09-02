import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { AccessibilityProvider, AccessibilityToolbar } from '@/features/accessibility'
import { ThemeProvider } from '@/features/app/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <Outlet />
          <AccessibilityToolbar floating />
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  ),
})
