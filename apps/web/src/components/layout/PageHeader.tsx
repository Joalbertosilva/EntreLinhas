import { type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  /** Destaque suave — usar só na home */
  welcome?: boolean
}

export function PageHeader({ title, description, actions, welcome }: PageHeaderProps) {
  if (welcome) {
    return (
      <div className="mb-8 overflow-hidden rounded-xl border border-primary/10 bg-surface-warm shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="relative">
            <div className="absolute -left-1 top-0 h-full w-1 rounded-full bg-accent" aria-hidden />
            <h1 className="pl-3 text-2xl font-semibold text-text tracking-normal sm:text-[1.75rem]">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-xl pl-3 text-base leading-relaxed text-text-muted">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-text">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
