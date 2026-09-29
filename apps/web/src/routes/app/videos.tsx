import { createFileRoute } from '@tanstack/react-router'
import { AppSectionPage, getNavItem } from '@/features/app'

export const Route = createFileRoute('/app/videos')({
  component: () => <AppSectionPage item={getNavItem('videos')!} />,
})
