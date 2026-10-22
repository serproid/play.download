import { Link } from '@tanstack/react-router'
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
    <div className={cn('mb-2 flex items-center justify-between gap-3', className)}>
      <div>
        <h2 className="text-base font-medium text-foreground">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
            {description}
          </p>
        ) : null}
      </div>
      {to ? (
        <Link
          to={to}
          className="shrink-0 text-[13px] font-medium text-brand hover:underline"
        >
          {linkLabel}
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
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 text-[#5f6368] dark:text-[#9aa0a6]">{icon}</div>
      ) : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-xs text-[13px] leading-5 text-[#5f6368] dark:text-[#9aa0a6]">
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  )
}
