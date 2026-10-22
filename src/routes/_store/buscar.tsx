import { createFileRoute } from '@tanstack/react-router'
import { AppRankRow } from '@/components/store/app-cards'
import { SearchField } from '@/components/store/search-field'
import { EmptyState } from '@/components/store/section'
import { listApps } from '@/lib/apps.functions'
import type { CatalogApp } from '@/lib/types'

export const Route = createFileRoute('/_store/buscar')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' && search.q ? search.q : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) =>
    listApps({ data: { q: deps.q, limit: 60 } }),
  component: BuscarPage,
})

function BuscarPage() {
  const apps: CatalogApp[] = Route.useLoaderData()
  const { q } = Route.useSearch()

  return (
    <div className="space-y-4 py-2">
      <h1 className="text-[22px] font-normal text-foreground">Pesquisar</h1>

      <SearchField action="/buscar" defaultValue={q} autoFocus />

      {q && apps.length > 0 ? (
        <>
          <p className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
            {apps.length} {apps.length === 1 ? 'resultado' : 'resultados'} para “
            {q}”
          </p>
          <div className="divide-y divide-border">
            {apps.map((app) => (
              <AppRankRow key={app.id} app={app} />
            ))}
          </div>
        </>
      ) : q ? (
        <EmptyState
          title="Nenhum resultado encontrado"
          description={`Não encontramos nada para “${q}”. Tente outro termo.`}
        />
      ) : (
        <p className="py-8 text-center text-[13px] text-[#5f6368] dark:text-[#9aa0a6]">
          Digite o nome de um app, jogo, filme ou livro.
        </p>
      )}
    </div>
  )
}
