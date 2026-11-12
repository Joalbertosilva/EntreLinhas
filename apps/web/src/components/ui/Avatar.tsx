import { initialsFromName } from '@/lib/profileInitials'
import { cn } from '@/lib/utils'

export function Avatar({
  name,
  imageUrl,
  className,
  imageClassName,
}: {
  name: string
  imageUrl?: string | null
  className?: string
  imageClassName?: string
}) {
  const initials = initialsFromName(name)

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn(
          'h-9 w-9 shrink-0 rounded-full object-cover object-center bg-primary-light/40',
          className,
          imageClassName,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white',
        'text-xs font-semibold leading-none tracking-tight whitespace-nowrap',
        className,
      )}
      aria-hidden
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  )
}
