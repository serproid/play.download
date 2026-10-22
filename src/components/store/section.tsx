import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SectionHeader({
  title,
  description,
  to,
  linkLabel = 'Ver tudo',
  className,
}: {
  title: string
  description?: string
  to?: string
  linkLabel?: string
  className?: string
}) {
  return (
    <div className={cn('mb-2.5 flex items-end justify-between gap-3', className)}>
      <div>
        <h2 className="text-[17px] font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {to ? (
        <Link
          to={to}
          className="inline-flex shrink-0 items-center gap-1 pb-0.5 text-xs font-semibold text-brand hover:underline"
        >
          {linkLabel}
          <ArrowRight className="size-3.5" />
        </Link>
      ) : null}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
