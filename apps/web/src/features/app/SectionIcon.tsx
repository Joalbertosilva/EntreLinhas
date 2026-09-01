import {
  BookMarked,
  CircleUser,
  Feather,
  Home,
  LayoutDashboard,
  Library,
  Music2,
  ScrollText,
} from 'lucide-react'
import type { AppSectionId } from '@/features/app/appNavigation'
import { cn } from '@/lib/utils'

const SIZE = {
  sm: 'h-8 w-8 rounded-lg [&_svg]:h-[17px] [&_svg]:w-[17px]',
  md: 'h-10 w-10 rounded-xl [&_svg]:h-5 [&_svg]:w-5',
  lg: 'h-14 w-14 rounded-2xl [&_svg]:h-7 [&_svg]:w-7',
} as const

const SECTION_SHELL: Record<AppSectionId | 'admin', string> = {
  home: 'bg-white/95 text-brand-navy ring-brand-navy/10',
  'minhas-leituras': 'bg-white/95 text-primary ring-primary/12',
  livros: 'bg-white/95 text-primary ring-primary/12',
  cronicas: 'bg-white/95 text-brand-navy ring-brand-navy/10',
  musicas: 'bg-white/95 text-primary ring-primary/12',
  poemas: 'bg-white/95 text-brand-navy ring-brand-navy/10',
  perfil: 'bg-white/95 text-primary ring-primary/12',
  admin: 'bg-white/95 text-primary ring-primary/12',
}

const SECTION_ACTIVE_SHELL: Record<AppSectionId | 'admin', string> = {
  home: 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
  'minhas-leituras': 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
  livros: 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
  cronicas: 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
  musicas: 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
  poemas: 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
  perfil: 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
  admin: 'bg-white text-primary ring-primary/28 shadow-[var(--shadow-soft)]',
}

interface SectionIconProps {
  section: AppSectionId | 'admin'
  size?: keyof typeof SIZE
  active?: boolean
  className?: string
}

const STROKE = 1.75

export function SectionIcon({ section, size = 'md', active = false, className }: SectionIconProps) {
  const shell = cn(
    'section-icon flex shrink-0 items-center justify-center ring-1 ring-inset transition-all duration-300 ease-[cubic-bezier(0.34,1.15,0.64,1)]',
    SIZE[size],
    active ? SECTION_ACTIVE_SHELL[section] : SECTION_SHELL[section],
    active && 'section-icon-active scale-[1.05]',
    className,
  )

  return (
    <div className={shell} aria-hidden>
      {section === 'home' && <Home strokeWidth={STROKE} />}
      {section === 'minhas-leituras' && <Library strokeWidth={STROKE} />}
      {section === 'livros' && <BookMarked strokeWidth={STROKE} />}
      {section === 'cronicas' && <ScrollText strokeWidth={STROKE} />}
      {section === 'musicas' && <Music2 strokeWidth={STROKE} />}
      {section === 'poemas' && <Feather strokeWidth={STROKE} />}
      {section === 'perfil' && <CircleUser strokeWidth={STROKE} />}
      {section === 'admin' && <LayoutDashboard strokeWidth={STROKE} />}
    </div>
  )
}
