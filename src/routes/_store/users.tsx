import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowUpRight, Loader2, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { AppIcon } from '@/components/store/app-icon'
import { CopyLinkButton } from '@/components/store/share-link'
import { UserAuthPanel } from '@/components/user-auth-panel'
import { getMySpace } from '@/lib/apps.functions'
import { authClient } from '@/lib/auth-client'
import { hasAdminRoleClient } from '@/lib/roles'
import { formatCount } from '@/lib/utils'
import type { MySpaceData, SessionUser } from '@/lib/types'

export const Route = createFileRoute('/_store/users')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : undefined,
  }),
  loader: async ({ context }) => (context.user ? getMySpace() : null),
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: UsersPage,
})

const statusLabels = {
  pending: 'Em análise',
  published: 'Publicado',
  rejected: 'Rejeitado',
} as const

const statusClasses = {
  pending: 'bg-[#fef7e0] text-[#b06000]',
  published: 'bg-brand-soft text-brand',
  rejected: 'bg-[#fce8e6] text-[#c5221f]',
} as const

function UsersPage() {
  const data = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const { redirect } = Route.useSearch()

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[380px] py-10">
        <h1 className="text-[28px] font-medium tracking-tight text-foreground">
          Entrar
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use a conta criada pelo administrador para acessar e gerenciar a
          página do seu app.
        </p>
        <div className="mt-6">
          <UserAuthPanel redirectTo={redirect} />
        </div>
      </div>
    )
  }

  return <Account data={data ?? { submissions: [] }} user={user} />
}

function Account({ data, user }: { data: MySpaceData; user: SessionUser }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const isAdmin = hasAdminRoleClient(user.role)
  const limit = isAdmin ? 10 : 5
  const atLimit = data.submissions.length >= limit

  async function signOut() {
    setPending(true)
    try {
      await authClient.signOut()
      await router.invalidate()
      await router.navigate({
        to: '/users',
        search: { redirect: undefined },
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-8 py-2">
      <section className="border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-xl font-medium text-white">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="size-full object-cover"
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-medium tracking-tight text-foreground">
              {user.name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {atLimit ? (
            <span className="inline-flex h-10 items-center rounded-full border border-dashed border-border px-4 text-[13px] font-medium text-muted-foreground">
              Limite de {limit} apps atingido
            </span>
          ) : (
            <Link
              to="/adicionar"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-medium text-brand-foreground"
            >
              <PlusCircle className="size-4" />
              Criar página de app
            </Link>
          )}
          {isAdmin ? (
            <Link
              to="/admin/painel"
              className="inline-flex h-10 items-center rounded-full border border-border px-4 text-[13px] font-medium text-brand"
            >
              Painel administrativo
            </Link>
          ) : null}
          <button
            onClick={signOut}
            disabled={pending}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Sair
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-medium tracking-tight text-foreground">
            Minhas páginas
          </h2>
          <span className="text-xs text-muted-foreground">
            {data.submissions.length} de {limit} apps
          </span>
        </div>

        {data.submissions.length > 0 ? (
          <div className="mt-3 divide-y divide-border">
            {data.submissions.map((app) => (
              <div key={app.id} className="flex items-center gap-3 py-4">
                <AppIcon name={app.name} iconUrl={app.iconUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-foreground">
                    {app.name}
                  </p>
                  <p className="truncate text-[13px] text-muted-foreground">
                    {app.tagline ?? app.categoryName ?? 'Página do app'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatCount(app.realDownloads ?? 0)} downloads reais
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClasses[app.status]}`}
                  >
                    {statusLabels[app.status]}
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                    <CopyLinkButton slug={app.slug} />
                    <Link
                      to="/$slug"
                      params={{ slug: app.slug }}
                      className="inline-flex min-h-10 items-center gap-0.5 text-[12px] font-medium text-brand hover:underline"
                    >
                      Ver página
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                    <Link
                      to="/meus-apps/$id"
                      params={{ id: app.id }}
                      className="inline-flex min-h-10 items-center text-[12px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-border px-5 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Você ainda não tem uma página
            </p>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
              Envie seu app para criar uma página própria, com link exclusivo e
              isolado dos demais.
            </p>
            <Link
              to="/adicionar"
              className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-medium text-brand-foreground"
            >
              <PlusCircle className="size-4" />
              Criar minha página
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
