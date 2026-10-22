import { createFileRoute } from '@tanstack/react-router'
import { AppForm } from '@/components/app-form'
import { listCategories } from '@/lib/apps.functions'

export const Route = createFileRoute('/_admin/admin/apps/novo')({
  loader: async () => listCategories(),
  component: NewAppPage,
})

function NewAppPage() {
  const categories = Route.useLoaderData()
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">
            Novo app
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Cadastre um título manualmente e defina o status de publicação.
          </p>
        </div>
      </div>
      <AppForm mode="admin" categories={categories} />
    </div>
  )
}
