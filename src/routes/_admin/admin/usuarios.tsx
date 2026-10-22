import { createFileRoute } from '@tanstack/react-router'
import { UsersManager } from '@/components/admin/users-manager'
import { adminListUsers } from '@/lib/apps.functions'

export const Route = createFileRoute('/_admin/admin/usuarios')({
  loader: async () => adminListUsers({ data: {} }),
  component: UsersPage,
})

function UsersPage() {
  const users = Route.useLoaderData()
  return <UsersManager users={users} />
}
