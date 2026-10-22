import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import {
  Heart,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react'
import { AppGridCard, AppRankRow } from '@/components/store/app-cards'
import { EmptyState, SectionHeader } from '@/components/store/section'
import { getMySpace } from '@/lib/apps.functions'
import { hasAdminRoleClient } from '@/lib/roles'

export const Route = createFileRoute('/_store/minha-conta')({
  beforeLoad: ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  loader: async () => getMySpace(),
  component: MinhaContaPage,
})

const statusLabels = {
  pending: 'Em análise',
  published: 'Publicado',
  rejected: 'Rejeitado',
} as const

const statusClasses = {
  pending: 'bg-[#fdf5e5] text-[#9a6b0f]',
  published: 'bg-brand-soft text-brand',
  rejected: 'bg-[#fdeceb] text-[#b0342a]',
} as const

function MinhaContaPage() {
  const data = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  if (!user) return null

  const initial = user.name.trim().charAt(0).toUpperCase() || 'U'
  const isAdmin = hasAdminRoleClient(user.role)

  return (
    <div className="space-y-6 animate-rise-in">
      <section className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
        <div className="h-20 bg-gradient-to-br from-[#0f9557] via-[#0b7d48] to-[#075b34]" />
        <div className="px-4 pb-4">
          <div className="-mt-8 flex items-end justify-between gap-3">
            <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-brand text-2xl font-bold text-brand-foreground shadow-sm">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <Link
              to="/adicionar"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
            >
              <PlusCircle className="size-4" />
              Adicionar app
            </Link>
          </div>
          <div className="mt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">
                {user.name}
              </h1>
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold text-brand">
                  <ShieldCheck className="size-3" />
                  Admin
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-muted/70 px-3 py-2">
              <p className="text-lg font-bold text-foreground">
                {data.wishlist.length}
              </p>
              <p className="text-[10px] text-muted-foreground">
                na lista de desejos
              </p>
            </div>
            <div className="rounded-xl bg-muted/70 px-3 py-2">
              <p className="text-lg font-bold text-foreground">
                {data.submissions.length}
              </p>
              <p className="text-[10px] text-muted-foreground">
                apps enviados
              </p>
            </div>
          </div>
          {isAdmin ? (
            <Link
              to="/admin"
              className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full border border-brand/25 bg-brand-soft text-xs font-bold text-brand"
            >
              <LayoutDashboard className="size-4" />
              Abrir painel administrativo
            </Link>
          ) : null}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Lista de desejos"
          description="Títulos que você salvou para depois"
        />
        {data.wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {data.wishlist.map((app) => (
              <AppGridCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className="size-6" />}
            title="Sua lista está vazia"
            description="Toque em “Adicionar à lista de desejos” na página de um app para salvá-lo aqui."
          >
            <Link
              to="/apps"
              search={{ q: undefined, category: undefined }}
              className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
            >
              Explorar apps
            </Link>
          </EmptyState>
        )}
      </section>

      <section>
        <SectionHeader
          title="Meus envios"
          description="Acompanhe o status das suas publicações"
        />
        {data.submissions.length > 0 ? (
          <div className="space-y-2">
            {data.submissions.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-border/70 bg-card p-2"
              >
                <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    Enviado em{' '}
                    {new Intl.DateTimeFormat('pt-BR').format(
                      new Date(app.updatedAt),
                    )}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClasses[app.status]}`}
                  >
                    {statusLabels[app.status]}
                  </span>
                </div>
                <AppRankRow app={app} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="size-6" />}
            title="Nenhum app enviado ainda"
            description="Compartilhe seu primeiro aplicativo com a comunidade do Play Download."
          >
            <Link
              to="/adicionar"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
            >
              <PlusCircle className="size-4" />
              Enviar app
            </Link>
          </EmptyState>
        )}
      </section>
    </div>
  )
}
