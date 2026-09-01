import { type ReactElement, cloneElement } from 'react'
import { FieldError, Label } from '@/components/ui/Label'

interface FormFieldProps {
  label: string
  htmlFor: string
  error?: string
  required?: boolean
  children: ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>
}

export function FormField({ label, htmlFor, error, required, children }: FormFieldProps) {
  const errorId = `${htmlFor}-error`

  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && ' *'}
      </Label>
      {cloneElement(children, {
        id: htmlFor,
        'aria-describedby': error ? errorId : undefined,
        'aria-invalid': error ? true : undefined,
      })}
      <FieldError id={errorId} message={error} />
    </div>
  )
}
