import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

interface AuthBackLinkProps {
  to: string
  label: string
  className?: string
}

export function AuthBackLink({ to, label, className }: AuthBackLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex text-sm font-medium text-brand-navy transition-colors hover:text-[#002855] hover:underline',
        className,
      )}
    >
      ← {label}
    </Link>
  )
}
