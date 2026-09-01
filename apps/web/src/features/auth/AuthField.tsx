import type { ReactElement } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cloneElement } from 'react'
import { cn } from '@/lib/utils'
import { FieldError, Label } from '@/components/ui/Label'

interface AuthFieldProps {
  label: string
  htmlFor: string
  error?: string
  icon: LucideIcon
  children: ReactElement<{ id?: string; className?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>
}

/** Campo de formulário auth — label, ícone, input e erro (template reutilizável) */
export function AuthField({ label, htmlFor, error, icon: Icon, children }: AuthFieldProps) {
  const errorId = `${htmlFor}-error`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[13px] font-medium text-text">
        {label}
      </Label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-[17px] w-[17px] -translate-y-1/2 text-text-muted/65"
          strokeWidth={1.75}
          aria-hidden
        />
        {cloneElement(children, {
          id: htmlFor,
          className: cn('input-auth pl-10', children.props.className),
          'aria-describedby': error ? errorId : undefined,
          'aria-invalid': error ? true : undefined,
        })}
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  )
}
