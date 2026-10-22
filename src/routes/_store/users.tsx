import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Loader2, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { AppGridCard, AppRankRow } from '@/components/store/app-cards'
import { SectionHeader } from '@/components/store/section'
import { UserAuthPanel } from '@/components/user-auth-panel'
import { getMySpace } from '@/lib/apps.functions'
import { authClient } from '@/lib/auth-client'
import { hasAdminRoleClient } from '@/lib/roles'
import type { MySpaceData, SessionUser } from '@/lib/types'

export const Route = createFileRoute('/_store/users')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : undefined,
    mode:
      search.mode === 'signup'
        ? ('signup' as const)
        : search.mode === 'login'
          ? ('login' as const)
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
  const { redirect, mode } = Route.useSearch()

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[380px] py-10">
        <h1 className="text-[22px] font-normal text-foreground">Sua conta</h1>
        <p className="mt-1 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
          Entre ou crie uma conta para avaliar apps, salvar favoritos e enviar
          publicações.
        </p>
        <div className="mt-6">
          <UserAuthPanel redirectTo={redirect} initialMode={mode} />
        </div>
      </div>
    )
  }

  return (
    <Account data={data ?? { wishlist: [], submissions: [] }} user={user} />
  )
}

function Account({ data, user }: { data: MySpaceData; user: SessionUser }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const isAdmin = hasAdminRoleClient(user.role)

  async function signOut() {
    setPending(true)
    try {
      await authClient.signOut()
      await router.invalidate()
      await router.navigate({
        to: '/users',
        search: { redirect: undefined, mode: undefined },
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-7 py-2">
      <section className="border-b border-border pb-5">
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
            <h1 className="truncate text-xl font-normal text-foreground">
              {user.name}
            </h1>
            <p className="truncate text-sm text-[#5f6368] dark:text-[#9aa0a6]">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            to="/adicionar"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-medium text-white"
          >
            <PlusCircle className="size-4" />
            Adicionar app
          </Link>
          {isAdmin ? (
            <Link
              to="/admin/painel"
              className="inline-flex h-9 items-center rounded-full border border-border px-4 text-[13px] font-medium text-brand"
            >
              Painel administrativo
            </Link>
          ) : null}
          <button
            onClick={signOut}
            disabled={pending}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#5f6368] hover:text-foreground disabled:opacity-60 dark:text-[#9aa0a6]"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Sair
          </button>
        </div>

        <p className="mt-3 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
          {data.wishlist.length} na lista de desejos · {data.submissions.length}{' '}
          apps enviados
        </p>
      </section>

      <section>
        <SectionHeader title="Lista de desejos" />
        {data.wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {data.wishlist.map((app) => (
              <AppGridCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <p className="py-3 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            Sua lista está vazia.
          </p>
        )}
      </section>

      <section>
        <SectionHeader title="Meus envios" />
        {data.submissions.length > 0 ? (
          <div className="divide-y divide-border">
            {data.submissions.map((app) => (
              <div key={app.id} className="py-2">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    to="/meus-apps/$id"
                    params={{ id: app.id }}
                    className="text-[11px] font-medium text-brand hover:underline"
                  >
                    Editar
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClasses[app.status]}`}
                  >
                    {statusLabels[app.status]}
                  </span>
                </div>
                <AppRankRow app={app} />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-3 text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            Nenhum app enviado ainda.
          </p>
        )}
      </section>
    </div>
  )
}
