import { cn } from '@/lib/utils'

export function Avatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white',
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  )
}
