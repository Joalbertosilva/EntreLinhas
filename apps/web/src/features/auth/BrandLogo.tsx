import { cn } from '@/lib/utils'
import {
  BRAND_LOGO,
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
  BRAND_TAGLINE,
} from '@/features/auth/brand'

interface BrandLogoProps {
  className?: string
  /** full = horizontal | mark = recorte EL | icon = favicon quadrado (header app) */
  variant?: 'full' | 'mark' | 'icon'
}

export function BrandLogo({ className, variant = 'full' }: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          'bg-white p-2 shadow-[var(--shadow-soft)] ring-1 ring-primary/10',
          className,
        )}
        aria-hidden
      >
        <img
          src="/favicon.png"
          alt=""
          width={32}
          height={32}
          className="h-full w-full object-contain object-center"
          decoding="async"
        />
      </div>
    )
  }

  if (variant === 'mark') {
    return (
      <div
        className={cn('relative h-10 w-10 shrink-0 overflow-hidden rounded-xl', className)}
        aria-hidden
      >
        <img
          src={BRAND_LOGO}
          alt=""
          width={BRAND_LOGO_WIDTH}
          height={BRAND_LOGO_HEIGHT}
          className="absolute left-0 top-1/2 h-[118%] w-auto max-w-none -translate-y-1/2"
          decoding="async"
        />
      </div>
    )
  }

  return (
    <img
      src={BRAND_LOGO}
      alt={`${BRAND_NAME} — ${BRAND_TAGLINE}`}
      width={BRAND_LOGO_WIDTH}
      height={BRAND_LOGO_HEIGHT}
      className={cn('h-auto w-full max-w-[300px] object-contain sm:max-w-[320px]', className)}
      decoding="async"
      fetchPriority="high"
    />
  )
}
