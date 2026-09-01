import { BookMarked, BookOpen, Home, Music, User } from 'lucide-react'
import type { AppSectionId } from '@/features/app/appNavigation'
import { cn } from '@/lib/utils'

const SIZE = {
  sm: 'h-8 w-8 rounded-lg [&_svg]:h-4 [&_svg]:w-4 [&_img]:h-5 [&_img]:w-5',
  md: 'h-10 w-10 rounded-xl [&_svg]:h-5 [&_svg]:w-5 [&_img]:h-6 [&_img]:w-6',
  lg: 'h-14 w-14 rounded-2xl [&_svg]:h-7 [&_svg]:w-7 [&_img]:h-9 [&_img]:w-9',
} as const

interface SectionIconProps {
  section: AppSectionId
  size?: keyof typeof SIZE
  className?: string
}

export function SectionIcon({ section, size = 'md', className }: SectionIconProps) {
  const shell = cn(
    'flex shrink-0 items-center justify-center shadow-[var(--shadow-soft)] ring-1 ring-inset',
    SIZE[size],
    className,
  )

  switch (section) {
    case 'home':
      return (
        <div className={cn(shell, 'bg-white ring-brand-navy/15')} aria-hidden>
          <img src="/favicon.png" alt="" className="object-contain" decoding="async" />
        </div>
      )
    case 'minhas-leituras':
      return (
        <div className={cn(shell, 'bg-primary-light text-primary ring-primary/15')} aria-hidden>
          <BookOpen strokeWidth={1.75} />
        </div>
      )
    case 'livros':
      return (
        <div className={cn(shell, 'bg-primary-light text-primary ring-primary/15')} aria-hidden>
          <BookMarked strokeWidth={1.75} />
        </div>
      )
    case 'cronicas':
      return (
        <div className={cn(shell, 'bg-accent-light/80 text-brand-navy ring-accent/25')} aria-hidden>
          <CronicaMarks />
        </div>
      )
    case 'musicas':
      return (
        <div className={cn(shell, 'bg-primary-light/90 text-primary ring-primary/15')} aria-hidden>
          <Music strokeWidth={1.75} />
        </div>
      )
    case 'poemas':
      return (
        <div className={cn(shell, 'bg-accent-light/70 text-brand-navy ring-accent/20')} aria-hidden>
          <PoemaMarks />
        </div>
      )
    case 'perfil':
      return (
        <div className={cn(shell, 'bg-white text-primary ring-primary/15')} aria-hidden>
          <User strokeWidth={1.75} />
        </div>
      )
    default:
      return (
        <div className={cn(shell, 'bg-primary-light text-primary ring-primary/15')} aria-hidden>
          <Home strokeWidth={1.75} />
        </div>
      )
  }
}

/** Traços estilizados — identidade visual de crônicas */
function CronicaMarks() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full p-1.5" fill="none" aria-hidden>
      <path
        d="M4 7h14M4 12h11M4 17h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 7l2 1.5M15 12l4 2M17 17l3 1.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

/** Versos — linhas com ritmo visual */
function PoemaMarks() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full p-1.5" fill="none" aria-hidden>
      <path
        d="M6 6h8M6 10h12M6 14h6M6 18h10"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="19" cy="6" r="1.25" fill="currentColor" opacity="0.7" />
    </svg>
  )
}
