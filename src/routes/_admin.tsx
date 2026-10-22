import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AdminShell } from '@/components/admin/admin-shell'
import { getSession, hasAdminRole } from '@/lib/auth.functions'

export const Route = createFileRoute('/_admin')({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
    if (!hasAdminRole(session.user.role)) {
      throw redirect({ to: '/' })
    }
    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role: session.user.role ?? null,
      },
    }
  },
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
  component: AdminLayout,
})

function AdminLayout() {
  const { user } = Route.useRouteContext()
  if (!user) return null
  return (
    <AdminShell user={user}>
      <Outlet />
    </AdminShell>
  )
}
