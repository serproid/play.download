import { Link } from '@tanstack/react-router'
import type { CatalogApp } from '@/lib/types'
import { cn, formatCount } from '@/lib/utils'
import { AppIcon } from './app-icon'
import { Stars } from './stars'

const typeLabels: Record<CatalogApp['type'], string> = {
  app: 'App',
  game: 'Jogo',
  movie: 'Filme',
  book: 'Livro',
}

export function AppTile({
  app,
  className,
}: {
  app: CatalogApp
  className?: string
}) {
  return (
    <Link
      to="/app/$slug"
      params={{ slug: app.slug }}
      className={cn(
        'flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-lg p-2 text-center outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <AppIcon name={app.name} iconUrl={app.iconUrl} size="card" />
      <div className="w-full">
        <p className="truncate text-[13px] font-medium text-foreground">
          {app.name}
        </p>
        <div className="mt-0.5 flex items-center justify-center gap-1">
          <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
            {app.rating.toFixed(1)}
          </span>
          <Stars value={app.rating} size={10} />
        </div>
      </div>
    </Link>
  )
}

export function AppGridCard({
  app,
  className,
}: {
  app: CatalogApp
  className?: string
}) {
  return (
    <Link
      to="/app/$slug"
      params={{ slug: app.slug }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 hover:bg-muted/50',
        className,
      )}
    >
      <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{app.name}</p>
        <p className="truncate text-xs text-[#5f6368] dark:text-[#9aa0a6]">
          {app.categoryName ?? typeLabels[app.type]}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Stars value={app.rating} size={11} />
          <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
            {app.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function AppRankRow({
  app,
  rank,
  className,
}: {
  app: CatalogApp
  rank?: number
  className?: string
}) {
  return (
    <Link
      to="/app/$slug"
      params={{ slug: app.slug }}
      className={cn(
        'flex items-center gap-3.5 py-3 outline-none hover:bg-muted/40 focus-visible:bg-muted/40',
        className,
      )}
    >
      {typeof rank === 'number' ? (
        <span className="w-3 shrink-0 text-center text-xs text-[#5f6368]">
          {rank}
        </span>
      ) : null}
      <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{app.name}</p>
        <p className="truncate text-xs text-[#5f6368] dark:text-[#9aa0a6]">
          {app.tagline ?? app.categoryName ?? typeLabels[app.type]}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
          {app.rating.toFixed(1)}
        </span>
        <Stars value={app.rating} size={11} />
        <span className="hidden text-[11px] text-[#5f6368] sm:inline dark:text-[#9aa0a6]">
          · {formatCount(app.downloads)}
        </span>
      </div>
    </Link>
  )
}
