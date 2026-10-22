import { Link } from '@tanstack/react-router'
import { Download } from 'lucide-react'
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
        'group flex w-[132px] shrink-0 flex-col items-center gap-2 rounded-2xl p-2 text-center outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <AppIcon name={app.name} iconUrl={app.iconUrl} size="card" />
      <div className="w-full space-y-0.5">
        <p className="line-clamp-1 text-[13px] font-semibold text-foreground">
          {app.name}
        </p>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">
          {app.categoryName ?? typeLabels[app.type]}
        </p>
        <div className="flex items-center justify-center gap-1 pt-0.5">
          <Stars value={app.rating} size={11} />
          <span className="text-[10px] text-muted-foreground">
            {app.rating.toFixed(1)}
          </span>
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
        'group flex min-w-0 flex-col rounded-2xl border border-border/70 bg-card p-3.5 shadow-[0_1px_2px_rgba(16,24,20,0.04)] transition-all hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_10px_24px_-16px_rgba(16,24,20,0.4)]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AppIcon name={app.name} iconUrl={app.iconUrl} size="md" />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-semibold text-foreground">
            {app.name}
          </p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {app.categoryName ?? typeLabels[app.type]}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars value={app.rating} size={12} />
            <span className="text-[11px] font-medium text-muted-foreground">
              {app.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-2.5 line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">
        {app.tagline ?? 'Descubra mais sobre este título.'}
      </p>
      <div className="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2">
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Download className="size-3" />
          {formatCount(app.downloads)}
        </span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand">
          {typeLabels[app.type]}
        </span>
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
        'flex items-center gap-3 rounded-2xl px-2 py-2.5 outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      {typeof rank === 'number' ? (
        <span className="w-4 shrink-0 text-center text-[13px] font-semibold text-muted-foreground">
          {rank}
        </span>
      ) : null}
      <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">
          {app.name}
        </p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {app.tagline ?? app.categoryName ?? typeLabels[app.type]}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <Stars value={app.rating} size={10} />
          <span className="text-[10px] text-muted-foreground">
            {app.rating.toFixed(1)} · {formatCount(app.downloads)}
          </span>
        </div>
      </div>
      <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-brand">
        Ver
      </span>
    </Link>
  )
}
