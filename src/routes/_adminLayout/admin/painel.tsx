import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight,
  AppWindow,
  CheckCircle2,
  Download,
  Users,
} from 'lucide-react'
import { AppIcon } from '@/components/store/app-icon'
import { adminListApps, adminStats } from '@/lib/apps.functions'
import type { AdminApp } from '@/lib/types'
import { formatCount } from '@/lib/utils'

export const Route = createFileRoute('/_adminLayout/admin/painel')({
  loader: async () => {
    const [stats, apps] = await Promise.all([adminStats(), adminListApps()])
    return { stats, apps }
  },
  component: AdminDashboard,
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

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

function AdminDashboard() {
  const { stats, apps } = Route.useLoaderData()
  const { user } = Route.useRouteContext()

  const myApps = apps
    .filter((app) => app.submittedBy === user.id)
    .sort((a, b) => b.realDownloads - a.realDownloads)
  const totalDownloads = myApps.reduce(
    (total, app) => total + app.realDownloads,
    0,
  )
  const published = myApps.filter((app) => app.status === 'published').length
  const maxDownloads = Math.max(...myApps.map((app) => app.realDownloads), 1)

  const cards = [
    {
      label: 'Downloads nos meus apps',
      value: numberFormatter.format(totalDownloads),
      icon: Download,
      highlight: true,
    },
    {
      label: 'Meus apps',
      value: formatCount(myApps.length),
      icon: AppWindow,
      highlight: false,
    },
    {
      label: 'Publicados',
      value: formatCount(published),
      icon: CheckCircle2,
      highlight: false,
    },
    {
      label: 'Usuários',
      value: formatCount(stats.users),
      icon: Users,
      highlight: false,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">
            Visão geral
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Acompanhe os downloads dos seus apps.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={
              card.highlight
                ? 'rounded-2xl border border-brand/25 bg-brand-soft p-3.5'
                : 'rounded-2xl border border-border/80 bg-card p-3.5'
            }
          >
            <span
              className={
                card.highlight
                  ? 'flex size-8 items-center justify-center rounded-xl bg-brand text-brand-foreground'
                  : 'flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground'
              }
            >
              <card.icon className="size-4" />
            </span>
            <p
              className={
                card.highlight
                  ? 'mt-3 text-2xl font-extrabold tracking-tight text-brand tabular-nums'
                  : 'mt-3 text-2xl font-extrabold tracking-tight text-foreground tabular-nums'
              }
            >
              {card.value}
            </p>
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border/80 bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Download className="size-4 text-brand" />
              Downloads por app
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Total de downloads em cada página sua.
            </p>
          </div>
          <Link
            to="/admin/apps"
            search={{ status: undefined }}
            className="inline-flex min-h-10 items-center gap-1 text-[11px] font-semibold text-brand hover:underline"
          >
            Gerenciar <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {myApps.length > 0 ? (
          <div className="divide-y divide-border">
            {myApps.map((app) => {
              const percent = Math.round(
                (app.realDownloads / maxDownloads) * 100,
              )
              return (
                <div key={app.id} className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {app.name}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${statusStyles[app.status]}`}
                        >
                          {statusLabels[app.status]}
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {app.tagline ?? app.categoryName ?? 'Página do app'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base font-semibold tabular-nums text-foreground">
                        {numberFormatter.format(app.realDownloads)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        downloads
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <AppWindow className="size-7 text-muted-foreground/50" />
            <p className="mt-2 text-xs font-semibold text-foreground">
              Você ainda não tem apps
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Crie um app para começar a acompanhar os downloads.
            </p>
            <Link
              to="/admin/apps/novo"
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
            >
              Criar app
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-brand/15 bg-gradient-to-r from-brand-soft to-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Usuários e permissões
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Crie contas, promova administradores e bloqueie acessos.
            </p>
          </div>
          <Link
            to="/admin/usuarios"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
          >
            <Users className="size-4" />
            Gerenciar usuários
          </Link>
        </div>
      </section>
    </div>
  )
}
