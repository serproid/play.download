import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpRight,
  Clock3,
  Download,
  Inbox,
  Star,
  Users,
  AppWindow,
  CheckCircle2,
} from 'lucide-react'
import { AdminAppActions, ApproveRejectActions } from '@/components/admin/app-actions'
import { AppIcon } from '@/components/store/app-icon'
import { adminListApps, adminStats } from '@/lib/apps.functions'
import type { AdminApp } from '@/lib/types'
import { formatCount } from '@/lib/utils'

export const Route = createFileRoute('/_admin/admin/')({
  loader: async () => {
    const [stats, apps] = await Promise.all([adminStats(), adminListApps()])
    return { stats, apps }
  },
  component: AdminDashboard,
})

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
})

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
  const pending = apps.filter((app) => app.status === 'pending')
  const recent = apps.slice(0, 6)

  const cards = [
    {
      label: 'Apps publicados',
      value: formatCount(stats.published),
      icon: AppWindow,
      tone: 'bg-brand-soft text-brand',
    },
    {
      label: 'Aguardando análise',
      value: formatCount(stats.pending),
      icon: Clock3,
      tone: 'bg-[#fdf5e5] text-[#99690d]',
    },
    {
      label: 'Downloads totais',
      value: formatCount(stats.downloads),
      icon: Download,
      tone: 'bg-[#eef1fb] text-[#4a63c8]',
    },
    {
      label: 'Usuários',
      value: formatCount(stats.users),
      icon: Users,
      tone: 'bg-[#f4edfb] text-[#7c3aad]',
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between lg:hidden">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Visão geral</h1>
          <p className="text-[11px] text-muted-foreground">
            Gerencie o catálogo e as pessoas da plataforma.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border/80 bg-card p-3.5"
          >
            <span
              className={`flex size-8 items-center justify-center rounded-xl ${card.tone}`}
            >
              <card.icon className="size-4" />
            </span>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
              {card.value}
            </p>
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-2xl border border-border/80 bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Inbox className="size-4 text-brand" />
                Fila de aprovação
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Apps enviados pela comunidade
              </p>
            </div>
            <span className="rounded-full bg-[#fdf5e5] px-2 py-0.5 text-[10px] font-bold text-[#99690d]">
              {pending.length}
            </span>
          </div>

          {pending.length > 0 ? (
            <div className="divide-y divide-border">
              {pending.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center gap-3 px-4 py-3">
                  <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {app.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {app.submittedByName ?? app.developer ?? 'Comunidade'} ·{' '}
                      {dateFormatter.format(new Date(app.createdAt))}
                    </p>
                  </div>
                  <ApproveRejectActions app={app} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <CheckCircle2 className="size-7 text-brand" />
              <p className="mt-2 text-xs font-semibold text-foreground">
                Tudo em dia
              </p>
              <p className="text-[10px] text-muted-foreground">
                Nenhum app aguardando análise.
              </p>
            </div>
          )}

          {pending.length > 5 ? (
            <div className="border-t border-border px-4 py-2.5">
              <Link
                to="/admin/apps"
                search={{ status: 'pending' }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand"
              >
                Ver todos os pendentes <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-border/80 bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Star className="size-4 text-[#f5b301]" />
                Catálogo recente
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Últimos apps adicionados
              </p>
            </div>
            <Link
              to="/admin/apps"
              search={{ status: undefined }}
              className="text-[11px] font-semibold text-brand hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recent.map((app) => (
              <div key={app.id} className="flex items-center gap-3 px-4 py-2.5">
                <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {app.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {formatCount(app.downloads)} downloads · {app.rating.toFixed(1)} ★
                  </p>
                </div>
                <span
                  className={`hidden rounded-full px-2 py-0.5 text-[9px] font-bold sm:inline ${statusStyles[app.status]}`}
                >
                  {statusLabels[app.status]}
                </span>
                <AdminAppActions app={app} />
              </div>
            ))}
          </div>
        </section>
      </div>

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
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
          >
            <Users className="size-4" />
            Gerenciar usuários
          </Link>
        </div>
      </section>
    </div>
  )
}
