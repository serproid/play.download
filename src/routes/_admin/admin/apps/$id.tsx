import { createFileRoute, notFound } from '@tanstack/react-router'
import { AppForm } from '@/components/app-form'
import {
  adminGetApp,
  listCategories,
} from '@/lib/apps.functions'

export const Route = createFileRoute('/_admin/admin/apps/$id')({
  loader: async ({ params }) => {
    const [app, categories] = await Promise.all([
      adminGetApp({ data: { id: params.id } }),
      listCategories(),
    ])
    if (!app) throw notFound()
    return { app, categories }
  },
  notFoundComponent: () => (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <p className="text-sm font-semibold">App não encontrado</p>
    </div>
  ),
  component: EditAppPage,
})

function EditAppPage() {
  const { app, categories } = Route.useLoaderData()
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight lg:text-2xl">
          Editar app
        </h1>
        <p className="text-[11px] text-muted-foreground">
          {app.name} · atualizado em{' '}
          {new Intl.DateTimeFormat('pt-BR').format(new Date(app.updatedAt))}
        </p>
      </div>
      <AppForm mode="admin" categories={categories} initial={app} />
    </div>
  )
}
