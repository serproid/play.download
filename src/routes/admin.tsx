import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminLogin } from '@/components/admin/admin-login'
import { getSession, hasAdminRole } from '@/lib/auth.functions'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) return
    if (hasAdminRole(session.user.role)) {
      throw redirect({ to: '/admin/painel' })
    }
    throw redirect({
      to: '/users',
      search: { redirect: undefined },
    })
  },
  head: () => ({
    meta: [
      { title: 'Acesso administrativo — Play Download' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminLogin,
})
