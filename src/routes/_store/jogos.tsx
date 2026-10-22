import { createFileRoute } from '@tanstack/react-router'
import { CatalogPage } from '@/components/store/catalog-page'
import { listApps, listCategories } from '@/lib/apps.functions'

export const Route = createFileRoute('/_store/jogos')({
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
      type: 'game',
      q: deps.q,
      category: deps.category,
    } }),
    categories: await listCategories(),
  }),
  component: JogosPage,
})

function JogosPage() {
  const { apps, categories } = Route.useLoaderData()
  const search = Route.useSearch()
  return (
    <CatalogPage
      type="game"
      apps={apps}
      categories={categories}
      query={search.q}
      category={search.category}
    />
  )
}
