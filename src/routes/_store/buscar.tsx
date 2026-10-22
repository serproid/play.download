import { createFileRoute, Link } from '@tanstack/react-router'
import { PackageOpen, Search } from 'lucide-react'
import { AppGridCard } from '@/components/store/app-cards'
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

const suggestions = [
  'Jogos',
  'Redes sociais',
  'Produtividade',
  'Filmes',
  'Livros',
]

function BuscarPage() {
  const apps: CatalogApp[] = Route.useLoaderData()
  const { q } = Route.useSearch()

  return (
    <div className="space-y-5 animate-rise-in">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Buscar
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Encontre apps, jogos, filmes e livros em um só lugar.
        </p>
      </header>

      <SearchField action="/buscar" defaultValue={q} autoFocus />

      {!q ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">
            Sugestões
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
          <EmptyState
            icon={<Search className="size-6" />}
            title="Digite para começar"
            description="Busque pelo nome do app, jogo, filme ou livro que você procura."
            className="mt-6"
          />
        </div>
      ) : apps.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            {apps.length} {apps.length === 1 ? 'resultado' : 'resultados'} para “
            {q}”
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {apps.map((app) => (
              <AppGridCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<PackageOpen className="size-6" />}
          title="Nenhum resultado encontrado"
          description={`Não encontramos nada para “${q}”. Tente outro termo ou envie o seu app para a plataforma.`}
        >
          <Link
            to="/adicionar"
            className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-xs font-bold text-brand-foreground"
          >
            Adicionar app
          </Link>
        </EmptyState>
      )}
    </div>
  )
}
