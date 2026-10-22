import { createFileRoute } from '@tanstack/react-router'
import { CatalogPage } from '@/components/store/catalog-page'
import { listApps, listCategories } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/apps')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
    category:
      typeof search.category === 'string' && search.category
        ? search.category
        : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q, category: search.category }),
  loader: async ({ deps }) => ({
    apps: await listApps({ data: {
      type: 'app',
      q: deps.q,
      category: deps.category,
    } }),
    categories: await listCategories(),
  }),
  component: AppsPage,
})

function AppsPage() {
  const { apps, categories } = Route.useLoaderData()
  const search = Route.useSearch()
  return (
    <CatalogPage
      type="app"
      apps={apps}
      categories={categories}
      query={search.q}
      category={search.category}
    />
  )
}
