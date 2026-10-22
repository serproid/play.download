import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AppWindow, Plus, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminAppActions } from '@/components/admin/app-actions'
import { AppIcon } from '@/components/store/app-icon'
import { CopyLinkButton } from '@/components/store/share-link'
import { adminListApps } from '@/lib/apps.functions'
import type { AdminApp } from '@/lib/types'
import { cn, formatCount } from '@/lib/utils'

export const Route = createFileRoute('/_adminLayout/admin/apps/')({
  validateSearch: (search: Record<string, unknown>) => ({
    status:
      search.status === 'pending' ||
      search.status === 'published' ||
      search.status === 'rejected'
        ? search.status
        : undefined,
  }),
  loader: async () => adminListApps(),
  component: AdminAppsPage,
})

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Em análise' },
  { value: 'published', label: 'Publicados' },
  { value: 'rejected', label: 'Rejeitados' },
] as const

const statusStyles: Record<AdminApp['status'], string> = {
  pending: 'bg-[#fdf5e5] text-[#99690d]',
  published: 'bg-brand-soft text-brand',
  rejected: 'bg-[#fdeceb] text-[#b0342a]',
}

const statusLabels: Record<AdminApp['status'], string> = {
  pending: 'Em análise',
  published: 'Publicado',
  rejected: 'Rejeitado',
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function AdminAppsPage() {
  const apps = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>(search.status ?? 'all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return apps.filter((app) => {
      const matchStatus = filter === 'all' ? true : app.status === filter
      const matchQuery = term
        ? `${app.name} ${app.developer ?? ''} ${app.submittedByName ?? ''}`
            .toLowerCase()
            .includes(term)
        : true
      return matchStatus && matchQuery
    })
  }, [apps, filter, query])

  function changeFilter(value: string) {
    setFilter(value)
    void navigate({
      to: '/admin/apps',
      search: {
        status:
          value === 'all'
            ? undefined
            : (value as 'pending' | 'published' | 'rejected'),
      },
      replace: true,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">
            Apps
          </h1>
          <p className="text-[11px] text-muted-foreground">
            {apps.length} títulos no catálogo
          </p>
        </div>
        <Link
          to="/admin/apps/novo"
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
        >
          <Plus className="size-4" />
          Novo app
        </Link>
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-border/80 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, desenvolvedor ou autor..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-brand/40 focus:ring-4 focus:ring-brand/10"
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const count =
              tab.value === 'all'
                ? apps.length
                : apps.filter((app) => app.status === tab.value).length
            return (
              <button
                key={tab.value}
                onClick={() => changeFilter(tab.value)}
                className={cn(
                  'min-h-10 shrink-0 rounded-full px-3 py-2.5 text-[11px] font-semibold transition-colors',
                  filter === tab.value
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label} <span className="opacity-70">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border/80 bg-card">
          <div className="hidden border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-bold tracking-wide text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_0.9fr_auto] sm:gap-3">
            <span>App</span>
            <span>Categoria</span>
            <span>Status</span>
            <span>Downloads</span>
            <span className="w-8" />
          </div>
          <div className="divide-y divide-border">
            {filtered.map((app) => (
              <div
                key={app.id}
                className="flex items-center gap-3 px-3 py-3 sm:grid sm:grid-cols-[minmax(0,2.2fr)_1fr_0.8fr_0.9fr_auto] sm:gap-3 sm:px-4"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <Link
                        to="/admin/apps/$id"
                        params={{ id: app.id }}
                        className="inline-flex min-h-10 items-center truncate text-xs font-semibold text-foreground hover:text-brand"
                      >
                        {app.name}
                      </Link>
                      {app.featured ? (
                        <Star className="size-3 shrink-0 fill-[#f5b301] text-[#f5b301]" />
                      ) : null}
                    </div>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {app.developer ?? 'Sem desenvolvedor'} ·{' '}
                      {dateFormatter.format(new Date(app.createdAt))}
                    </p>
                  </div>
                </div>
                <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                  {app.categoryName ?? 'Sem categoria'}
                </span>
                <span className="hidden sm:block">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[9px] font-bold whitespace-nowrap',
                      statusStyles[app.status],
                    )}
                  >
                    {statusLabels[app.status]}
                  </span>
                </span>
                <span className="hidden text-[11px] text-muted-foreground sm:block">
                  {formatCount(app.realDownloads)}
                </span>
                <div className="flex items-center gap-1 sm:justify-end">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[9px] font-bold sm:hidden',
                      statusStyles[app.status],
                    )}
                  >
                    {statusLabels[app.status]}
                  </span>
                  <CopyLinkButton slug={app.slug} compact />
                  <AdminAppActions app={app} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <AppWindow className="size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm font-semibold text-foreground">
            Nenhum app encontrado
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajuste os filtros ou crie um novo app.
          </p>
        </div>
      )}
    </div>
  )
}
