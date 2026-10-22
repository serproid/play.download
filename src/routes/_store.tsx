import { createFileRoute, Outlet } from '@tanstack/react-router'
import { StoreShell } from '@/components/store/store-shell'
import { getSession } from '@/lib/auth.functions'

export const Route = createFileRoute('/_store')({
  beforeLoad: async () => {
    const session = await getSession()
    return {
      user: session
        ? {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? null,
            role: session.user.role ?? null,
          }
        : null,
    }
  },
  component: StoreLayout,
})

function StoreLayout() {
  const { user } = Route.useRouteContext()
  return (
    <StoreShell user={user}>
      <Outlet />
    </StoreShell>
  )
}
