import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/features/app/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  compact?: boolean
}

export function ThemeToggle({ className, compact }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? 'icon' : 'sm'}
      className={cn(
        'shrink-0 rounded-xl border-primary/15 bg-elevated/90 shadow-[var(--shadow-soft)]',
        className,
      )}
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-brand-gold" aria-hidden />
      ) : (
        <Moon className="h-4 w-4 text-brand-navy" aria-hidden />
      )}
      {!compact && (
        <span className="hidden text-xs font-medium sm:inline">
          {isDark ? 'Claro' : 'Escuro'}
        </span>
      )}
    </Button>
  )
}
